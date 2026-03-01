'use client'

import { useState } from 'react'

interface Props {
    productId: number
    productName: string
    onClose: () => void
    onSuccess: () => void
}

export function ReviewModal({ productId, productName, onClose, onSuccess }: Props) {
    const [rating, setRating] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) { setError('กรุณาเลือกคะแนน'); return }
        setLoading(true)
        setError('')

        const res = await fetch('/api/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, rating, comment }),
        })

        if (res.ok) {
            onSuccess()
            onClose()
        } else {
            const data = await res.json()
            setError(data.error ?? 'เกิดข้อผิดพลาด')
        }
        setLoading(false)
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
        }} onClick={onClose}>
            <div style={{
                background: '#ffffff', borderRadius: '24px',
                padding: '32px', maxWidth: '400px', width: '100%',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>⭐</div>
                    <h2 style={{ fontWeight: 900, fontSize: '18px', color: '#1f2937', margin: '0 0 4px' }}>
                        รีวิวสินค้า
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{productName}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Star Rating */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>
                            คะแนนความพอใจ
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: '36px', padding: '0',
                                        transition: 'transform 0.15s',
                                        transform: (hovered || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                                        filter: (hovered || rating) >= star ? 'none' : 'grayscale(1) opacity(0.4)',
                                    }}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 700, marginTop: '6px' }}>
                                {['', 'แย่มาก', 'แย่', 'พอใช้', 'ดี', 'ดีมาก'][rating]}
                            </div>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                            ความคิดเห็น (ไม่บังคับ)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="เล่าประสบการณ์ของคุณ..."
                            rows={3}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                padding: '12px 14px', fontSize: '14px',
                                outline: 'none', resize: 'vertical',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: 600 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '12px',
                                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                background: '#f9fafb', color: '#6b7280',
                                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                            }}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1, padding: '12px',
                                background: loading ? '#d1d5db' : 'linear-gradient(135deg, #f59e0b, #f97316)',
                                border: 'none', borderRadius: '12px',
                                color: '#ffffff', fontWeight: 700, fontSize: '14px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? '⏳ กำลังส่ง...' : '⭐ ส่งรีวิว'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
