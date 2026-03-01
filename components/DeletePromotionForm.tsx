// components/DeletePromotionForm.tsx
'use client'

import { deletePromotion } from '@/app/admin/promotions/actions'

export function DeletePromotionForm({ id, title }: { id: number, title: string }) {
    return (
        <form action={deletePromotion} onSubmit={(e) => {
            if (!confirm(`ต้องการลบโปรโมชั่น "${title}" ใช่ไหม?`)) e.preventDefault()
        }}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" style={{
                background: '#fee2e2', color: '#ef4444',
                border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
            }}>
                🗑️ ลบ
            </button>
        </form>
    )
}
