import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  sub?: string
  valueClassName?: string
}

export default function StatCard({ label, value, sub, valueClassName }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</div>
        <div className={cn('text-3xl font-semibold', valueClassName)}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  )
}
