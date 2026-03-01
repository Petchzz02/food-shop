// app/api/review/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session?.id) {
        return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    const { productId, rating, comment } = await req.json()
    if (!productId || !rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }

    await pool.execute(
        `INSERT INTO Review (userId, productId, rating, comment)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), createdAt = NOW()`,
        [session.id, productId, rating, comment ?? '']
    )

    return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
        return NextResponse.json({ error: 'ต้องระบุ productId' }, { status: 400 })
    }

    const [rows] = await pool.execute(
        `SELECT r.id, r.rating, r.comment, r.createdAt, u.name AS userName
         FROM Review r
         JOIN User u ON r.userId = u.id
         WHERE r.productId = ?
         ORDER BY r.createdAt DESC`,
        [productId]
    ) as any[]

    return NextResponse.json({ reviews: rows as any[] })
}
