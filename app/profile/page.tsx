import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'

export default async function ProfilePage() {
  const user = await getSession()
  if (!user) redirect('/login')

  // ดึงประวัติสั่งซื้อ
  const [orders] = await pool.execute(
    'SELECT * FROM `Order` WHERE userId = ? ORDER BY createdAt DESC LIMIT 10',
    [user.id]
  ) as any[]

  const tier = user.points >= 1000 ? { label: 'Gold', color: '#f59e0b', icon: '👑' }
    : user.points >= 300 ? { label: 'Silver', color: '#6b7280', icon: '🥈' }
    : { label: 'Bronze', color: '#b45309', icon: '🥉' }

  const nextTier = user.points >= 1000 ? null
    : user.points >= 300 ? { name: 'Gold', need: 1000 } : { name: 'Silver', need: 300 }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', padding: '0 0 60px' }}>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Profile Card */}
        <div style={{ background: '#ffffff', borderRadius: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden', border: '1.5px solid #fed7aa' }}>
          <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
              👤
            </div>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '22px', margin: '0 0 4px' }}>{user.name}</h1>
              <p style={{ color: '#fed7aa', fontSize: '13px', margin: 0 }}>{user.email}</p>
              <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', padding: '4px 12px' }}>
                <span>{tier.icon}</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{tier.label} Member</span>
              </div>
            </div>
          </div>

          {/* Points */}
          <div style={{ padding: '24px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px' }}>คะแนนสะสม</p>
                <p style={{ color: '#ea580c', fontSize: '36px', fontWeight: 900, margin: 0, lineHeight: 1 }}>
                  {user.points.toLocaleString()} <span style={{ fontSize: '18px' }}>แต้ม</span>
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>⭐</div>
            </div>

            {nextTier && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  <span>อีก {(nextTier.need - user.points).toLocaleString()} แต้ม เพื่อขึ้น {nextTier.name}</span>
                  <span>{user.points} / {nextTier.need}</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #ea580c, #f97316)',
                    height: '100%', borderRadius: '999px',
                    width: `${Math.min(100, (user.points / nextTier.need) * 100)}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            )}

            {/* วิธีได้แต้ม */}
            <div style={{ marginTop: '20px', background: '#fff7ed', borderRadius: '14px', padding: '14px 16px', fontSize: '13px', color: '#92400e' }}>
              💡 <strong>วิธีสะสมแต้ม:</strong> รับ 1 แต้มทุก 10 บาทที่สั่ง (ต้องล็อกอินก่อนสั่ง)
            </div>
          </div>
        </div>

        {/* Order History */}
        <div style={{ background: '#ffffff', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontWeight: 800, fontSize: '17px', color: '#1f2937', margin: 0 }}>📋 ประวัติการสั่งซื้อ</h2>
          </div>
          <div style={{ padding: '8px 0' }}>
            {(orders as any[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#d1d5db' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>ยังไม่มีประวัติการสั่งซื้อ</p>
              </div>
            ) : (
              (orders as any[]).map((order: any) => (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #f9fafb' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#1f2937', margin: '0 0 2px' }}>ออเดอร์ #{order.id}</p>
                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                      {new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, color: '#ea580c', fontSize: '16px', margin: '0 0 2px' }}>{order.total.toLocaleString()} ฿</p>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>+{Math.floor(order.total / 10)} แต้ม</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
