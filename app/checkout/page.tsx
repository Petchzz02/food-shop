// app/checkout/page.tsx
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CheckoutForm } from './CheckoutForm'
import pool from '@/lib/db'

export default async function CheckoutPage() {
    const user = await getSession()
    if (!user) redirect('/login')

    // ดึงออเดอร์ล่าสุดของ user ที่ยังเป็น PENDING
    const [orders] = await pool.execute(
        `SELECT o.id, o.total, o.createdAt FROM \`Order\` o
     WHERE o.userId = ? AND o.status = 'PENDING'
     ORDER BY o.createdAt DESC LIMIT 1`,
        [user.id]
    ) as any[]

    const latestOrder = (orders as any[])[0] ?? null

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
            <div style={{ width: '100%', maxWidth: '520px' }}>
                <CheckoutForm order={latestOrder} userEmail={user.email ?? ''} userName={user.name ?? ''} />
            </div>
        </div>
    )
}
