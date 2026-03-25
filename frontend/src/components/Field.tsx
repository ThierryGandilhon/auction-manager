import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface Props {
  label: string
  children: ReactNode
}

export default function Field({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
