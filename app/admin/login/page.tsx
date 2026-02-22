'use client'

import { useActionState } from 'react'
import { adminLogin } from '@/app/auth-actions'

const initialState = { error: '' }

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await adminLogin(formData)
      return result ?? initialState
    },
    initialState
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ea580c, #f97316)',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛠️</div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '22px', margin: 0 }}>Admin Panel</h1>
          <p style={{ color: '#fed7aa', fontSize: '13px', marginTop: '6px' }}>U-ra Seafood · เข้าสู่ระบบผู้ดูแล</p>
        </div>

        {/* Form */}
        <form action={formAction} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {state?.error && (
            <div style={{
              background: '#fee2e2', color: '#dc2626',
              borderRadius: '10px', padding: '12px 16px',
              fontSize: '14px', fontWeight: 600,
              border: '1px solid #fca5a5',
            }}>
              ⚠️ {state.error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              name="username"
              placeholder="admin01"
              required
              style={{
                width: '100%',
                border: '1.5px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••"
              required
              style={{
                width: '100%',
                border: '1.5px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            style={{
              background: pending ? '#9ca3af' : 'linear-gradient(135deg, #ea580c, #f97316)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontWeight: 800,
              fontSize: '15px',
              cursor: pending ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {pending ? 'กำลังเข้าสู่ระบบ...' : '🔐 เข้าสู่ระบบ'}
          </button>

          <a href="/" style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '13px',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            ← กลับหน้าร้าน
          </a>
        </form>
      </div>
    </div>
  )
}
