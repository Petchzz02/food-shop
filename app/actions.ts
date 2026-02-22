// app/actions.ts
'use server'

import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))

  await pool.execute('INSERT INTO Product (name, price) VALUES (?, ?)', [name, price])

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

  await pool.execute('UPDATE Product SET name = ?, price = ? WHERE id = ?', [name, price, id])

  redirect('/')
}

export async function submitOrder(cartItems: { id: number; count: number }[]) {
  let total = 0
  const orderItemsData: { productId: number; quantity: number; price: number }[] = []

  for (const item of cartItems) {
    const [rows] = await pool.execute('SELECT * FROM Product WHERE id = ?', [item.id]) as any[]
    const product = (rows as any[])[0]
    if (product) {
      total += product.price * item.count
      orderItemsData.push({ productId: product.id, quantity: item.count, price: product.price })
    }
  }

  // เช็ค session เพื่อเชื่อม order กับ user
  const session = await getSession()
  const userId = session?.id ?? null

  const [result] = await pool.execute(
    'INSERT INTO `Order` (total, status, userId) VALUES (?, ?, ?)',
    [total, 'PENDING', userId]
  ) as any[]
  const orderId = (result as any).insertId

  for (const orderItem of orderItemsData) {
    await pool.execute(
      'INSERT INTO OrderItem (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, orderItem.productId, orderItem.quantity, orderItem.price]
    )
  }

  // ให้คะแนน: 1 แต้มต่อทุก 10 บาท
  if (userId) {
    const earnedPoints = Math.floor(total / 10)
    if (earnedPoints > 0) {
      await pool.execute('UPDATE User SET points = points + ? WHERE id = ?', [earnedPoints, userId])
    }
  }

  revalidatePath('/')
  return { success: true, earnedPoints: userId ? Math.floor(total / 10) : 0 }
}