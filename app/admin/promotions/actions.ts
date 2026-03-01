// app/admin/promotions/actions.ts
'use server'

import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addPromotion(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const isActive = formData.get('isActive') === 'on' ? 1 : 0

    await pool.execute(
        'INSERT INTO Promotion (title, description, imageUrl, isActive) VALUES (?, ?, ?, ?)',
        [title, description, imageUrl, isActive]
    )

    revalidatePath('/admin/promotions')
    revalidatePath('/promotions')
    revalidatePath('/')
}

export async function updatePromotion(formData: FormData) {
    const id = Number(formData.get('id'))
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const isActive = formData.get('isActive') === 'on' ? 1 : 0

    await pool.execute(
        'UPDATE Promotion SET title = ?, description = ?, imageUrl = ?, isActive = ? WHERE id = ?',
        [title, description, imageUrl, isActive, id]
    )

    revalidatePath('/admin/promotions')
    revalidatePath('/promotions')
    revalidatePath('/')
}

export async function deletePromotion(formData: FormData) {
    const id = Number(formData.get('id'))

    await pool.execute('DELETE FROM Promotion WHERE id = ?', [id])

    revalidatePath('/admin/promotions')
    revalidatePath('/promotions')
    revalidatePath('/')
}

export async function togglePromotionStatus(formData: FormData) {
    const id = Number(formData.get('id'))
    const isActive = Number(formData.get('isActive'))

    await pool.execute('UPDATE Promotion SET isActive = ? WHERE id = ?', [isActive, id])

    revalidatePath('/admin/promotions')
    revalidatePath('/promotions')
    revalidatePath('/')
}
