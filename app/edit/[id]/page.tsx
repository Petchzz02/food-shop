// app/edit/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { updateProduct } from '@/app/actions'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/components/SubmitBotton'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. ดึง ID จาก URL
  const {id} = await params

  // 2. ดึงข้อมูลสินค้าชิ้นนั้นจาก Database มาโชว์ก่อน
  const product = await prisma.product.findUnique({
    where: { id: Number(id) }, 
  })

  // ถ้าหาไม่เจอ ให้ดีดกลับหน้าแรก
  if (!product) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-orange-100">

          {/* หัวข้อ */}
        <div className="text-center mb-6">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justity center mx-auto mb-4 text-3xl">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">✏️ แก้ไขข้อมูล</h1></div>
        </div>

        <form action={updateProduct} className="flex flex-col gap-4">
          {/* ส่ง ID ไปแบบลับๆ เพื่อให้รู้ว่าจะแก้ตัวไหน */}
          <input type="hidden" name="id" value={product.id} />
        
          {/* ช่องกรอกชื่อ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเมนู</label>
            <input
              type="text"
              name="name"
              defaultValue={product.name} // ใส่ค่าเดิมลงไป

              placeholder='เช่น ปลาแซลมอน'
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
          {/* ช่องกรอกราคา */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา</label>
            <input
              type="number"
              name="price"
              defaultValue={product.price} // ใส่ราคาเดิมลงไป
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
            {/*ปุ่มกด (Action Button) */}
          <div className="flex gap-2 mt-4">
            <a 
              href="/" 
              className="flex-1 text-center py-2.5 px-4 rounded-lg border border-gray-300 text-gray-300 text-gray-600 font-medium hover:bg-gray-100 teransition-colors"
            >
              ยกเลิก
            </a>

            {/* ปุ่ม SubmitButton ที่มี Loading State */}
            <div className="flex-1">
              <SubmitButton label="บันทึกแก้ไข" />
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

