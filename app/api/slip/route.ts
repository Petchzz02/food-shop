// app/api/slip/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
    try {
        const { orderId, slipUrl } = await req.json()
        if (!orderId || !slipUrl) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

        // บันทึก slip URL ลง Order (เพิ่ม field slipUrl ใน schema ด้วย)
        await pool.execute(
            'UPDATE `Order` SET slipUrl = ?, status = "PAID" WHERE id = ?',
            [slipUrl, orderId]
        )

        revalidatePath('/admin/orders')
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
    }
}
