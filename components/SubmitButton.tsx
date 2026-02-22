'use client'

import { useFormStatus } from "react-dom"

export function SubmitButton({ label, className = "" }: { label: string; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{
        background: pending ? '#d1d5db' : 'linear-gradient(135deg, #ea580c, #f97316)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: pending ? 'not-allowed' : 'pointer',
        boxShadow: pending ? 'none' : '0 4px 12px rgba(234,88,12,0.3)',
        whiteSpace: 'nowrap',
      }}
    >
      {pending ? '⏳ กำลังบันทึก...' : label}
    </button>
  )
}
