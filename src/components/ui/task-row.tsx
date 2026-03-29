import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import type { Task } from '@/src/types'

const statusIcon = {
  completed: CheckCircle2,
  in_progress: Clock,
  pending: Circle,
  overdue: AlertCircle,
}

const statusColor: Record<Task['status'], string> = {
  completed: 'text-status-on-track',
  in_progress: 'text-primary',
  pending: 'text-muted-foreground',
  overdue: 'text-status-critical',
}

interface TaskRowProps {
  task: Task
  className?: string
}

export function TaskRow({ task, className }: TaskRowProps) {
  const Icon = statusIcon[task.status]
  const iconColor = statusColor[task.status]

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-3 border-b border-border last:border-0',
        task.status === 'completed' && 'opacity-60',
        className,
      )}
    >
      <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconColor)} />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span
          className={cn(
            'text-sm font-medium leading-snug',
            task.status === 'completed'
              ? 'line-through text-muted-foreground'
              : 'text-foreground',
          )}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-xs',
              task.isOverdue ? 'text-status-critical font-semibold' : 'text-muted-foreground',
            )}
          >
            {task.isOverdue ? 'Overdue · ' : ''}
            {new Date(task.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span
            className={cn(
              'text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded',
              task.source === 'google_tasks'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {task.source === 'google_tasks' ? 'Google Tasks' : 'In-App'}
          </span>
        </div>
      </div>
      {task.source === 'google_tasks' && (
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
      )}
    </div>
  )
}
