import { cn } from '@/lib/utils'
import type { Expense } from '@/src/types'
import {
  Utensils,
  Car,
  Wrench,
  RefreshCw,
  BookOpen,
  Heart,
  MoreHorizontal,
} from 'lucide-react'

const categoryConfig: Record<
  Expense['category'],
  { label: string; icon: typeof Utensils; color: string }
> = {
  food: { label: 'Food', icon: Utensils, color: 'text-orange-400 bg-orange-400/10' },
  transport: { label: 'Transport', icon: Car, color: 'text-sky-400 bg-sky-400/10' },
  tools: { label: 'Tools', icon: Wrench, color: 'text-violet-400 bg-violet-400/10' },
  subscriptions: { label: 'Subscriptions', icon: RefreshCw, color: 'text-primary bg-primary/10' },
  study: { label: 'Study', icon: BookOpen, color: 'text-yellow-400 bg-yellow-400/10' },
  health: { label: 'Health', icon: Heart, color: 'text-emerald-400 bg-emerald-400/10' },
  misc: { label: 'Misc', icon: MoreHorizontal, color: 'text-muted-foreground bg-muted' },
}

interface ExpenseRowProps {
  expense: Expense
  className?: string
}

export function ExpenseRow({ expense, className }: ExpenseRowProps) {
  const config = categoryConfig[expense.category]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 border-b border-border last:border-0',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0',
          config.color.split(' ')[1],
        )}
      >
        <Icon className={cn('h-3.5 w-3.5', config.color.split(' ')[0])} />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">
          {expense.note ?? config.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(expense.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {config.label}
          </span>
        </div>
      </div>
      <span className="text-sm font-mono font-semibold text-foreground flex-shrink-0">
        ${expense.amount.toFixed(2)}
      </span>
    </div>
  )
}
