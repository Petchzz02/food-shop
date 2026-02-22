// app/edit/[id]/page.tsx
import pool from '@/lib/db'
import { updateProduct } from '@/app/actions'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/components/SubmitButton'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [rows] = await pool.execute('SELECT * FROM Product WHERE id = ?', [Number(id)]) as any[]
  const product = (rows as any[])[0]
  if (!product) redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ background: '#ffffff', borderRadius: '28px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1.5px solid #fed7aa' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', padding: '32px 32px 28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>✏️</div>
            <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '24px', margin: 0 }}>แก้ไขเมนู</h1>
            <p style={{ color: '#fed7aa', fontSize: '13px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </p>
          </div>

          {/* Form */}
          <form action={updateProduct} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="hidden" name="id" value={product.id} />

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                ชื่อเมนู
              </label>
              <input
                type="text" name="name"
                defaultValue={product.name}
                placeholder="เช่น ปลาแซลมอน"
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                ราคา (บาท)
              </label>
              <input
                type="number" name="price"
                defaultValue={product.price}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <a href="/" style={{
                flex: 1, textAlign: 'center', padding: '13px',
                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                color: '#6b7280', fontWeight: 700, fontSize: '14px',
                textDecoration: 'none', background: '#f9fafb',
              }}>
                ← ยกเลิก
              </a>
              <div style={{ flex: 1 }}>
                <SubmitButton label="💾 บันทึก" className="w-full" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

