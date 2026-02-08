'use client'

import { useFormStatus } from "react-dom"

export function SubmitButton({ label, className = "" }: { label: string, className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`font-medium py-2 px-6 rounded-lg transition-colors shadow-sm text-white ${
        pending ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-50 hover:bg-orange-600'
      } ${className}`} // อนุญาตให้ส่ง class เพิ่มเติมเข้ามาได้
    >
      {pending ? "กำลังบันทึก..." : label}
    </button>
  );
}
