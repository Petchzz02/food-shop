import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import ProfileTabs from './ProfileTabs'

export default async function ProfilePage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const tier = user.points >= 1000 ? { label: 'Gold', color: '#f59e0b', icon: '' }
    : user.points >= 300 ? { label: 'Silver', color: '#6b7280', icon: '' }
    : { label: 'Bronze', color: '#b45309', icon: '' }

  const nextTier = user.points >= 1000 ? null
    : user.points >= 300 ? { name: 'Gold', need: 1000 } : { name: 'Silver', need: 300 }

  const [[addresses], [orderRows], [orderItems], [favorites], [notifRows]] = await Promise.all([
    pool.execute('SELECT * FROM Address WHERE userId = ? ORDER BY isDefault DESC, id DESC', [user.id]),
    pool.execute('SELECT * FROM `Order` WHERE userId = ? ORDER BY createdAt DESC', [user.id]),
    pool.execute(
      'SELECT oi.orderId, oi.quantity, oi.price, p.name FROM OrderItem oi JOIN Product p ON oi.productId = p.id WHERE oi.orderId IN (SELECT id FROM `Order` WHERE userId = ?)',
      [user.id]
    ),
    pool.execute(
      'SELECT p.* FROM Favorite f JOIN Product p ON f.productId = p.id WHERE f.userId = ? ORDER BY f.createdAt DESC',
      [user.id]
    ),
    pool.execute('SELECT * FROM NotificationSetting WHERE userId = ?', [user.id]),
  ]) as any[]

  const itemsByOrder: Record<number, { name: string; quantity: number; price: number }[]> = {}
  for (const row of orderItems as any[]) {
    if (!itemsByOrder[row.orderId]) itemsByOrder[row.orderId] = []
    itemsByOrder[row.orderId].push({ name: row.name, quantity: row.quantity, price: row.price })
  }

  const orders = (orderRows as any[]).map((o: any) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    items: itemsByOrder[o.id] ?? [],
  }))

  const notifSetting = (notifRows as any[])[0] ?? null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', padding: '0 0 60px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)',
        padding: '40px 32px',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 900, color: '#fff', flexShrink: 0,
          }}>
            {user.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '22px', margin: '0 0 4px' }}>{user.name}</h1>
            <p style={{ color: '#fed7aa', fontSize: '13px', margin: '0 0 8px' }}>{user.email}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px' }}>
                {tier.icon} {tier.label} Member
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px' }}>
                 {user.points.toLocaleString()} แต้ม
              </span>
              {nextTier && (
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fed7aa', fontSize: '12px', padding: '4px 12px', borderRadius: '999px' }}>
                  อีก {(nextTier.need - user.points).toLocaleString()} แต้ม  {nextTier.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        <ProfileTabs
          user={{ id: user.id, name: user.name ?? '', email: user.email, phone: (user as any).phone ?? null, points: user.points }}
          addresses={addresses as any[]}
          orders={orders}
          favorites={favorites as any[]}
          notifSetting={notifSetting}
        />
      </div>
    </div>
  )
}
