'use client'

import { useActionState } from 'react'
import { register } from '@/app/auth-actions'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, action, pending] = useActionState(
    async (_: string | null, formData: FormData) => {
      const result = await register(formData)
      return result?.error ?? null
    },
    null
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px' }}>🦐</div>
          <h1 style={{ fontWeight: 900, fontSize: '24px', color: '#ea580c', margin: '8px 0 4px' }}>U-ra Seafood</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>สมัครสมาชิกเพื่อรับสิทธิประโยชน์</p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '28px', boxShadow: '0 12px 40px rgba(0,0,0,0.10)', overflow: 'hidden', border: '1.5px solid #fed7aa' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', padding: '24px 32px' }}>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '20px', margin: 0 }}>📝 สมัครสมาชิก</h2>
            <p style={{ color: '#fed7aa', fontSize: '13px', marginTop: '4px' }}>รับคะแนนสะสมทุกครั้งที่สั่งอาหาร!</p>
          </div>

          {/* Points promo */}
          <div style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span style={{ fontSize: '13px', color: '#ea580c', fontWeight: 600 }}>สะสม 1 แต้มทุก 10 บาท · แลกรับส่วนลดพิเศษ</span>
          </div>

          <form action={action} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {error && (
              <div style={{ background: '#fee2e2', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '6px' }}>ชื่อ-นามสกุล</label>
              <input
                type="text" name="name" placeholder="เช่น สมชาย ใจดี" required
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '6px' }}>อีเมล</label>
              <input
                type="email" name="email" placeholder="example@email.com" required
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '6px' }}>รหัสผ่าน (อย่างน้อย 6 ตัว)</label>
              <input
                type="password" name="password" placeholder="••••••••" required
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit" disabled={pending}
              style={{
                background: pending ? '#d1d5db' : 'linear-gradient(135deg, #ea580c, #f97316)',
                color: '#fff', border: 'none', borderRadius: '14px',
                padding: '14px', fontWeight: 800, fontSize: '15px',
                cursor: pending ? 'not-allowed' : 'pointer',
                boxShadow: pending ? 'none' : '0 4px 15px rgba(234,88,12,0.3)',
                marginTop: '4px',
              }}
            >
              {pending ? '⏳ กำลังสมัคร...' : '🎉 สมัครสมาชิก'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              มีบัญชีแล้ว?{' '}
              <Link href="/login" style={{ color: '#ea580c', fontWeight: 700, textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
