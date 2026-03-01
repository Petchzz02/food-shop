'use client'

import { useState } from 'react'

interface Order {
    id: number
    total: number
    createdAt: string
}

export function CheckoutForm({
    order,
    userEmail,
    userName,
}: {
    order: Order | null
    userEmail: string
    userName: string
}) {
    const [slipUrl, setSlipUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSlip = async (file: File) => {
        setError('')
        setUploading(true)
        const form = new FormData()
        form.append('file', file)

        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data = await res.json()
        if (!res.ok) {
            setError(data.error ?? 'อัปโหลดสลิปล้มเหลว')
        } else {
            setSlipUrl(data.url)
        }
        setUploading(false)
    }

    const handleConfirm = async () => {
        if (!order || !slipUrl) return
        setError('')

        const res = await fetch('/api/slip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id, slipUrl }),
        })

        if (res.ok) {
            setSubmitted(true)
        } else {
            const data = await res.json()
            setError(data.error ?? 'เกิดข้อผิดพลาด')
        }
    }

    if (!order) {
        return (
            <div style={{ background: '#ffffff', borderRadius: '28px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '40px', textAlign: 'center', border: '1.5px solid #fed7aa' }}>
                <div style={{ fontSize: '52px', marginBottom: '12px' }}>🛒</div>
                <h2 style={{ fontWeight: 800, color: '#1f2937' }}>ไม่มีออเดอร์ที่รอชำระ</h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>กรุณาสั่งอาหารก่อนนะครับ</p>
                <a href="/" style={{
                    display: 'inline-block', marginTop: '20px',
                    background: 'linear-gradient(135deg, #ea580c, #f97316)',
                    color: '#ffffff', textDecoration: 'none',
                    borderRadius: '12px', padding: '12px 28px',
                    fontWeight: 700, fontSize: '14px',
                }}>
                    ← กลับหน้าหลัก
                </a>
            </div>
        )
    }

    if (submitted) {
        return (
            <div style={{ background: '#ffffff', borderRadius: '28px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '40px', textAlign: 'center', border: '1.5px solid #86efac' }}>
                <div style={{ fontSize: '64px', marginBottom: '12px' }}>✅</div>
                <h2 style={{ fontWeight: 800, color: '#16a34a', marginBottom: '8px' }}>ส่งสลิปสำเร็จ!</h2>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>ทีมงานจะตรวจสอบและยืนยันคำสั่งซื้อของคุณเร็วๆ นี้ครับ</p>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '6px' }}>ออเดอร์ #{order.id}</p>
                <a href="/" style={{
                    display: 'inline-block', marginTop: '24px',
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    color: '#ffffff', textDecoration: 'none',
                    borderRadius: '12px', padding: '12px 28px',
                    fontWeight: 700, fontSize: '14px',
                }}>
                    ← กลับหน้าหลัก
                </a>
            </div>
        )
    }

    return (
        <div style={{ background: '#ffffff', borderRadius: '28px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1.5px solid #fed7aa' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', padding: '32px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>💳</div>
                <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '24px', margin: 0 }}>ชำระเงิน</h1>
                <p style={{ color: '#fed7aa', fontSize: '13px', marginTop: '4px' }}>แนบสลิปโอนเงินเพื่อยืนยันคำสั่งซื้อ</p>
            </div>

            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Order Summary */}
                <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '20px', border: '1.5px solid #e5e7eb' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#374151', margin: '0 0 12px' }}>📋 สรุปออเดอร์ #{order.id}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>ยอดที่ต้องชำระ</span>
                        <span style={{ fontWeight: 900, fontSize: '24px', color: '#ea580c' }}>{order.total.toLocaleString()} ฿</span>
                    </div>
                </div>

                {/* Bank Account Info */}
                <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '20px', border: '1.5px solid #bfdbfe' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#1d4ed8', margin: '0 0 12px' }}>🏦 ข้อมูลบัญชี</h3>
                    <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: 1.8 }}>
                        <p style={{ margin: 0 }}>ธนาคาร: <strong>กสิกรไทย (KBANK)</strong></p>
                        <p style={{ margin: 0 }}>เลขบัญชี: <strong>xxx-x-xxxxx-x</strong></p>
                        <p style={{ margin: 0 }}>ชื่อบัญชี: <strong>U-ra Seafood</strong></p>
                    </div>
                </div>

                {/* Slip Upload */}
                <div>
                    <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#374151', marginBottom: '12px' }}>📎 แนบสลิปโอนเงิน</h3>

                    {slipUrl ? (
                        <div style={{ textAlign: 'center' }}>
                            <img src={slipUrl} alt="slip" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px', border: '1.5px solid #e5e7eb', marginBottom: '12px' }} />
                            <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>✅ อัปโหลดสลิปสำเร็จ</p>
                            <button
                                onClick={() => setSlipUrl(null)}
                                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}
                            >
                                เปลี่ยนสลิป
                            </button>
                        </div>
                    ) : (
                        <label style={{ display: 'block', cursor: 'pointer' }}>
                            <div style={{
                                border: '2px dashed #fed7aa', borderRadius: '12px',
                                padding: '32px', textAlign: 'center', background: '#fffbf5',
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                                <p style={{ fontWeight: 600, color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                    {uploading ? '⏳ กำลังอัปโหลด...' : 'คลิกเพื่อแนบสลิป'}
                                </p>
                                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>JPG, PNG (สูงสุด 5MB)</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleSlip(file)
                                }}
                            />
                        </label>
                    )}
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleConfirm}
                    disabled={!slipUrl || uploading}
                    style={{
                        width: '100%', padding: '16px',
                        background: !slipUrl ? '#d1d5db' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                        color: '#ffffff', border: 'none',
                        borderRadius: '14px', fontWeight: 800, fontSize: '16px',
                        cursor: !slipUrl ? 'not-allowed' : 'pointer',
                        boxShadow: !slipUrl ? 'none' : '0 4px 15px rgba(22,163,74,0.35)',
                        transition: 'all 0.2s',
                    }}
                >
                    ✅ ยืนยันการชำระเงิน
                </button>
            </div>
        </div>
    )
}
