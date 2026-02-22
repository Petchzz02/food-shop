import { getSession } from '@/lib/auth'
import { logout } from '@/app/auth-actions'
import Link from 'next/link'
import { headers } from 'next/headers'

export default async function Navbar() {
  // ซ่อน Navbar บนหน้า /admin (admin มี layout ของตัวเอง)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  if (pathname.startsWith('/admin')) return null

  const user = await getSession()

  return (
    <nav style={{
      background: '#ffffff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <span style={{ fontSize: '26px' }}>🦐</span>
        <span style={{ fontWeight: 900, fontSize: '19px', color: '#ea580c' }}>U-ra Seafood</span>
      </Link>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user ? (
          <>
            {/* Points badge */}
            <Link href="/profile" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#fff7ed', border: '1.5px solid #fed7aa',
              borderRadius: '999px', padding: '6px 14px',
              textDecoration: 'none',
            }}>
              <span style={{ fontSize: '14px' }}>⭐</span>
              <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '13px' }}>{user.points.toLocaleString()} แต้ม</span>
            </Link>

            {/* User name */}
            <Link href="/profile" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f3f4f6', borderRadius: '999px',
              padding: '6px 16px', textDecoration: 'none',
            }}>
              <span style={{ fontSize: '14px' }}>👤</span>
              <span style={{ color: '#374151', fontWeight: 700, fontSize: '13px' }}>{user.name}</span>
            </Link>

            {/* Logout */}
            <form action={logout}>
              <button type="submit" style={{
                background: 'none', border: '1.5px solid #e5e7eb',
                borderRadius: '10px', padding: '6px 14px',
                color: '#6b7280', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer',
              }}>
                ออกจากระบบ
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" style={{
              background: 'none', border: '1.5px solid #e5e7eb',
              borderRadius: '10px', padding: '8px 18px',
              color: '#6b7280', fontWeight: 700, fontSize: '13px',
              textDecoration: 'none',
            }}>
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              borderRadius: '10px', padding: '8px 18px',
              color: '#ffffff', fontWeight: 700, fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 3px 10px rgba(234,88,12,0.25)',
            }}>
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
