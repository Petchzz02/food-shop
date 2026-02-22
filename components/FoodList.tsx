'use client'

import { useState } from "react"
import { submitOrder } from '@/app/actions'
import { deleteProduct } from '@/app/actions'

interface Product {
  id: number
  name: string
  price: number
}

type CartItem = { id: number; name: string; price: number; count: number }

export function FoodList({ products, userId }: { products: Product[]; userId?: number | null }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [ordered, setOrdered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)

  const addToCart = (product: Product) => {
    setOrdered(false)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, count: item.count + 1 } : item)
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

  const handleOrder = async () => {
    if (cart.length === 0) return
    setLoading(true)
    const result = await submitOrder(cart.map((i) => ({ id: i.id, count: i.count })))
    setCart([])
    setOrdered(true)
    setEarnedPoints(result?.earnedPoints ?? 0)
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
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

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
              return (
                <div key={item.id} style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  border: inCart ? '2px solid #f97316' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '32px', flexShrink: 0,
                  }}>
                    {emojis[i % emojis.length]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ color: '#ea580c', fontWeight: 800, fontSize: '18px', marginTop: '2px' }}>
                      {item.price.toLocaleString()} ฿
                    </p>
                  </div>

                  {/* Admin edit/delete */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
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
                  </div>

                  {/* Add/Remove buttons */}
                  {inCart ? (
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
                      <button onClick={() => addToCart(item)} style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#ea580c', border: 'none',
                        color: '#ffffff', fontSize: '20px', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      <div style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '80px' }}>
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
                    ⭐ ได้รับ {earnedPoints} แต้มสะสม!
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

                {/* Total */}
                <div style={{
                  borderTop: '1.5px dashed #e5e7eb',
                  paddingTop: '16px', marginBottom: '16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 700, color: '#374151' }}>รวมทั้งสิ้น</span>
                  <span style={{ fontWeight: 900, fontSize: '24px', color: '#ea580c' }}>
                    {totalPrice.toLocaleString()} ฿
                  </span>
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
                  onClick={() => setCart([])}
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