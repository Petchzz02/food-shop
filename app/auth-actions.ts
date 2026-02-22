'use server'

import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) return { error: 'กรุณากรอกข้อมูลให้ครบ' }
  if (password.length < 6) return { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }

  // เช็คว่า email ซ้ำไหม
  const [existing] = await pool.execute('SELECT id FROM User WHERE email = ?', [email]) as any[]
  if ((existing as any[]).length > 0) return { error: 'อีเมลนี้ถูกใช้งานแล้ว' }

  const hashed = await bcrypt.hash(password, 10)
  const [result] = await pool.execute(
    'INSERT INTO User (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashed]
  ) as any[]

  const userId = (result as any).insertId
  const cookieStore = await cookies()
  cookieStore.set('session', String(userId), { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  redirect('/')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'กรุณากรอกข้อมูลให้ครบ' }

  const [rows] = await pool.execute('SELECT * FROM User WHERE email = ?', [email]) as any[]
  const user = (rows as any[])[0]
  if (!user) return { error: 'ไม่พบบัญชีผู้ใช้นี้' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'รหัสผ่านไม่ถูกต้อง' }

  const cookieStore = await cookies()
  cookieStore.set('session', String(user.id), { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/')
}

export async function adminLogin(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (username !== 'admin01' || password !== 'admin') {
    return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 ชั่วโมง
  })

  redirect('/admin')
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/')
}
