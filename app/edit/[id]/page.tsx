// app/edit/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { updateProduct } from '@/app/actions'
import { redirect } from 'next/navigation'

export default async function EditPage({ params }: { params: { id: string } }) {
  // 1. ดึง ID จาก URL
  const id = params.id

  // 2. ดึงข้อมูลสินค้าชิ้นนั้นจาก Database มาโชว์ก่อน
  const product = await prisma.product.findUnique({
    where: { id: String(id) }, // ถ้า Schema เป็น Int ให้แก้ตรงนี้เป็น Number(id)
  })

  // ถ้าหาไม่เจอ ให้ดีดกลับหน้าแรก
  if (!product) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">✏️ แก้ไขข้อมูล</h1>

        <form action={updateProduct} className="flex flex-col gap-4">
          {/* ส่ง ID ไปแบบลับๆ เพื่อให้รู้ว่าจะแก้ตัวไหน */}
          <input type="hidden" name="id" value={product.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเมนู</label>
            <input
              type="text"
              name="name"
              defaultValue={product.name} // ใส่ค่าเดิมลงไป
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา</label>
            <input
              type="number"
              name="price"
              defaultValue={product.price} // ใส่ราคาเดิมลงไป
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <a 
              href="/" 
              className="flex-1 text-center py-2 px-4 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              ยกเลิก
            </a>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm"
            >
              บันทึกแก้ไข
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}