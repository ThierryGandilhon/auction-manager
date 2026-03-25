import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  disabled?: boolean
}

const variantMap = {
  primary: 'default',
  ghost: 'outline',
  danger: 'destructive',
} as const

const sizeMap = {
  sm: 'sm',
  md: 'default',
} as const

export default function Btn({ children, onClick, variant = 'ghost', size = 'md', type = 'button', disabled }: Props) {
  return (
    <Button
      type={type}
      onClick={onClick}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
