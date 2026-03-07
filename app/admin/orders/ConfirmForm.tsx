'use client'

import { FormEventHandler } from 'react'

export function ConfirmForm({
  action,
  children,
  confirmMessage,
  style,
}: {
  action: string | ((formData: FormData) => void)
  children: React.ReactNode
  confirmMessage?: string
  style?: React.CSSProperties
}) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      e.preventDefault()
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} style={style}>
      {children}
    </form>
  )
}
