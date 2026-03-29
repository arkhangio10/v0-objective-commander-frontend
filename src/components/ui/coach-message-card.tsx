import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface CoachMessageCardProps {
  message: string
  className?: string
  compact?: boolean
}

export function CoachMessageCard({
  message,
  className,
  compact,
}: CoachMessageCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-primary/30 bg-primary/8 px-4 py-3 flex gap-3 items-start',
        className,
      )}
    >
      <div className="mt-0.5 flex-shrink-0 flex h-7 w-7 items-center justify-center rounded border border-primary/40 bg-primary/15">
        <Zap className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex flex-col gap-0.5">
        {!compact && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary/70">
            Coach
          </span>
        )}
        <p className="text-sm font-semibold leading-relaxed text-foreground">{message}</p>
      </div>
    </div>
  )
}
