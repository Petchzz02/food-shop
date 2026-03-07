// app/promotions/page.tsx
import pool from '@/lib/db'

export default async function PromotionsPage() {
    const [promotions] = await pool.execute('SELECT * FROM Promotion WHERE isActive = 1 ORDER BY id DESC') as any[]

    return (
        <>
            <div style={{ minHeight: 'calc(100vh - 64px)', background: '#fff7ed', padding: '40px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontWeight: 900, fontSize: '32px', color: '#ea580c', margin: '0 0 12px' }}>
                            📣 โปรโมชั่นพิเศษสุดคุ้ม!
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                            อัปเดตสิทธิพิเศษและข่าวสารโปรโมชั่นใหม่ ๆ จาก U-ra Seafood
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {(promotions as any[]).map((promo) => (
                            <div key={promo.id} style={{
                                background: '#ffffff', borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 12px 32px rgba(234,88,12,0.08)',
                                border: '1.5px solid #fed7aa',
                                transition: 'transform 0.2s',
                            }}>
                                {promo.imageUrl && (
                                    <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
                                        <img
                                            src={promo.imageUrl}
                                            alt={promo.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                <div style={{ padding: '32px' }}>
                                    <h2 style={{ fontWeight: 800, fontSize: '24px', color: '#1f2937', margin: '0 0 12px' }}>
                                        {promo.title}
                                    </h2>
                                    <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: 1.6, margin: '0 0 24px', whiteSpace: 'pre-wrap' }}>
                                        {promo.description}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                                        ประกาศเมื่อ: {new Date(promo.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {promotions.length === 0 && (
                            <div style={{
                                background: '#ffffff', borderRadius: '24px',
                                textAlign: 'center', padding: '60px 20px',
                                border: '2px dashed #fed7aa'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🦐</div>
                                <p style={{ fontWeight: 700, fontSize: '18px', color: '#6b7280', margin: 0 }}>
                                    รอติดตามโปรโมชั่นใหม่เร็ว ๆ นี้!
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    )
}
