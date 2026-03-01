'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'

interface Product {
    id: number
    name: string
    price: number
    stock: number
    image?: string | null
}

export function EditProductForm({ product }: { product: Product }) {
    const router = useRouter()
    const [name, setName] = useState(product.name)
    const [price, setPrice] = useState(String(product.price))
    const [stock, setStock] = useState(String(product.stock ?? 0))
    const [image, setImage] = useState<string | null>(product.image ?? null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData()
        formData.append('id', String(product.id))
        formData.append('name', name)
        formData.append('price', price)
        formData.append('stock', stock)
        if (image) formData.append('image', image)

        const res = await fetch('/api/product/update', {
            method: 'POST',
            body: formData,
        })

        if (res.ok) {
            router.push('/admin')  // ✅ กลับไปหน้า admin
            router.refresh()
        } else {
            const data = await res.json()
            setError(data.error ?? 'เกิดข้อผิดพลาด')
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        border: '1.5px solid #e5e7eb',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box' as const,
    }

    return (
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
            <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Image Upload */}
                <ImageUpload currentImage={image} onUploaded={(url) => setImage(url)} />

                {/* Name */}
                <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>ชื่อเมนู</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น ปลาแซลมอน"
                        required
                        style={inputStyle}
                    />
                </div>

                {/* Price */}
                <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>ราคา (บาท)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                {/* Stock */}
                <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>สต็อก (ชิ้น)</label>
                    <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        min="0"
                        required
                        style={inputStyle}
                    />
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <a href="/admin" style={{
                        flex: 1, textAlign: 'center', padding: '13px',
                        border: '1.5px solid #e5e7eb', borderRadius: '12px',
                        color: '#6b7280', fontWeight: 700, fontSize: '14px',
                        textDecoration: 'none', background: '#f9fafb',
                    }}>
                        ← ยกเลิก
                    </a>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1, padding: '13px',
                            background: loading ? '#d1d5db' : 'linear-gradient(135deg, #ea580c, #f97316)',
                            color: '#ffffff', border: 'none',
                            borderRadius: '12px', fontWeight: 700, fontSize: '14px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
                    </button>
                </div>
            </form>
        </div>
    )
}
