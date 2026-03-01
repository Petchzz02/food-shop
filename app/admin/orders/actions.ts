// app/admin/orders/actions.ts
'use server'

import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(formData: FormData): Promise<void> {
    const orderId = Number(formData.get('orderId'))
    const status = formData.get('status') as string

    const allowed = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']
    if (!allowed.includes(status)) return

    // ✅ ถ้ายกเลิก → คืนสต็อกให้สินค้าทุกรายการในออเดอร์
    if (status === 'CANCELLED') {
        const [items] = await pool.execute(
            'SELECT productId, quantity FROM OrderItem WHERE orderId = ?',
            [orderId]
        ) as any[]

        for (const item of items as any[]) {
            await pool.execute(
                'UPDATE Product SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.productId]
            )
        }
    }

    // ✅ ถ้าเปลี่ยนสถานะเป็น SHIPPED และสถานะเดิมไม่ใช่ ให้แจกแต้ม (50 บาท = 1 แต้ม)
    if (status === 'SHIPPED') {
        const [existing] = await pool.execute('SELECT status, total, userId FROM `Order` WHERE id = ?', [orderId]) as any[]
        const orderInfo = existing[0]
        if (orderInfo && orderInfo.status !== 'SHIPPED' && orderInfo.userId) {
            const pts = Math.floor(orderInfo.total / 50)
            if (pts > 0) {
                await pool.execute('UPDATE User SET points = points + ? WHERE id = ?', [pts, orderInfo.userId])
            }
        }
    }

    await pool.execute('UPDATE `Order` SET status = ? WHERE id = ?', [status, orderId])
    revalidatePath('/admin/orders')
    revalidatePath('/')
}
