import { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            fontSize: 20, lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
