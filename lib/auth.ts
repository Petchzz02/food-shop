import { cookies } from 'next/headers'
import pool from './db'

export async function getSession() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session')?.value
  if (!userId) return null

  const [rows] = await pool.execute(
    'SELECT id, name, email, role, points, phone FROM User WHERE id = ?',
    [Number(userId)]
  ) as any[]

  return (rows as any[])[0] || null
}
