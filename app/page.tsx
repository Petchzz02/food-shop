import pool from '@/lib/db'
import { addProduct } from './actions'
import { FoodList } from '@/components/FoodList'
import { SubmitButton } from '@/components/SubmitButton'
import { getSession } from '@/lib/auth'

export default async function Home() {
  const [products] = await pool.execute('SELECT * FROM Product ORDER BY id DESC') as any[]
  const user = await getSession()

  // ดึงแต้มของ user (ถ้า login)
  let userPoints = 0
  if (user?.id) {
    const [pointsRows] = await pool.execute('SELECT points FROM User WHERE id = ?', [user.id]) as any[]
    userPoints = (pointsRows as any[])[0]?.points ?? 0
  }

  // ดึงค่าเฉลี่ยรีวิวต่อสินค้า
  const [reviewRows] = await pool.execute(
    `SELECT productId, ROUND(AVG(rating), 1) AS avgRating, COUNT(*) AS reviewCount
     FROM Review GROUP BY productId`
  ).catch(() => [[]] as any[])
  const reviewMap: Record<number, { avgRating: number; reviewCount: number }> = {}
  for (const r of reviewRows as any[]) {
    reviewMap[r.productId] = { avgRating: r.avgRating, reviewCount: r.reviewCount }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)',
        padding: '56px 32px',
        textAlign: 'center',
        color: '#ffffff',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '12px' }}>🦐</div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          กุ้งดอง &amp; แซลมอนดอง U-ra
        </h1>
        <p style={{ color: '#fed7aa', fontSize: '16px', letterSpacing: '2px' }}>
          ✨ สดใหม่ทุกวัน · รสชาติต้นตำรับ · ส่งถึงบ้าน ✨
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Admin Panel */}
        {user?.role === 'admin' && <details style={{ marginBottom: '36px' }}>
          <summary style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1.5px solid #fed7aa',
            color: '#ea580c',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(234,88,12,0.1)',
            userSelect: 'none',
            fontSize: '14px',
            listStyle: 'none',
          }}>
            <span style={{
              background: '#ea580c', color: '#fff',
              fontSize: '11px', padding: '2px 8px',
              borderRadius: '6px', fontWeight: 800, letterSpacing: '1px'
            }}>ADMIN</span>
            ⚙️ จัดการเมนูสินค้า
          </summary>
          <div style={{
            marginTop: '12px',
            background: '#ffffff',
            border: '1.5px solid #fed7aa',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(234,88,12,0.08)',
          }}>
            <h3 style={{ fontWeight: 700, color: '#374151', marginBottom: '16px', fontSize: '15px' }}>
              ➕ เพิ่มเมนูใหม่
            </h3>
            <form action={addProduct} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text" name="name"
                placeholder="ชื่อเมนู เช่น แซลมอนดองนอร์เวย์"
                required
                style={{
                  flex: 1, minWidth: '220px',
                  border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  padding: '12px 16px', fontSize: '14px', outline: 'none',
                }}
              />
              <input
                type="number" name="price"
                placeholder="ราคา (บาท)"
                required
                style={{
                  width: '140px',
                  border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  padding: '12px 16px', fontSize: '14px', outline: 'none',
                }}
              />
              <input
                type="number" name="stock"
                placeholder="สต็อก (ชิ้น)"
                min="0"
                defaultValue="0"
                required
                style={{
                  width: '120px',
                  border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  padding: '12px 16px', fontSize: '14px', outline: 'none',
                }}
              />
              <SubmitButton label="➕ เพิ่มเมนู" />
            </form>
          </div>
        </details>}

        {/* FoodList */}
        <FoodList products={products} userId={user?.id ?? null} isAdmin={user?.role === 'admin'} userPoints={userPoints} reviewMap={reviewMap} />
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '32px', borderTop: '1px solid #e5e7eb', marginTop: '40px' }}>
        © 2026 U-ra Seafood · Made with ❤️
      </footer>
    </div>
  )
}