import { cn } from '@/lib/utils'
import type { RiskStatus } from '@/src/types'

const riskConfig: Record<
  RiskStatus,
  { label: string; className: string }
> = {
  on_track: {
    label: 'On Track',
    className:
      'bg-status-on-track/15 text-status-on-track border border-status-on-track/30',
  },
  at_risk: {
    label: 'At Risk',
    className:
      'bg-status-at-risk/15 text-status-at-risk border border-status-at-risk/30',
  },
  critical: {
    label: 'Critical',
    className:
      'bg-status-critical/15 text-status-critical border border-status-critical/30',
  },
}

interface RiskBadgeProps {
  status: RiskStatus
  size?: 'sm' | 'md'
  className?: string
}

export function RiskBadge({ status, size = 'md', className }: RiskBadgeProps) {
  const config = riskConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-mono font-semibold tracking-wide uppercase',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        config.className,
        className,
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          status === 'on_track' && 'bg-status-on-track',
          status === 'at_risk' && 'bg-status-at-risk',
          status === 'critical' && 'bg-status-critical animate-pulse',
        )}
      />
      {config.label}
    </span>
  )
}
