import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { sendOrderEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
    try {
        const { orderId, slipUrl } = await req.json()
        if (!orderId || !slipUrl) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

        // บันทึก slip URL ลง Order (เพิ่ม field slipUrl ใน schema ด้วย)
        await pool.execute(
            'UPDATE `Order` SET slipUrl = ?, status = "PAID" WHERE id = ?',
            [slipUrl, orderId]
        )

        // แจ้งเตือน Email มื่ออัพโหลดสลิป
        const [orderRows] = await pool.execute(
            'SELECT o.total, u.name, u.email FROM `Order` o LEFT JOIN User u ON o.userId = u.id WHERE o.id = ?',
            [orderId]
        ) as any[]
        const orderData = (orderRows as any[])[0]
        
        if (orderData) {
            const [itemRows] = await pool.execute(
                'SELECT p.name AS productName, oi.quantity, oi.price FROM OrderItem oi JOIN Product p ON oi.productId = p.id WHERE oi.orderId = ?',
                [orderId]
            ) as any[]
            
            await sendOrderEmail(
                orderId,
                orderData.total,
                itemRows as any[],
                orderData.name || 'ลูกค้า',
                orderData.email,
                slipUrl
            )
        }

        revalidatePath('/admin/orders')
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
    }
}
