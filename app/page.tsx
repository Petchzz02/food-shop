// app/page.tsx
import { prisma } from '@/lib/prisma'
import { addProduct, deleteProduct } from './actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' }
  })

  return (
    <main className="min-h-screen bg-orange-50 py-10"> {/* เปลี่ยนพื้นหลังเป็นสีส้มนวลๆ ให้เข้ากับสีแซลมอน */}
      <div className="max-w-2xl mx-auto px-4">
        
        {/* หัวข้อโปรเจกต์ */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-orange-600 drop-shadow-sm">🦐 กุ้งดอง แซลมอนดอง U-ra</h1>
          <p className="text-gray-500 mt-2">ระบบจัดการออเดอร์หน้าร้าน</p>
        </div>

        {/* --- ส่วนฟอร์มเพิ่มข้อมูล (Card) --- */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-orange-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">✨ เพิ่มเมนูใหม่</h3>
          
          <form action={addProduct} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              name="name" 
              placeholder="ชื่อเมนู (เช่น แซลมอนดองไซส์ L)" 
              required 
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            
            <input 
              type="number" 
              name="price" 
              placeholder="ราคา" 
              required 
              className="w-full sm:w-32 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            
            <SubmitButton label="เพิ่มเมนู" />
          </form>
        </div>

        {/* --- ส่วนแสดงรายการ --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">📦 รายการสินค้า ({products.length})</h3>
          
          {products.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
              ยังไม่มีเมนู... ลองเพิ่มกุ้งดองดูสิ!
            </div>
          ) : (
            <ul className="grid gap-3">
              {products.map((item) => (
                <li key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                  
                  {/* ฝั่งซ้าย: ชื่ออาหาร */}
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-full text-2xl">
                      🍱
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                      <p className="text-xs text-gray-400">ID: {item.id}</p>
                    </div>
                  </div>

                  {/* ฝั่งขวา: ราคา + ปุ่มแก้ไข + ปุ่มลบ */}
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-orange-600 text-xl">{item.price}.-</span>
                    
                    {/* ปุ่มแก้ไข */}
                    <Link 
                      href={`/edit/${item.id}`} 
                      className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-2 rounded-full transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </Link>

                    {/* ปุ่มลบ */}
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={item.id} />
                      <button 
                        type="submit" 
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="ลบรายการ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </form>
                  </div>

                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  )
}