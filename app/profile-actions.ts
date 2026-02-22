'use server'

import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

// ── ข้อมูลส่วนตัว ──────────────────────────────────────────────
export async function updateProfile(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()

  if (!name) return { error: 'กรุณากรอกชื่อ' }

  await pool.execute('UPDATE User SET name = ?, phone = ? WHERE id = ?', [name, phone || null, user.id])
  revalidatePath('/profile')
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) return { error: 'กรุณากรอกข้อมูลให้ครบ' }
  if (newPassword.length < 6) return { error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' }
  if (newPassword !== confirmPassword) return { error: 'รหัสผ่านใหม่ไม่ตรงกัน' }

  const [rows] = await pool.execute('SELECT password FROM User WHERE id = ?', [user.id]) as any[]
  const dbUser = (rows as any[])[0]
  const valid = await bcrypt.compare(currentPassword, dbUser.password)
  if (!valid) return { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }

  const hashed = await bcrypt.hash(newPassword, 10)
  await pool.execute('UPDATE User SET password = ? WHERE id = ?', [hashed, user.id])
  return { success: true }
}

// ── ที่อยู่จัดส่ง ───────────────────────────────────────────────
export async function addAddress(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const recipientName = (formData.get('recipientName') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const address = (formData.get('address') as string)?.trim()
  const isDefault = formData.get('isDefault') === 'true'

  if (!recipientName || !phone || !address) return { error: 'กรุณากรอกข้อมูลให้ครบ' }

  if (isDefault) {
    await pool.execute('UPDATE Address SET isDefault = 0 WHERE userId = ?', [user.id])
  }

  await pool.execute(
    'INSERT INTO Address (userId, recipientName, phone, address, isDefault) VALUES (?, ?, ?, ?, ?)',
    [user.id, recipientName, phone, address, isDefault ? 1 : 0]
  )

  revalidatePath('/profile')
  return { success: true }
}

export async function updateAddress(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const id = Number(formData.get('id'))
  const recipientName = (formData.get('recipientName') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const address = (formData.get('address') as string)?.trim()
  const isDefault = formData.get('isDefault') === 'true'

  if (!recipientName || !phone || !address) return { error: 'กรุณากรอกข้อมูลให้ครบ' }

  if (isDefault) {
    await pool.execute('UPDATE Address SET isDefault = 0 WHERE userId = ?', [user.id])
  }

  await pool.execute(
    'UPDATE Address SET recipientName = ?, phone = ?, address = ?, isDefault = ? WHERE id = ? AND userId = ?',
    [recipientName, phone, address, isDefault ? 1 : 0, id, user.id]
  )

  revalidatePath('/profile')
  return { success: true }
}

export async function deleteAddress(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const id = Number(formData.get('id'))
  await pool.execute('DELETE FROM Address WHERE id = ? AND userId = ?', [id, user.id])
  revalidatePath('/profile')
  return { success: true }
}

export async function setDefaultAddress(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const id = Number(formData.get('id'))
  await pool.execute('UPDATE Address SET isDefault = 0 WHERE userId = ?', [user.id])
  await pool.execute('UPDATE Address SET isDefault = 1 WHERE id = ? AND userId = ?', [id, user.id])
  revalidatePath('/profile')
  return { success: true }
}

// ── รายการโปรด ─────────────────────────────────────────────────
export async function toggleFavorite(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'กรุณาเข้าสู่ระบบก่อน' }

  const productId = Number(formData.get('productId'))
  const [rows] = await pool.execute(
    'SELECT id FROM Favorite WHERE userId = ? AND productId = ?',
    [user.id, productId]
  ) as any[]

  if ((rows as any[]).length > 0) {
    await pool.execute('DELETE FROM Favorite WHERE userId = ? AND productId = ?', [user.id, productId])
  } else {
    await pool.execute('INSERT INTO Favorite (userId, productId) VALUES (?, ?)', [user.id, productId])
  }

  revalidatePath('/profile')
  revalidatePath('/')
  return { success: true }
}

export async function removeFavorite(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const productId = Number(formData.get('productId'))
  await pool.execute('DELETE FROM Favorite WHERE userId = ? AND productId = ?', [user.id, productId])
  revalidatePath('/profile')
  return { success: true }
}

// ── การแจ้งเตือน ────────────────────────────────────────────────
export async function updateNotificationSettings(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const promoNotif = formData.get('promoNotif') === '1' ? 1 : 0
  const orderNotif = formData.get('orderNotif') === '1' ? 1 : 0

  await pool.execute(
    `INSERT INTO NotificationSetting (userId, promoNotif, orderNotif)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE promoNotif = VALUES(promoNotif), orderNotif = VALUES(orderNotif)`,
    [user.id, promoNotif, orderNotif]
  )

  revalidatePath('/profile')
  return { success: true }
}

// ── สั่งซ้ำ ────────────────────────────────────────────────────
export async function reorder(formData: FormData) {
  const user = await getSession()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const orderId = Number(formData.get('orderId'))
  const [items] = await pool.execute(
    'SELECT productId, quantity, price FROM OrderItem WHERE orderId = ?',
    [orderId]
  ) as any[]

  if (!(items as any[]).length) return { error: 'ไม่พบรายการ' }

  const total = (items as any[]).reduce((s: number, i: any) => s + i.price * i.quantity, 0)

  const [result] = await pool.execute(
    'INSERT INTO `Order` (total, status, userId) VALUES (?, ?, ?)',
    [total, 'PENDING', user.id]
  ) as any[]
  const newOrderId = (result as any).insertId

  for (const item of items as any[]) {
    await pool.execute(
      'INSERT INTO OrderItem (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
      [newOrderId, item.productId, item.quantity, item.price]
    )
  }

  const earnedPoints = Math.floor(total / 10)
  if (earnedPoints > 0) {
    await pool.execute('UPDATE User SET points = points + ? WHERE id = ?', [earnedPoints, user.id])
  }

  revalidatePath('/profile')
  return { success: true, newOrderId }
}
