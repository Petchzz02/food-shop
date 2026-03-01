// app/edit/[id]/page.tsx
import pool from '@/lib/db'
import { redirect } from 'next/navigation'
import { EditProductForm } from './EditProductForm'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [rows] = await pool.execute('SELECT * FROM Product WHERE id = ?', [Number(id)]) as any[]
  const product = (rows as any[])[0]
  if (!product) redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <EditProductForm product={product} />
      </div>
    </div>
  )
}
