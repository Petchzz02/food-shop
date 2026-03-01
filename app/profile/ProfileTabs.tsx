'use client'

import { useState, useTransition } from 'react'
import {
  updateProfile, changePassword,
  addAddress, updateAddress, deleteAddress, setDefaultAddress,
  removeFavorite, updateNotificationSettings, reorder,
} from '@/app/profile-actions'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: '⏳ รอยืนยัน', color: '#d97706', bg: '#fef3c7' },
  PAID: { label: '💳 ชำระแล้ว', color: '#7c3aed', bg: '#f5f3ff' },
  SHIPPED: { label: '🚚 จัดส่งแล้ว', color: '#15803d', bg: '#dcfce7' },
  PROCESSING: { label: '⚙️ กำลังดำเนินการ', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: '✅ สำเร็จ', color: '#16a34a', bg: '#dcfce7' },
  CANCELLED: { label: '❌ ยกเลิก', color: '#dc2626', bg: '#fee2e2' },
}

const TABS = [
  { id: 'info', label: '👤 ข้อมูลส่วนตัว' },
  { id: 'address', label: '📍 ที่อยู่จัดส่ง' },
  { id: 'orders', label: '🛒 ประวัติสั่งซื้อ' },
  { id: 'fav', label: '⭐ รายการโปรด' },
  { id: 'notif', label: '🔔 การแจ้งเตือน' },
  { id: 'payment', label: '💳 ชำระเงิน' },
]

type Address = { id: number; recipientName: string; phone: string; address: string; isDefault: number }
type Order = { id: number; total: number; status: string; createdAt: string; items: { name: string; quantity: number; price: number }[] }
type Product = { id: number; name: string; price: number }
type NotifSetting = { promoNotif: number; orderNotif: number } | null

interface Props {
  user: { id: number; name: string; email: string; phone?: string | null; points: number }
  addresses: Address[]
  orders: Order[]
  favorites: Product[]
  notifSetting: NotifSetting
}

