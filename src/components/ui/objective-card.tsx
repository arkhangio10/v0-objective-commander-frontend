'use client'

import { cn } from '@/lib/utils'
import { RiskBadge } from './risk-badge'
import { ChevronRight, Calendar, DollarSign, Clock } from 'lucide-react'
import type { Objective } from '@/src/types'

const categoryColors: Record<string, string> = {
  health: 'text-emerald-400 bg-emerald-400/10',
  career: 'text-blue-400 bg-blue-400/10',
  finance: 'text-yellow-400 bg-yellow-400/10',
  education: 'text-purple-400 bg-purple-400/10',
  personal: 'text-pink-400 bg-pink-400/10',
  business: 'text-primary bg-primary/10',
  fitness: 'text-green-400 bg-green-400/10',
  other: 'text-muted-foreground bg-muted',
}

interface ObjectiveCardProps {
  objective: Objective
  onClick?: () => void
  className?: string
}

export function ObjectiveCard({ objective, onClick, className }: ObjectiveCardProps) {
  const progressColor =
    objective.progressPercent >= 75
      ? 'bg-status-on-track'
      : objective.progressPercent >= 40
        ? 'bg-status-at-risk'
        : 'bg-status-critical'

  const catColor = categoryColors[objective.category] ?? categoryColors.other

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border border-border bg-card p-4 flex flex-col gap-3 transition-colors hover:border-primary/40 hover:bg-card/80 active:scale-[0.99]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              'self-start px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest',
              catColor,
            )}
          >
            {objective.category}
          </span>
          <h3 className="text-sm font-semibold text-foreground text-balance leading-snug pr-4">
            {objective.title}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-mono font-semibold text-foreground">
            {objective.progressPercent}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', progressColor)}
            style={{ width: `${objective.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 flex-wrap">
        <RiskBadge status={objective.riskStatus} size="sm" />

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {new Date(objective.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3" />
          <span>
            ${objective.moneySpent.toLocaleString()} / ${objective.budgetLimit.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
          <Clock className="h-3 w-3" />
          <span>CP {objective.checkpointHours[0]}:00</span>
        </div>
      </div>
    </button>
  )
}
