import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  accent?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 flex flex-col gap-2',
        accent && 'border-primary/40 bg-primary/5',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <Icon
            className={cn('h-4 w-4', accent ? 'text-primary' : 'text-muted-foreground')}
          />
        )}
      </div>
      <span
        className={cn(
          'text-2xl font-bold tracking-tight',
          accent ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs text-muted-foreground">{sub}</span>
      )}
    </div>
  )
}
