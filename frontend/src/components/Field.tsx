import { CSSProperties, ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
  style?: CSSProperties
}

export default function Field({ label, children, style }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
