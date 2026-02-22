import { logout } from '@/app/auth-actions'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav style={{
        background: '#1f2937',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ fontSize: '24px' }}>🦐</span>
            <span style={{ fontWeight: 900, fontSize: '18px', color: '#f97316' }}>U-ra Seafood</span>
          </Link>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>|</span>
          <span style={{
            background: '#ea580c', color: '#fff',
            fontSize: '11px', padding: '3px 10px',
            borderRadius: '6px', fontWeight: 800, letterSpacing: '1px',
          }}>ADMIN PANEL</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/" style={{
            color: '#9ca3af', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', padding: '6px 14px',
            border: '1px solid #374151', borderRadius: '8px',
          }}>
            ← กลับหน้าร้าน
          </Link>
          <form action={logout}>
            <button type="submit" style={{
              background: '#374151', color: '#d1d5db',
              border: 'none', borderRadius: '8px',
              padding: '7px 14px', fontWeight: 600,
              fontSize: '13px', cursor: 'pointer',
            }}>
              ออกจากระบบ
            </button>
          </form>
        </div>
      </nav>
      {children}
    </>
  )
}
