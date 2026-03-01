// app/admin/page.tsx
import pool from '@/lib/db'
import { addProduct } from '@/app/actions'
import { FoodList } from '@/components/FoodList'
import { SubmitButton } from '@/components/SubmitButton'

export default async function AdminPage() {
  const [products] = await pool.execute('SELECT * FROM Product ORDER BY id DESC') as any[]

  // Dashboard stats
  const [orderStats] = await pool.execute(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status != 'CANCELLED' THEN total ELSE 0 END) AS revenue
    FROM \`Order\`
  `) as any[]
  const stats = (orderStats as any[])[0] ?? { total: 0, pending: 0, revenue: 0 }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '0 0 60px' }}>

      {/* Page Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '28px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '24px', color: '#1f2937', margin: '0 0 4px' }}>
              🛠️ จัดการร้าน
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>เพิ่ม / แก้ไข / ลบเมนูสินค้า</p>
          </div>
          <a href="/admin/orders" style={{
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            color: '#ffffff', textDecoration: 'none',
            borderRadius: '12px', padding: '10px 20px',
            fontWeight: 700, fontSize: '14px',
            boxShadow: '0 4px 12px rgba(234,88,12,0.3)',
          }}>
            📦 ดูออเดอร์ทั้งหมด
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Dashboard Summary */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <div style={{
            flex: 1, minWidth: '160px',
            background: '#eff6ff', borderRadius: '16px',
            padding: '16px 20px',
            border: '1.5px solid #1d4ed822',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '2px' }}>📋</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#1d4ed8' }}>{stats.total ?? 0}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>ออเดอร์ทั้งหมด</div>
          </div>
          <div style={{
            flex: 1, minWidth: '160px',
            background: '#fefce8', borderRadius: '16px',
            padding: '16px 20px',
            border: '1.5px solid #b4530922',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '2px' }}>⏳</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#b45309' }}>{stats.pending ?? 0}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>รอดำเนินการ</div>
          </div>
          <div style={{
            flex: 1, minWidth: '160px',
            background: '#f0fdf4', borderRadius: '16px',
            padding: '16px 20px',
            border: '1.5px solid #15803d22',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '2px' }}>💰</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d' }}>{(stats.revenue ?? 0).toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>ยอดขายรวม (฿)</div>
          </div>
          <div style={{
            flex: 1, minWidth: '160px',
            background: '#f5f3ff', borderRadius: '16px',
            padding: '16px 20px',
            border: '1.5px solid #7c3aed22',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '2px' }}>🍽️</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed' }}>{(products as any[]).length}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>สินค้าทั้งหมด</div>
          </div>
        </div>

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
            <input
              type="number" name="stock"
              placeholder="สต็อก (ชิ้น)"
              min="0"
              defaultValue="0"
              required
              style={{ width: '120px', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
            />
            <SubmitButton label="➕ เพิ่มเมนู" />
          </form>
        </div>

        {/* Product List */}
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937', marginBottom: '16px' }}>
            📋 รายการสินค้าทั้งหมด ({(products as any[]).length} รายการ)
          </h2>
          <FoodList products={products} isAdmin={true} />
        </div>
      </div>
    </div>
  )
}