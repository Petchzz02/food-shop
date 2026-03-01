// app/actions.ts
'use server'

import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { notifyDiscord } from '@/lib/discord'

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  const stock = Number(formData.get('stock')) || 0

  await pool.execute('INSERT INTO Product (name, price, stock) VALUES (?, ?, ?)', [name, price, stock])

  revalidatePath('/')
}

export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'))

  await pool.execute('DELETE FROM Product WHERE id = ?', [id])

  revalidatePath('/')
}

export async function updateProduct(formData: FormData) {
  const id = Number(formData.get('id'))
  const name = formData.get('name') as string
  const price = Number(formData.get('price')) || 0
  const stock = Number(formData.get('stock')) || 0

  await pool.execute('UPDATE Product SET name = ?, price = ?, stock = ? WHERE id = ?', [name, price, stock, id])

  redirect('/')
}

export async function submitOrder(
  cartItems: { id: number; count: number }[],
  usePoints: number = 0,
  customerPhone: string = '',
  guestInfo?: { name: string; phone: string; address: string }
) {
  let total = 0
  const orderItemsData: { productId: number; productName: string; quantity: number; price: number }[] = []

  // ✅ เช็คสต็อกก่อนสั่ง
  for (const item of cartItems) {
    const [rows] = await pool.execute('SELECT * FROM Product WHERE id = ?', [item.id]) as any[]
    const product = (rows as any[])[0]

    if (!product) return { success: false, error: `ไม่พบสินค้า id ${item.id}` }
    if (product.stock < item.count) {
      return { success: false, error: `สินค้า "${product.name}" มีสต็อกเหลือ ${product.stock} ชิ้น` }
    }

    total += product.price * item.count
    orderItemsData.push({ productId: product.id, productName: product.name, quantity: item.count, price: product.price })
  }

  // เช็ค session เพื่อเชื่อม order กับ user
  const session = await getSession()
  const userId = session?.id ?? null
  const isAdmin = session?.role === 'ADMIN'

  // ✅ แลกแต้มส่วนลด (1 แต้ม = 1 บาท) — เฉพาะ user ที่ login (ที่ไม่ใช่ admin สั่ง)
  let pointsDiscount = 0
  if (userId && !isAdmin && usePoints > 0) {
    const [userRows] = await pool.execute('SELECT points FROM User WHERE id = ?', [userId]) as any[]
    const currentPoints = (userRows as any[])[0]?.points ?? 0
    const actualUsePoints = Math.min(usePoints, currentPoints, total)
    pointsDiscount = actualUsePoints
    total = Math.max(0, total - pointsDiscount)
  }

  // ✅ หา targetUserId สำหรับสะสมแต้ม
  // - ถ้า admin สั่ง: ดูจากเบอร์โทรเท่านั้น ถ้าไม่กรอก = ไม่เชื่อม (null)
  // - ถ้า login ปกติ: ใช้ userId ตัวเอง
  let targetUserId: number | null = null
  let displayName = 'ลูกค้าทั่วไป'

  if (isAdmin) {
    if (customerPhone.trim()) {
      const [phoneRows] = await pool.execute(
        'SELECT id, name FROM User WHERE phone = ?',
        [customerPhone.trim()]
      ) as any[]
      const phoneUser = (phoneRows as any[])[0]
      if (phoneUser) {
        targetUserId = phoneUser.id
        displayName = phoneUser.name ?? 'ลูกค้า'
      }
    }
  } else if (userId) {
    targetUserId = userId
    const [nameRows] = await pool.execute('SELECT name FROM User WHERE id = ?', [userId]) as any[]
    displayName = (nameRows as any[])[0]?.name ?? 'สมาชิก'
  }

  // ✅ บันทึก order — ถ้าไม่มีเบอร์โทร ให้ userId = null (ลูกค้าทั่วไป)
  const orderUserId = targetUserId ?? null

  let gName = null
  let gPhone = null
  let gAddress = null

  if (!userId && !isAdmin) {
    gName = guestInfo?.name || null
    gPhone = guestInfo?.phone || null
    gAddress = guestInfo?.address || null
    if (gName) displayName = gName
  }

  const [result] = await pool.execute(
    'INSERT INTO `Order` (total, status, userId, guestName, guestPhone, guestAddress) VALUES (?, ?, ?, ?, ?, ?)',
    [total, 'PENDING', orderUserId, gName, gPhone, gAddress]
  ) as any[]
  const orderId = (result as any).insertId

  for (const orderItem of orderItemsData) {
    await pool.execute(
      'INSERT INTO OrderItem (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, orderItem.productId, orderItem.quantity, orderItem.price]
    )
    // ✅ ตัดสต็อกอัตโนมัติ
    await pool.execute(
      'UPDATE Product SET stock = stock - ? WHERE id = ?',
      [orderItem.quantity, orderItem.productId]
    )
  }

  // ✅ จัดการแต้ม
  const earnedPoints = targetUserId ? Math.floor(total / 50) : 0
  if (userId && !isAdmin && pointsDiscount > 0) {
    await pool.execute(
      'UPDATE User SET points = points - ? WHERE id = ?',
      [pointsDiscount, userId]
    )
  }
  // ไม่แจกแต้มทันที จะแจกเมื่อสถานะเป็นจัดส่งแล้ว (SHIPPED)

  // ✅ แจ้งเตือน Discord
  await notifyDiscord(
    orderId,
    total,
    orderItemsData.map((x) => ({ productName: x.productName, quantity: x.quantity, price: x.price })),
    displayName
  )

  revalidatePath('/')
  return { success: true, earnedPoints, pointsDiscount }
}
