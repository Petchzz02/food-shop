// app/api/product/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const id = Number(formData.get('id'))
        const name = (formData.get('name') as string)?.trim()
        const price = Number(formData.get('price')) || 0
        const stock = Number(formData.get('stock')) || 0
        const image = (formData.get('image') as string) || null

        if (!id || !name) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

        await pool.execute(
            'UPDATE Product SET name = ?, price = ?, stock = ?, image = ? WHERE id = ?',
            [name, price, stock, image, id]
        )

        revalidatePath('/')
        revalidatePath('/admin')
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
    }
}
