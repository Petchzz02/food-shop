// app/admin/dashboard/page.tsx
import pool from '@/lib/db'
import { AdminCharts } from '@/components/AdminCharts'
import Link from 'next/link'

export default async function AdminDashboardPage() {
    const [orderStats] = await pool.execute(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) AS paid,
      SUM(CASE WHEN status = 'SHIPPED' THEN 1 ELSE 0 END) AS shipped,
      SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled,
      SUM(CASE WHEN status != 'CANCELLED' THEN total ELSE 0 END) AS revenue
    FROM \`Order\`
  `) as any[]
    const stats = (orderStats as any[])[0] ?? {}

    const [productRows] = await pool.execute(
        'SELECT COUNT(*) AS total, SUM(stock) AS totalStock FROM Product'
    ) as any[]
    const productStats = (productRows as any[])[0] ?? {}

    const [recentOrders] = await pool.execute(`
    SELECT o.id, o.total, o.status, o.createdAt, o.guestName, o.userId,
           u.name AS userName
    FROM \`Order\` o
    LEFT JOIN User u ON o.userId = u.id
    ORDER BY o.createdAt DESC LIMIT 5
  `) as any[]

    const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
        PENDING: { label: '⏳ รอดำเนินการ', color: '#b45309', bg: '#fefce8' },
        PAID: { label: '💳 ชำระแล้ว', color: '#1d4ed8', bg: '#eff6ff' },
        SHIPPED: { label: '🚚 จัดส่งแล้ว', color: '#15803d', bg: '#f0fdf4' },
        CANCELLED: { label: '❌ ยกเลิก', color: '#b91c1c', bg: '#fef2f2' },
    }

    const summaryCards = [
        { label: 'ออเดอร์ทั้งหมด', value: stats.total ?? 0, icon: '📋', color: '#1d4ed8', bg: '#eff6ff' },
        { label: 'รอดำเนินการ', value: stats.pending ?? 0, icon: '⏳', color: '#b45309', bg: '#fefce8' },
        { label: 'ชำระแล้ว', value: stats.paid ?? 0, icon: '💳', color: '#7c3aed', bg: '#f5f3ff' },
        { label: 'จัดส่งแล้ว', value: stats.shipped ?? 0, icon: '🚚', color: '#15803d', bg: '#f0fdf4' },
        { label: 'ยอดขายรวม (฿)', value: Number(stats.revenue ?? 0).toLocaleString(), icon: '💰', color: '#ea580c', bg: '#fff7ed' },
        { label: 'สินค้าทั้งหมด', value: productStats.total ?? 0, icon: '🍽️', color: '#6b7280', bg: '#f9fafb' },
    ]

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Header */}
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1f2937', margin: '0 0 4px' }}>
                        📊 Dashboard
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>ภาพรวมของร้านค้า</p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {summaryCards.map((card, i) => (
                        <div key={i} style={{
                            flex: '1 1 160px',
                            background: card.bg, borderRadius: '16px',
                            padding: '20px 24px',
                            border: `1.5px solid ${card.color}22`,
                        }}>
                            <div style={{ fontSize: '26px', marginBottom: '4px' }}>{card.icon}</div>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: card.color }}>{card.value}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <AdminCharts />

                {/* Recent Orders */}
                <div style={{ background: '#ffffff', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontWeight: 800, fontSize: '16px', color: '#1f2937', margin: 0 }}>
                            🕐 ออเดอร์ล่าสุด
                        </h2>
                        <Link href="/admin/orders" style={{
                            fontSize: '13px', fontWeight: 700, color: '#ea580c',
                            textDecoration: 'none', background: '#fff7ed',
                            padding: '6px 14px', borderRadius: '8px',
                            border: '1px solid #fed7aa',
                        }}>
                            ดูทั้งหมด →
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(recentOrders as any[]).length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>ยังไม่มีออเดอร์</p>
                        ) : (recentOrders as any[]).map((order: any) => {
                            const st = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING
                            return (
                                <div key={order.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 16px', background: '#f9fafb', borderRadius: '12px',
                                    border: '1px solid #f3f4f6',
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#1f2937' }}>
                                            #{order.id}
                                        </span>
                                        <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
                                            👤 {order.userName || order.guestName || 'ลูกค้าทั่วไป'}
                                        </span>
                                        <span style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '8px' }}>
                                            {new Date(order.createdAt).toLocaleString('th-TH')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            background: st.bg, color: st.color,
                                            fontSize: '11px', fontWeight: 700,
                                            padding: '3px 10px', borderRadius: '999px',
                                        }}>
                                            {st.label}
                                        </span>
                                        <span style={{ fontWeight: 900, color: '#ea580c', fontSize: '15px' }}>
                                            {order.total.toLocaleString()} ฿
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
