import { adminLogout } from '@/app/auth-actions'
import Link from 'next/link'
import { headers } from 'next/headers'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: '📊 Dashboard' },
  { href: '/admin', label: '🛍️ จัดการสินค้า' },
  { href: '/admin/orders', label: '📦 ออเดอร์' },
  { href: '/admin/promotions', label: '📣 โปรโมชั่น' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

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
        {/* Left: Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span style={{ fontSize: '24px' }}>🦐</span>
              <span style={{ fontWeight: 900, fontSize: '18px', color: '#f97316' }}>U-ra Seafood</span>
            </Link>
            <span style={{ color: '#374151', fontSize: '13px' }}>|</span>
            <span style={{
              background: '#ea580c', color: '#fff',
              fontSize: '11px', padding: '3px 10px',
              borderRadius: '6px', fontWeight: 800, letterSpacing: '1px',
            }}>ADMIN</span>
          </div>

          {/* Nav Menu */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href ||
                (item.href === '/admin' && pathname === '/admin')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: isActive ? '#f97316' : '#9ca3af',
                    fontSize: '13px', fontWeight: 700,
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/" style={{
            color: '#9ca3af', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', padding: '6px 14px',
            border: '1px solid #374151', borderRadius: '8px',
          }}>
            ← กลับหน้าร้าน
          </Link>
          <form action={adminLogout}>
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
