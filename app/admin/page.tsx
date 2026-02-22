import pool from '@/lib/db'
import { addProduct } from '@/app/actions'
import { FoodList } from '@/components/FoodList'
import { SubmitButton } from '@/components/SubmitButton'

export default async function AdminPage() {
  const [products] = await pool.execute('SELECT * FROM Product ORDER BY id DESC') as any[]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '0 0 60px' }}>

      {/* Page Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '28px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontWeight: 900, fontSize: '24px', color: '#1f2937', margin: '0 0 4px' }}>
            🛠️ จัดการร้าน
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>เพิ่ม / แก้ไข / ลบเมนูสินค้า</p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Add Product */}
        <div style={{ background: '#ffffff', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', padding: '28px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '16px', color: '#374151', marginBottom: '18px' }}>
            ➕ เพิ่มเมนูใหม่
          </h2>
          <form action={addProduct} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text" name="name"
              placeholder="ชื่อเมนู เช่น แซลมอนดองนอร์เวย์"
              required
              style={{ flex: 1, minWidth: '220px', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
            />
            <input
              type="number" name="price"
              placeholder="ราคา (บาท)"
              required
              style={{ width: '140px', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
            />
            <SubmitButton label="➕ เพิ่มเมนู" />
          </form>
        </div>

        {/* Product List */}
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937', marginBottom: '16px' }}>
            📋 รายการสินค้าทั้งหมด ({(products as any[]).length} รายการ)
          </h2>
          <FoodList products={products} />
        </div>
      </div>
    </div>
  )
}