function Msg({ msg }: { msg: { type: 'ok' | 'err'; text: string } | null }) {
  if (!msg) return null
  return (
    <div style={{
      padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
      background: msg.type === 'ok' ? '#dcfce7' : '#fee2e2',
      color: msg.type === 'ok' ? '#16a34a' : '#dc2626',
      border: `1px solid ${msg.type === 'ok' ? '#bbf7d0' : '#fca5a5'}`,
      marginBottom: '12px',
    }}>
      {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
    </div>
  )
}

// ─── 1. ข้อมูลส่วนตัว ────────────────────────────────────────
function TabInfo({ user }: { user: Props['user'] }) {
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pending, startT] = useTransition()
  const [pwPending, startPwT] = useTransition()

  const handleProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startT(async () => {
      const r = await updateProfile(new FormData(e.currentTarget))
      setMsg(r?.error ? { type: 'err', text: r.error } : { type: 'ok', text: 'บันทึกข้อมูลสำเร็จ' })
    })
  }

  const handlePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    startPwT(async () => {
      const r = await changePassword(new FormData(form))
      if (r?.error) {
        setPwMsg({ type: 'err', text: r.error })
      } else {
        setPwMsg({ type: 'ok', text: 'เปลี่ยนรหัสผ่านสำเร็จ' })
        form.reset()
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Avatar + Basic */}
      <div style={{ background: '#fff7ed', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#ea580c,#f97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 900, color: '#fff', flexShrink: 0,
        }}>
          {user.name?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937', margin: 0 }}>{user.name}</p>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{user.email}</p>
        </div>
      </div>

      {/* Edit Profile */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>แก้ไขข้อมูลส่วนตัว</h3>
        <Msg msg={msg} />
        <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>ชื่อ - นามสกุล</label>
            <input name="name" defaultValue={user.name} required style={inputStyle} placeholder="ชื่อ นามสกุล" />
          </div>
          <div>
            <label style={labelStyle}>อีเมล</label>
            <input value={user.email} disabled style={{ ...inputStyle, background: '#f3f4f6', color: '#9ca3af' }} />
          </div>
          <div>
            <label style={labelStyle}>เบอร์โทรศัพท์</label>
            <input name="phone" defaultValue={user.phone ?? ''} style={inputStyle} placeholder="0XX-XXX-XXXX" />
          </div>
          <button type="submit" disabled={pending} style={btnPrimary}>
            {pending ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>🔒 เปลี่ยนรหัสผ่าน</h3>
        <Msg msg={pwMsg} />
        <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>รหัสผ่านปัจจุบัน</label>
            <input type="password" name="currentPassword" required style={inputStyle} placeholder="••••••" />
          </div>
          <div>
            <label style={labelStyle}>รหัสผ่านใหม่</label>
            <input type="password" name="newPassword" required style={inputStyle} placeholder="••••••" />
          </div>
          <div>
            <label style={labelStyle}>ยืนยันรหัสผ่านใหม่</label>
            <input type="password" name="confirmPassword" required style={inputStyle} placeholder="••••••" />
          </div>
          <button type="submit" disabled={pwPending} style={btnSecondary}>
            {pwPending ? 'กำลังเปลี่ยน...' : '🔑 เปลี่ยนรหัสผ่าน'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── 2. ที่อยู่จัดส่ง ────────────────────────────────────────
function TabAddress({ addresses: initial }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pending, startT] = useTransition()

  const refreshAndMsg = (r: any, ok: string) => {
    if (r?.error) { setMsg({ type: 'err', text: r.error }); return }
    setMsg({ type: 'ok', text: ok })
    setShowForm(false)
    setEditing(null)
    setTimeout(() => window.location.reload(), 800)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startT(async () => {
      if (editing) {
        fd.append('id', String(editing.id))
        refreshAndMsg(await updateAddress(fd), 'แก้ไขที่อยู่สำเร็จ')
      } else {
        refreshAndMsg(await addAddress(fd), 'เพิ่มที่อยู่สำเร็จ')
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm('ลบที่อยู่นี้?')) return
    const fd = new FormData(); fd.append('id', String(id))
    startT(async () => refreshAndMsg(await deleteAddress(fd), 'ลบที่อยู่สำเร็จ'))
  }

  const handleDefault = (id: number) => {
    const fd = new FormData(); fd.append('id', String(id))
    startT(async () => refreshAndMsg(await setDefaultAddress(fd), 'ตั้งที่อยู่หลักสำเร็จ'))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#1f2937', margin: 0 }}>ที่อยู่จัดส่งของฉัน</h3>
        <button onClick={() => { setEditing(null); setShowForm(true) }} style={btnPrimary}>
          ➕ เพิ่มที่อยู่
        </button>
      </div>

      <Msg msg={msg} />

      {(showForm || editing) && (
        <div style={cardStyle}>
          <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#374151', margin: '0 0 16px' }}>
            {editing ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
          </h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>ชื่อผู้รับ</label>
                <input name="recipientName" defaultValue={editing?.recipientName} required style={inputStyle} placeholder="ชื่อ นามสกุล" />
              </div>
              <div>
                <label style={labelStyle}>เบอร์โทร</label>
                <input name="phone" defaultValue={editing?.phone} required style={inputStyle} placeholder="0XX-XXX-XXXX" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>ที่อยู่</label>
              <textarea name="address" defaultValue={editing?.address} required rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
              <input type="checkbox" name="isDefaultChk" onChange={e => {
                const fd = document.querySelector('form input[name="isDefault"]') as HTMLInputElement
                if (fd) fd.value = e.target.checked ? 'true' : 'false'
              }} defaultChecked={!!editing?.isDefault} />
              <input type="hidden" name="isDefault" defaultValue={editing?.isDefault ? 'true' : 'false'} />
              ตั้งเป็นที่อยู่หลัก
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={pending} style={btnPrimary}>
                {pending ? 'กำลังบันทึก...' : '💾 บันทึก'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} style={btnGhost}>
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d1d5db' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>📍</div>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>ยังไม่มีที่อยู่จัดส่ง</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} style={{
          ...cardStyle,
          border: addr.isDefault ? '2px solid #f97316' : '1.5px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {addr.isDefault === 1 && (
                <span style={{ background: '#fff7ed', color: '#ea580c', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', marginBottom: '6px', display: 'inline-block' }}>
                  ⭐ ที่อยู่หลัก
                </span>
              )}
              <p style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', margin: '0 0 2px' }}>{addr.recipientName}</p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px' }}>📞 {addr.phone}</p>
              <p style={{ color: '#374151', fontSize: '13px', margin: 0 }}>{addr.address}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
              {addr.isDefault !== 1 && (
                <button onClick={() => handleDefault(addr.id)} style={btnSmallOutline} title="ตั้งเป็นหลัก">⭐</button>
              )}
              <button onClick={() => { setEditing(addr); setShowForm(false) }} style={btnSmallOutline}>✏️</button>
              <button onClick={() => handleDelete(addr.id)} style={btnSmallRed}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 3. ประวัติสั่งซื้อ ──────────────────────────────────────
function TabOrders({ orders }: { orders: Order[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [reordering, setReordering] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleReorder = async (orderId: number) => {
    setReordering(orderId)
    const fd = new FormData(); fd.append('orderId', String(orderId))
    const r = await reorder(fd)
    setReordering(null)
    if (r?.error) setMsg({ type: 'err', text: r.error })
    else setMsg({ type: 'ok', text: `✅ สั่งซ้ำสำเร็จ! ออเดอร์ใหม่ #${r.newOrderId}` })
    setTimeout(() => window.location.reload(), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#1f2937', margin: 0 }}>ประวัติการสั่งซื้อทั้งหมด</h3>
      <Msg msg={msg} />

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d1d5db' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>ยังไม่มีประวัติการสั่งซื้อ</p>
        </div>
      ) : orders.map((order) => {
        const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
        const isExpanded = expanded === order.id
        return (
          <div key={order.id} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: '15px', color: '#1f2937', margin: '0 0 2px' }}>
                  ออเดอร์ #{order.id}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                  {new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: st.bg, color: st.color, fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px' }}>
                  {st.label}
                </span>
                <p style={{ fontWeight: 900, color: '#ea580c', fontSize: '17px', margin: 0 }}>
                  {order.total.toLocaleString()} ฿
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setExpanded(isExpanded ? null : order.id)} style={btnSmallOutline}>
                {isExpanded ? '▲ ซ่อนรายการ' : '▼ ดูรายการ'}
              </button>
              <button
                onClick={() => handleReorder(order.id)}
                disabled={reordering === order.id}
                style={btnSmallOrange}
              >
                {reordering === order.id ? '⏳...' : '🔄 สั่งซ้ำ'}
              </button>
            </div>

            {isExpanded && (
              <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ color: '#374151' }}>🍽️ {item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 700, color: '#ea580c' }}>{(item.price * item.quantity).toLocaleString()} ฿</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── 4. รายการโปรด ──────────────────────────────────────────
function TabFavorites({ favorites: initial }: { favorites: Product[] }) {
  const [favorites, setFavorites] = useState(initial)
  const [pending, startT] = useTransition()

  const handleRemove = (productId: number) => {
    const fd = new FormData(); fd.append('productId', String(productId))
    startT(async () => {
      await removeFavorite(fd)
      setFavorites(prev => prev.filter(p => p.id !== productId))
    })
  }

  const emojis = ['🦐', '🐟', '🦞', '🍤', '🦑']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#1f2937', margin: 0 }}>
        เมนูโปรดของฉัน
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginLeft: '8px' }}>{favorites.length} รายการ</span>
      </h3>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d1d5db' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>⭐</div>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>ยังไม่มีเมนูโปรด</p>
          <a href="/" style={{ color: '#ea580c', fontSize: '13px', fontWeight: 600 }}>→ ไปดูเมนูทั้งหมด</a>
        </div>
      ) : favorites.map((item, i) => (
        <div key={item.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg,#fff7ed,#fed7aa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', flexShrink: 0,
          }}>
            {emojis[i % emojis.length]}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', margin: '0 0 2px' }}>{item.name}</p>
            <p style={{ color: '#ea580c', fontWeight: 800, fontSize: '16px', margin: 0 }}>{item.price.toLocaleString()} ฿</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/" style={btnSmallOrange}>🛒 สั่งเลย</a>
            <button onClick={() => handleRemove(item.id)} disabled={pending} style={btnSmallRed}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 5. การแจ้งเตือน ────────────────────────────────────────
function TabNotification({ notifSetting }: { notifSetting: NotifSetting }) {
  const [promo, setPromo] = useState(notifSetting?.promoNotif !== 0)
  const [order, setOrder] = useState(notifSetting?.orderNotif !== 0)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pending, startT] = useTransition()

  const save = (newPromo: boolean, newOrder: boolean) => {
    const fd = new FormData()
    fd.append('promoNotif', newPromo ? '1' : '0')
    fd.append('orderNotif', newOrder ? '1' : '0')
    startT(async () => {
      const r = await updateNotificationSettings(fd)
      setMsg(r?.error ? { type: 'err', text: r.error } : { type: 'ok', text: 'บันทึกการตั้งค่าแล้ว' })
    })
  }

  const toggle = (type: 'promo' | 'order') => {
    if (type === 'promo') { setPromo(p => { save(!p, order); return !p }) }
    else { setOrder(o => { save(promo, !o); return !o }) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#1f2937', margin: 0 }}>ตั้งค่าการแจ้งเตือน</h3>
      <Msg msg={msg} />

      {[
        { type: 'promo' as const, icon: '🎁', title: 'แจ้งเตือนโปรโมชัน', desc: 'รับข่าวสารส่วนลดและโปรโมชันพิเศษ', val: promo },
        { type: 'order' as const, icon: '📦', title: 'แจ้งเตือนสถานะออเดอร์', desc: 'รับการแจ้งเตือนเมื่อสถานะออเดอร์เปลี่ยน', val: order },
      ].map((item) => (
        <div key={item.type} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>{item.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', margin: '0 0 2px' }}>{item.title}</p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>{item.desc}</p>
          </div>
          <button
            onClick={() => toggle(item.type)}
            disabled={pending}
            style={{
              width: '52px', height: '28px', borderRadius: '999px',
              background: item.val ? '#ea580c' : '#e5e7eb',
              border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', flexShrink: 0,
              position: 'relative',
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '4px',
              left: item.val ? '28px' : '4px',
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── 6. วิธีชำระเงิน ────────────────────────────────────────
function TabPayment() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#1f2937', margin: 0 }}>วิธีชำระเงิน</h3>

      {[
        { icon: '💳', label: 'บัตรเครดิต / เดบิต', desc: 'Visa, Mastercard, JCB' },
        { icon: '📱', label: 'พร้อมเพย์', desc: 'โอนผ่านเลขโทรศัพท์หรือบัตรประชาชน' },
        { icon: '🏦', label: 'โอนเงินธนาคาร', desc: 'ทุกธนาคารชั้นนำในไทย' },
        { icon: '💵', label: 'เก็บเงินปลายทาง', desc: 'ชำระเงินเมื่อรับสินค้า' },
      ].map((m) => (
        <div key={m.label} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '32px' }}>{m.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', margin: '0 0 2px' }}>{m.label}</p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>{m.desc}</p>
          </div>
          <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px' }}>
            รองรับ
          </span>
        </div>
      ))}

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: '#92400e' }}>
        💡 ขณะนี้ระบบรองรับการชำระเงินปลายทาง และพร้อมเพย์ผ่านการโอนโดยตรง ระบบบัตรเครดิตจะเปิดให้บริการเร็วๆ นี้
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function ProfileTabs({ user, addresses, orders, favorites, notifSetting }: Props) {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div>
      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px', background: '#f3f4f6', borderRadius: '16px', padding: '6px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 1 auto',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              background: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? '#ea580c' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'info' && <TabInfo user={user} />}
      {activeTab === 'address' && <TabAddress addresses={addresses} />}
      {activeTab === 'orders' && <TabOrders orders={orders} />}
      {activeTab === 'fav' && <TabFavorites favorites={favorites} />}
      {activeTab === 'notif' && <TabNotification notifSetting={notifSetting} />}
      {activeTab === 'payment' && <TabPayment />}
    </div>
  )
}

// ─── Shared Styles ───────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: '#ffffff', borderRadius: '16px',
  border: '1.5px solid #e5e7eb', padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}
const sectionTitle: React.CSSProperties = {
  fontWeight: 800, fontSize: '15px', color: '#374151', margin: '0 0 16px',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontWeight: 700, fontSize: '12px',
  color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
}
const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff',
  border: 'none', borderRadius: '10px', padding: '11px 20px',
  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  background: '#1f2937', color: '#fff',
  border: 'none', borderRadius: '10px', padding: '11px 20px',
  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  background: '#f3f4f6', color: '#6b7280',
  border: 'none', borderRadius: '10px', padding: '11px 20px',
  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
}
const btnSmallOutline: React.CSSProperties = {
  background: '#f9fafb', color: '#374151', border: '1.5px solid #e5e7eb',
  borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
  fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
}
const btnSmallOrange: React.CSSProperties = {
  background: '#fff7ed', color: '#ea580c', border: '1.5px solid #fed7aa',
  borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
  fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
}
const btnSmallRed: React.CSSProperties = {
  background: '#fee2e2', color: '#ef4444', border: 'none',
  borderRadius: '8px', padding: '6px 10px', fontSize: '12px',
  fontWeight: 600, cursor: 'pointer',
}
