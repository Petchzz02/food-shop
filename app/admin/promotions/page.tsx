import pool from '@/lib/db'
import { addPromotion, togglePromotionStatus } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { DeletePromotionForm } from '@/components/DeletePromotionForm'

export default async function AdminPromotionsPage() {
    const [promotions] = await pool.execute('SELECT * FROM Promotion ORDER BY id DESC') as any[]

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '0 0 60px' }}>

            {/* Page Header */}
            <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '28px 32px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontWeight: 900, fontSize: '24px', color: '#1f2937', margin: '0 0 4px' }}>
                            📣 จัดการโปรโมชั่น
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>เพิ่ม / แก้ไข / เปิดปิด โปรโมชั่น</p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Add Promotion Form */}
                <div style={{ background: '#ffffff', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', padding: '28px' }}>
                    <h2 style={{ fontWeight: 800, fontSize: '16px', color: '#374151', marginBottom: '18px' }}>
                        ➕ สร้างโปรโมชั่นใหม่
                    </h2>
                    <form action={addPromotion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <input
                                type="text" name="title"
                                placeholder="หัวข้อโปรโมชั่น (เช่น ซื้อ 1 แถม 1)"
                                required
                                style={{ flex: 1, minWidth: '220px', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
                            />
                            <input
                                type="text" name="imageUrl"
                                placeholder="URL รูปภาพ (ถ้ามี)"
                                style={{ flex: 1, minWidth: '220px', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <textarea
                            name="description"
                            placeholder="รายละเอียดโปรโมชั่น (ไม่บังคับ)"
                            rows={3}
                            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" name="isActive" id="isActive" defaultChecked style={{ width: '18px', height: '18px' }} />
                            <label htmlFor="isActive" style={{ fontSize: '14px', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>เปิดใช้งานทันที</label>
                        </div>
                        <div style={{ alignSelf: 'flex-start' }}>
                            <SubmitButton label="➕ เพิ่มโปรโมชั่น" />
                        </div>
                    </form>
                </div>

                {/* Promotion List */}
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937', marginBottom: '16px' }}>
                        📋 รายการโปรโมชั่นทั้งหมด ({(promotions as any[]).length} รายการ)
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(promotions as any[]).map((promo) => (
                            <div key={promo.id} style={{
                                background: '#ffffff', borderRadius: '20px',
                                border: '1px solid #e5e7eb', padding: '24px',
                                display: 'flex', gap: '20px', alignItems: 'flex-start',
                                flexDirection: 'row',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}>
                                {promo.imageUrl ? (
                                    <img src={promo.imageUrl} alt={promo.title} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 }} />
                                ) : (
                                    <div style={{ width: '120px', height: '120px', background: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>
                                        📣
                                    </div>
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937', margin: 0 }}>{promo.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px',
                                                background: promo.isActive ? '#dcfce7' : '#f3f4f6',
                                                color: promo.isActive ? '#16a34a' : '#6b7280'
                                            }}>
                                                {promo.isActive ? '✅ ใช้งานอยู่' : '❌ ปิดใช้งาน'}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.5 }}>
                                        {promo.description || 'ไม่มีรายละเอียด'}
                                    </p>

                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {/* Toggle Status */}
                                        <form action={togglePromotionStatus}>
                                            <input type="hidden" name="id" value={promo.id} />
                                            <input type="hidden" name="isActive" value={promo.isActive ? 0 : 1} />
                                            <button type="submit" style={{
                                                background: promo.isActive ? '#fffbeb' : '#ecfdf5',
                                                color: promo.isActive ? '#b45309' : '#059669',
                                                border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                                            }}>
                                                {promo.isActive ? '⏸️ ระงับ' : '▶️ เปิดใช้'}
                                            </button>
                                        </form>

                                        {/* Delete */}
                                        <DeletePromotionForm id={promo.id} title={promo.title} />
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px' }}>
                                        สร้างเมื่อ: {new Date(promo.createdAt).toLocaleString('th-TH')}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {promotions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
                                <p style={{ fontWeight: 600, fontSize: '16px' }}>ยังไม่มีโปรโมชั่น</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
