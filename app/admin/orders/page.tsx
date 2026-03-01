// app/admin/orders/page.tsx
import pool from '@/lib/db'
import { updateOrderStatus } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: '⏳ รอดำเนินการ', color: '#b45309', bg: '#fefce8' },
    PAID: { label: '💳 ชำระแล้ว', color: '#1d4ed8', bg: '#eff6ff' },
    SHIPPED: { label: '🚚 จัดส่งแล้ว', color: '#15803d', bg: '#f0fdf4' },
    CANCELLED: { label: '❌ ยกเลิก', color: '#b91c1c', bg: '#fef2f2' },
}

const NEXT_STATUS: Record<string, string> = {
    PENDING: 'PAID',
    PAID: 'SHIPPED',
    SHIPPED: 'SHIPPED',
    CANCELLED: 'CANCELLED',
}

export default async function AdminOrdersPage() {
    // ดึงออเดอร์ทั้งหมด พร้อม user + phone + ที่อยู่จัดส่ง
    const [orders] = await pool.execute(`
    SELECT o.id, o.total, o.status, o.createdAt, o.slipUrl,
           o.guestName, o.guestPhone, o.guestAddress, o.userId,
           u.name AS userName, u.email AS userEmail, u.phone AS userPhone,
           a.recipientName AS shipName, a.phone AS shipPhone, a.address AS shipAddress
    FROM \`Order\` o
    LEFT JOIN User u ON o.userId = u.id
    LEFT JOIN Address a ON a.userId = o.userId AND a.isDefault = 1
    ORDER BY o.createdAt DESC
  `) as any[]

    // ดึง items แยกต่างหาก
    const [items] = await pool.execute(`
    SELECT oi.orderId, p.name AS productName, oi.quantity, oi.price
    FROM OrderItem oi
    JOIN Product p ON oi.productId = p.id
  `) as any[]

    // จัดกลุ่ม items ตาม orderId
    const itemsByOrder: Record<number, any[]> = {}
    for (const item of items as any[]) {
        if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = []
        itemsByOrder[item.orderId].push(item)
    }

    const orderList = orders as any[]

    // Summary stats
    const totalRevenue = orderList
        .filter((o: any) => o.status !== 'CANCELLED')
        .reduce((s: number, o: any) => s + o.total, 0)
    const pendingCount = orderList.filter((o: any) => o.status === 'PENDING').length

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <a href="/admin" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                            ← กลับ Admin
                        </a>
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1f2937', margin: 0 }}>
                        📦 รายการออเดอร์ทั้งหมด
                    </h1>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'ออเดอร์ทั้งหมด', value: orderList.length, icon: '📋', color: '#1d4ed8', bg: '#eff6ff' },
                        { label: 'รอดำเนินการ', value: pendingCount, icon: '⏳', color: '#b45309', bg: '#fefce8' },
                        { label: 'ยอดรวม (บาท)', value: totalRevenue.toLocaleString(), icon: '💰', color: '#15803d', bg: '#f0fdf4' },
                    ].map((card, i) => (
                        <div key={i} style={{
                            flex: 1, minWidth: '160px',
                            background: card.bg, borderRadius: '16px',
                            padding: '20px 24px',
                            border: `1.5px solid ${card.color}22`,
                        }}>
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{card.icon}</div>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: card.color }}>{card.value}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Orders Table */}
                {orderList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
                        <div style={{ fontSize: '52px', marginBottom: '12px' }}>📭</div>
                        <p style={{ fontWeight: 600 }}>ยังไม่มีออเดอร์</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orderList.map((order: any) => {
                            const st = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING
                            const nextSt = NEXT_STATUS[order.status]
                            const orderItems = itemsByOrder[order.id] ?? []
                            const canAdvance = order.status !== 'SHIPPED' && order.status !== 'CANCELLED'

                            return (
                                <div key={order.id} style={{
                                    background: '#ffffff', borderRadius: '20px',
                                    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                                    border: '1.5px solid #e5e7eb',
                                    overflow: 'hidden',
                                }}>
                                    {/* Order Header */}
                                    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '16px', color: '#1f2937' }}>
                                                    ออเดอร์ #{order.id}
                                                </span>
                                                <span style={{
                                                    background: st.bg, color: st.color,
                                                    fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                                                }}>
                                                    {st.label}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>
                                                👤 {order.userName || order.guestName || 'Guest'}
                                                {!order.userId && <span style={{ color: '#ea580c', fontWeight: 700, marginLeft: '6px', fontSize: '11px', background: '#fff7ed', padding: '2px 8px', borderRadius: '4px' }}>ไม่เป็นสมาชิก</span>}
                                                {order.userEmail && <span style={{ color: '#6b7280', fontWeight: 400 }}> ({order.userEmail})</span>}
                                            </div>
                                            {(order.userPhone || order.guestPhone) && (
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                                    📞 {order.userPhone || order.guestPhone}
                                                </div>
                                            )}
                                            {(order.shipAddress || order.guestAddress) && (
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', maxWidth: '320px' }}>
                                                    📍 {order.shipName || order.guestName} ({order.shipPhone || order.guestPhone}) — {order.shipAddress || order.guestAddress}
                                                </div>
                                            )}
                                            {order.slipUrl && (
                                                <div style={{ marginTop: '6px' }}>
                                                    <a href={order.slipUrl} target="_blank" rel="noreferrer" style={{
                                                        fontSize: '12px', color: '#1d4ed8', fontWeight: 700,
                                                        textDecoration: 'none',
                                                        background: '#eff6ff', borderRadius: '6px',
                                                        padding: '3px 10px',
                                                    }}>
                                                        🧾 ดูสลิปโอนเงิน
                                                    </a>
                                                </div>
                                            )}
                                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                                🕐 {new Date(order.createdAt).toLocaleString('th-TH')}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 900, fontSize: '22px', color: '#ea580c' }}>
                                                {order.total.toLocaleString()} ฿
                                            </div>
                                            {/* Update Status Form */}
                                            {canAdvance && (
                                                <form action={updateOrderStatus} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                                    <input type="hidden" name="orderId" value={order.id} />
                                                    <input type="hidden" name="status" value={nextSt} />
                                                    <SubmitButton
                                                        label={nextSt === 'PAID' ? '✅ ทำเครื่องหมาย: ชำระแล้ว' : '🚚 ทำเครื่องหมาย: จัดส่งแล้ว'}
                                                    />
                                                </form>
                                            )}
                                            {order.status === 'PENDING' && (
                                                <form action={updateOrderStatus} style={{ marginTop: '6px' }}>
                                                    <input type="hidden" name="orderId" value={order.id} />
                                                    <input type="hidden" name="status" value="CANCELLED" />
                                                    <button type="submit" style={{
                                                        background: 'none', border: 'none',
                                                        color: '#ef4444', fontSize: '12px', cursor: 'pointer',
                                                        fontWeight: 600, padding: '4px',
                                                    }}>
                                                        ❌ ยกเลิกออเดอร์
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    {orderItems.length > 0 && (
                                        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 24px', background: '#f9fafb' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {orderItems.map((item: any, idx: number) => (
                                                    <span key={idx} style={{
                                                        background: '#ffffff', border: '1px solid #e5e7eb',
                                                        borderRadius: '8px', padding: '4px 10px',
                                                        fontSize: '12px', color: '#374151', fontWeight: 600,
                                                    }}>
                                                        {item.productName} × {item.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
