import { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  style?: CSSProperties
  disabled?: boolean
}

export default function Btn({ children, onClick, variant = 'ghost', size = 'md', type = 'button', style, disabled }: Props) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
    transition: 'all 0.15s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    padding: size === 'sm' ? '5px 12px' : '8px 16px',
    fontSize: size === 'sm' ? 13 : 14,
    ...(variant === 'primary' ? {
      background: 'var(--accent)', borderColor: 'var(--accent)',
      color: '#0f0e0c',
    } : variant === 'danger' ? {
      background: 'var(--red-dim)', borderColor: 'var(--red)',
      color: 'var(--red)',
    } : {
      background: 'transparent', borderColor: 'var(--border2)',
      color: 'var(--text2)',
    }),
    ...style,
  }
  return <button type={type} onClick={onClick} style={base} disabled={disabled}>{children}</button>
}
