  import { prisma } from '@/lib/prisma'
import { addProduct } from '@/app/actions'
import {FoodList} from '@/components/FoodList'
import { SubmitButton } from '@/components/SubmitButton'

export default async function Home() {
  // ดึงข้อมูลสินค้าจากฐานข้อมูล
  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' }
  })
  
  return (
    <main className="min-h-screen bg-orange-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* หัวข้อร้าน */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-orange-600 drop-shadow-md mb-3">🦐 กุ้งดอง แซลมอนดอง U-ra</h1>
          <p className="text-gray-500 text-lg uppercase tracking-widest">Premium Pickled Seafood Service</p>
        </div>

        {/* ส่วนจัดการหลังบ้าน (เพิ่มเมนู) */}
        <div className="bg-white p-8 rounded-3xl shadow-md mb-16 border border-orange-100 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-2">
            <span className="bg-orange-500 text-white p-1 rounded-lg text-sm">ADMIN</span>
            เพิ่มเมนูสินค้าใหม่
          </h3>
          <form action={addProduct} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              name="name" 
              placeholder="ชื่อเมนู (เช่น แซลมอนดองนอร์เวย์)" 
              required 
              className="flex-1 border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
            />
            <input 
              type="number" 
              name="price" 
              placeholder="ราคา" 
              required 
              className="w-full sm:w-36 border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
            />
            <SubmitButton label="เพิ่มเมนู" />
          </form>
        </div>

        {/* ส่วนหน้าบ้าน (แสดงรายการสินค้าพร้อมตะกร้า) */}
        <FoodList products={products} />

      </div>
    </main>
  )
}