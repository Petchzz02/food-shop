'use client'

import { useState } from "react"
import { submitOrder } from '@/app/actions'
import { deleteProduct } from '@/app/actions'
import { ReviewModal } from './ReviewModal'

interface Product {
  id: number
  name: string
  price: number
  stock: number
  image?: string | null
}

type CartItem = { id: number; name: string; price: number; count: number }

export function FoodList({
  products,
  userId,
  isAdmin,
  userPoints = 0,
  reviewMap = {},
}: {
  products: Product[]
  userId?: number | null
  isAdmin?: boolean
  userPoints?: number
  reviewMap?: Record<number, { avgRating: number; reviewCount: number }>
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [ordered, setOrdered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [pointsDiscount, setPointsDiscount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [usePoints, setUsePoints] = useState(0)
  const [customerPhone, setCustomerPhone] = useState('')  // ✅ เพิ่มเบอร์ลูกค้าสำหรับ admin
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestAddress, setGuestAddress] = useState('')
  const [reviewTarget, setReviewTarget] = useState<{ id: number; name: string } | null>(null)

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return
    setOrdered(false)
    setErrorMsg('')
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        // ไม่ให้ใส่เกิน stock
        if (existing.count >= product.stock) return prev
        return prev.map((item) => item.id === product.id ? { ...item, count: item.count + 1 } : item)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, count: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) =>
      prev.map((item) => item.id === id ? { ...item, count: item.count - 1 } : item)
        .filter((item) => item.count > 0)
    )
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.count, 0)
  const maxUsePoints = Math.min(userPoints, totalPrice)
  const finalPrice = Math.max(0, totalPrice - usePoints)

  const handleOrder = async () => {
    if (cart.length === 0) return
    if (!userId && !isAdmin) {
      if (!guestName.trim() || !guestPhone.trim() || !guestAddress.trim()) {
        setErrorMsg('กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน')
        return
      }
    }
    setLoading(true)
    setErrorMsg('')
    const result = await submitOrder(
      cart.map((i) => ({ id: i.id, count: i.count })),
      usePoints,
      isAdmin ? customerPhone : '',
      (!userId && !isAdmin) ? { name: guestName, phone: guestPhone, address: guestAddress } : undefined,
      isAdmin // ✅ ส่ง flag ไปที่ server ว่านี่คือออเดอร์ของ Admin
    )
    if (!result?.success) {
      setErrorMsg(result?.error ?? 'เกิดข้อผิดพลาด')
      setLoading(false)
      return
    }
    setCart([])
    setOrdered(true)
    setUsePoints(0)
    setCustomerPhone('')  // ✅ ล้างเบอร์หลังสั่ง
    setGuestName('')
    setGuestPhone('')
    setGuestAddress('')
    setEarnedPoints(result?.earnedPoints ?? 0)
    setPointsDiscount(result?.pointsDiscount ?? 0)
    setLoading(false)
  }

  const emojis = ['🦐', '🐟', '🦞', '🍤', '🦑']

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ต้องการลบ "${name}" ออกจากเมนูใช่ไหม?`)) return
    const formData = new FormData()
    formData.append('id', String(id))
    await deleteProduct(formData)
  }

  return (
    <div className="food-container">

      {/* ====== รายการเมนู ====== */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#1f2937', marginBottom: '20px' }}>
          🍽️ เมนูทั้งหมด
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginLeft: '10px' }}>
            {products.length} รายการ
          </span>
        </h2>

        {products.length === 0 ? (
          <div style={{
            background: '#ffffff', borderRadius: '20px',
            border: '2px dashed #e5e7eb',
            padding: '60px 20px', textAlign: 'center', color: '#9ca3af'
          }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🍤</div>
            <p style={{ fontWeight: 600 }}>ยังไม่มีเมนู</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>กรุณาเพิ่มจากแผง Admin</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {products.map((item, i) => {
              const inCart = cart.find((c) => c.id === item.id)
              const soldOut = item.stock <= 0
              return (
                <div key={item.id} style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  border: inCart ? '2px solid #f97316' : soldOut ? '2px solid #e5e7eb' : '2px solid transparent',
                  opacity: soldOut ? 0.65 : 1,
                  transition: 'all 0.2s',
                }}>
                  {/* รูปสินค้า หรือ Emoji */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '32px', flexShrink: 0, overflow: 'hidden',
                  }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                      : emojis[i % emojis.length]
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ color: '#ea580c', fontWeight: 800, fontSize: '18px', marginTop: '2px' }}>
                      {item.price.toLocaleString()} ฿
                    </p>
                    {/* Star Rating */}
                    {(() => {
                      const rev = reviewMap[item.id]
                      if (!rev) return null
                      const stars = Math.round(rev.avgRating)
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <span style={{ fontSize: '13px', letterSpacing: '-1px' }}>
                            {[1, 2, 3, 4, 5].map(s => s <= stars ? '⭐' : '☆').join('')}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>
                            {rev.avgRating} ({rev.reviewCount})
                          </span>
                          {userId && (
                            <button
                              onClick={() => setReviewTarget({ id: item.id, name: item.name })}
                              style={{
                                background: 'none', border: 'none',
                                fontSize: '11px', color: '#f59e0b', fontWeight: 700,
                                cursor: 'pointer', padding: '0 4px',
                              }}
                            >
                              รีวิว
                            </button>
                          )}
                        </div>
                      )
                    })()}
                    {!reviewMap[item.id] && userId && (
                      <button
                        onClick={() => setReviewTarget({ id: item.id, name: item.name })}
                        style={{
                          background: 'none', border: 'none',
                          fontSize: '11px', color: '#f59e0b', fontWeight: 700,
                          cursor: 'pointer', padding: '4px 0',
                        }}
                      >
                        ⭐ เขียนรีวิวแรก
                      </button>
                    )}
                    {/* Stock badge */}
                    <span style={{
                      display: 'inline-block', marginTop: '4px',
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                      background: soldOut ? '#fef2f2' : item.stock <= 5 ? '#fefce8' : '#f0fdf4',
                      color: soldOut ? '#ef4444' : item.stock <= 5 ? '#ca8a04' : '#16a34a',
                    }}>
                      {soldOut ? '❌ หมด' : item.stock <= 5 ? `⚠️ เหลือ ${item.stock} ชิ้น` : `✅ มี ${item.stock} ชิ้น`}
                    </span>
                  </div>

                  {/* Admin edit/delete */}
                  {isAdmin && <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <a href={`/edit/${item.id}`} style={{
                      background: '#f3f4f6', color: '#6b7280',
                      border: 'none', borderRadius: '8px',
                      padding: '6px 10px', fontSize: '13px',
                      cursor: 'pointer', textDecoration: 'none',
                      fontWeight: 600,
                    }}>✏️</a>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      style={{
                        background: '#fee2e2', color: '#ef4444',
                        border: 'none', borderRadius: '8px',
                        padding: '6px 10px', fontSize: '13px',
                        cursor: 'pointer', fontWeight: 600,
                      }}>🗑️</button>
                  </div>}

                  {/* Add/Remove buttons */}
                  {soldOut ? (
                    <div style={{
                      background: '#f3f4f6', color: '#9ca3af',
                      borderRadius: '12px', padding: '10px 20px',
                      fontWeight: 700, fontSize: '14px', flexShrink: 0,
                    }}>สินค้าหมด</div>
                  ) : inCart ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => removeFromCart(item.id)} style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#fff7ed', border: '2px solid #f97316',
                        color: '#ea580c', fontSize: '20px', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937', minWidth: '24px', textAlign: 'center' }}>
                        {inCart.count}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={inCart.count >= item.stock}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: inCart.count >= item.stock ? '#e5e7eb' : '#ea580c',
                          border: 'none',
                          color: '#ffffff', fontSize: '20px', fontWeight: 700,
                          cursor: inCart.count >= item.stock ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} style={{
                      background: 'linear-gradient(135deg, #ea580c, #f97316)',
                      color: '#ffffff', border: 'none',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(234,88,12,0.3)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}>
                      + ใส่ตะกร้า
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ====== ตะกร้าสินค้า ====== */}
      <div className="food-cart-sidebar">
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          border: '1.5px solid #fed7aa',
        }}>
          {/* Cart Header */}
          <div style={{
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            padding: '20px 24px',
            color: '#ffffff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>🛒</span>
                <span style={{ fontWeight: 800, fontSize: '18px' }}>ตะกร้าสินค้า</span>
              </div>
              {totalItems > 0 && (
                <span style={{
                  background: '#ffffff', color: '#ea580c',
                  borderRadius: '999px', padding: '2px 12px',
                  fontWeight: 800, fontSize: '14px',
                }}>
                  {totalItems} ชิ้น
                </span>
              )}
            </div>
          </div>

          {/* Cart Body */}
          <div style={{ padding: '20px 24px' }}>
            {/* Error Message */}
            {errorMsg && (
              <div style={{
                background: '#fef2f2', border: '1.5px solid #fca5a5',
                color: '#dc2626', borderRadius: '12px',
                padding: '12px 16px', marginBottom: '16px',
                textAlign: 'center', fontWeight: 600, fontSize: '13px',
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* ✅ Admin: ช่องกรอกเบอร์โทรลูกค้า */}
            {isAdmin && (
              <div style={{
                background: '#f0fdf4', border: '1.5px solid #86efac',
                borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>
                  📞 เบอร์โทรลูกค้า (ไม่บังคับ — เพื่อสะสมแต้ม)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="เช่น 0812345678"
                  maxLength={10}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid #86efac', borderRadius: '8px',
                    padding: '8px 12px', fontSize: '14px', outline: 'none',
                    background: '#ffffff',
                  }}
                />
                {customerPhone && (
                  <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
                    ⭐ ระบบจะสะสมแต้มให้เบอร์นี้อัตโนมัติ
                  </p>
                )}
              </div>
            )}

            {ordered && (
              <div style={{
                background: '#f0fdf4', border: '1.5px solid #86efac',
                color: '#16a34a', borderRadius: '12px',
                padding: '14px 16px', marginBottom: '16px',
                textAlign: 'center', fontWeight: 700, fontSize: '14px',
              }}>
                ✅ สั่งออเดอร์สำเร็จ! ขอบคุณครับ 😊
                {earnedPoints > 0 && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#059669' }}>
                    ⭐ จะได้รับ {earnedPoints} แต้มสะสมเมื่อสถานะเป็นจัดส่งแล้ว!
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#059669' }}>
                    🎁 ใช้แต้มลด {pointsDiscount} บาท
                  </div>
                )}
                {!userId && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                    💡 <a href="/login" style={{ color: '#ea580c', fontWeight: 700 }}>ล็อกอิน</a> เพื่อสะสมแต้มในครั้งหน้า
                  </div>
                )}
              </div>
            )}

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#d1d5db', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛒</div>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>ยังไม่ได้เลือกเมนู</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>กด &quot;+ ใส่ตะกร้า&quot; เพื่อเริ่มสั่ง</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '12px' }}>x{item.count} × {item.price.toLocaleString()} ฿</p>
                      </div>
                      <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '15px', marginLeft: '12px' }}>
                        {(item.price * item.count).toLocaleString()} ฿
                      </span>
                    </div>
                  ))}
                </div>

                {/* ระบบแลกแต้ม */}
                {userId && userPoints > 0 && (
                  <div style={{
                    background: '#fefce8', border: '1.5px solid #fde68a',
                    borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#78350f' }}>
                        ⭐ แต้มสะสมของคุณ: {userPoints} แต้ม
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#92400e' }}>ใช้แต้ม:</span>
                      <input
                        type="number"
                        min={0}
                        max={maxUsePoints}
                        value={usePoints}
                        onChange={(e) => setUsePoints(Math.min(Number(e.target.value), maxUsePoints))}
                        style={{
                          width: '80px', padding: '4px 8px',
                          border: '1.5px solid #fcd34d', borderRadius: '8px',
                          fontSize: '13px', fontWeight: 700, textAlign: 'center',
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#92400e' }}>/ {maxUsePoints} สูงสุด</span>
                    </div>
                    {usePoints > 0 && (
                      <p style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginTop: '6px' }}>
                        🎁 ลด {usePoints} บาท
                      </p>
                    )}
                  </div>
                )}

                {/* แบบฟอร์มสำหรับ Guest (ไม่ได้ล็อคอิน) */}
                {!userId && !isAdmin && (
                  <div style={{
                    background: '#f9fafb', border: '1.5px solid #e5e7eb',
                    borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
                    display: 'flex', flexDirection: 'column', gap: '8px'
                  }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px', color: '#374151' }}>
                      📍 ข้อมูลจัดส่ง
                    </h3>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      style={{
                        padding: '8px 12px', fontSize: '13px',
                        border: '1px solid #d1d5db', borderRadius: '8px',
                        outline: 'none', background: '#ffffff',
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="เบอร์โทรศัพท์"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      style={{
                        padding: '8px 12px', fontSize: '13px',
                        border: '1px solid #d1d5db', borderRadius: '8px',
                        outline: 'none', background: '#ffffff',
                      }}
                    />
                    <textarea
                      placeholder="ที่อยู่จัดส่ง"
                      rows={2}
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      style={{
                        padding: '8px 12px', fontSize: '13px',
                        border: '1px solid #d1d5db', borderRadius: '8px',
                        outline: 'none', background: '#ffffff', resize: 'none'
                      }}
                    />
                  </div>
                )}

                {/* Total */}
                <div style={{
                  borderTop: '1.5px dashed #e5e7eb',
                  paddingTop: '16px', marginBottom: '16px',
                }}>
                  {usePoints > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                      <span>ราคาเต็ม</span>
                      <span>{totalPrice.toLocaleString()} ฿</span>
                    </div>
                  )}
                  {usePoints > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a', fontWeight: 700, marginBottom: '6px' }}>
                      <span>🎁 ส่วนลดแต้ม</span>
                      <span>-{usePoints} ฿</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#374151' }}>รวมทั้งสิ้น</span>
                    <span style={{ fontWeight: 900, fontSize: '24px', color: '#ea580c' }}>
                      {finalPrice.toLocaleString()} ฿
                    </span>
                  </div>
                </div>

                {/* Order Button */}
                <button
                  onClick={handleOrder}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#d1d5db' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                    color: '#ffffff', border: 'none',
                    borderRadius: '14px', padding: '15px',
                    fontWeight: 800, fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(22,163,74,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? '⏳ กำลังสั่ง...' : '✅ ยืนยันสั่งอาหาร'}
                </button>

                <button
                  onClick={() => { setCart([]); setUsePoints(0) }}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    color: '#d1d5db', fontSize: '12px', cursor: 'pointer',
                    marginTop: '10px', padding: '4px',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#f87171')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#d1d5db')}
                >
                  ล้างตะกร้า
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}