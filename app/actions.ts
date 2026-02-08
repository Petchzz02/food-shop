// app/actions.ts
'use server' // บรรทัดนี้สำคัญมาก! บอก Next.js ว่านี่คือโค้ดฝั่ง Server

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addProduct(formData: FormData) {
  // 1. ดึงค่าจากฟอร์ม
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))

  // 2. บันทึกลง Database
  // (เช็คชื่อ model ดีๆ นะครับ ถ้าของคุณเป็น food หรือ user ให้แก้ตรง prisma.product)
  await prisma.product.create({
    data: {
      name: name,
      price: price,
    },
  })

  // 3. สั่งให้หน้าเว็บรีเฟรชข้อมูลทันที (ไม่ต้องกด F5 เอง)
  revalidatePath('/')
}
// ... โค้ดเดิม (addProduct) อยู่ข้างบน ...

export async function deleteProduct(formData: FormData) {
  // 1. ดึง ID ที่ส่งมาจากปุ่มลบ
  const id = formData.get('id')
  const idToDelete = Number(id) // แปลงเป็น number เพราะ id ใน schema เป็น Int

  // 2. สั่งลบข้อมูลออกจาก Database
  await prisma.product.delete({
    where: { id: idToDelete },
  })

  // 3. รีเฟรชหน้าจอ
  revalidatePath('/')
}
// app/actions.ts (เพิ่มต่อท้าย)

export async function updateProduct(formData: FormData) {
  // 1. รับค่าจากฟอร์ม
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const price = formData.get('price')

  // 2. อัปเดตข้อมูลลง Database
  await prisma.product.update({
    where: { id: String(id) }, // ถ้า ID คุณเป็น Int ให้แก้เป็น Number(id)
    data: {
      name: name,
      price: Number(price),
    },
  })

  // 3. กลับไปหน้าแรก
  redirect('/')
}