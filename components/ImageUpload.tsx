'use client'

import { useState, useRef } from 'react'

interface Props {
    currentImage?: string | null
    onUploaded: (url: string) => void
}

export function ImageUpload({ currentImage, onUploaded }: Props) {
    const [preview, setPreview] = useState<string | null>(currentImage ?? null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        setError('')
        setUploading(true)
        const form = new FormData()
        form.append('file', file)

        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? 'อัปโหลดล้มเหลว')
        } else {
            setPreview(data.url)
            onUploaded(data.url)
        }
        setUploading(false)
    }

    return (
        <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                รูปภาพสินค้า
            </label>

            {/* Preview */}
            {preview && (
                <div style={{ marginBottom: '12px' }}>
                    <img
                        src={preview}
                        alt="preview"
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #e5e7eb' }}
                    />
                </div>
            )}

            {/* Upload Area */}
            <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFile(file)
                }}
                style={{
                    border: '2px dashed #fed7aa',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    background: '#fffbf5',
                    transition: 'border-color 0.2s',
                }}
            >
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
                <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, margin: 0 }}>
                    {uploading ? '⏳ กำลังอัปโหลด...' : 'คลิกหรือลากไฟล์มาวาง'}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    JPG, PNG, WEBP (สูงสุด 5MB)
                </p>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                }}
            />

            {error && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                    ⚠️ {error}
                </p>
            )}
        </div>
    )
}
