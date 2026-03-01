// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
    // ยอดขายรายวัน 7 วันล่าสุด
    const [dailyRows] = await pool.execute(`
        SELECT DATE(createdAt) AS date, SUM(total) AS revenue, COUNT(*) AS orders
        FROM \`Order\`
        WHERE status != 'CANCELLED'
          AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
    `) as any[]

    // Top 5 สินค้าขายดี (ทุกเวลา)
    const [topRows] = await pool.execute(`
        SELECT p.name, SUM(oi.quantity) AS totalSold, SUM(oi.quantity * oi.price) AS revenue
        FROM OrderItem oi
        JOIN Product p ON oi.productId = p.id
        JOIN \`Order\` o ON oi.orderId = o.id
        WHERE o.status != 'CANCELLED'
        GROUP BY p.id, p.name
        ORDER BY totalSold DESC
        LIMIT 5
    `) as any[]

    return NextResponse.json({
        dailySales: (dailyRows as any[]).map((r: any) => ({
            date: typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().split('T')[0],
            revenue: Number(r.revenue),
            orders: Number(r.orders),
        })),
        topProducts: (topRows as any[]).map((r: any) => ({
            name: r.name,
            totalSold: Number(r.totalSold),
            revenue: Number(r.revenue),
        })),
    })
}
