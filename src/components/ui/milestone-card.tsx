import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, AlertCircle, ListTodo } from 'lucide-react'
import type { Milestone } from '@/src/types'

const statusConfig: Record<
  Milestone['status'],
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-status-on-track' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-primary' },
  not_started: { label: 'Not Started', icon: Circle, color: 'text-muted-foreground' },
  overdue: { label: 'Overdue', icon: AlertCircle, color: 'text-status-critical' },
}

interface MilestoneCardProps {
  milestone: Milestone
  className?: string
}

export function MilestoneCard({ milestone, className }: MilestoneCardProps) {
  const config = statusConfig[milestone.status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 flex flex-col gap-3',
        milestone.status === 'overdue' && 'border-status-critical/30',
        milestone.status === 'completed' && 'opacity-70',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.color)} />
          <div>
            <h4 className="text-sm font-semibold text-foreground leading-snug">
              {milestone.title}
            </h4>
            {milestone.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
            )}
          </div>
        </div>
        <span className={cn('text-xs font-mono font-semibold flex-shrink-0', config.color)}>
          {config.label}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Completion</span>
          <span className="font-mono font-semibold text-foreground">
            {milestone.completionPercent}%
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full',
              milestone.status === 'overdue'
                ? 'bg-status-critical'
                : milestone.status === 'completed'
                  ? 'bg-status-on-track'
                  : 'bg-primary',
            )}
            style={{ width: `${milestone.completionPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <ListTodo className="h-3 w-3" />
          <span>{milestone.linkedTasksCount} tasks</span>
        </div>
        <span>
          Due{' '}
          {new Date(milestone.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  )
}
