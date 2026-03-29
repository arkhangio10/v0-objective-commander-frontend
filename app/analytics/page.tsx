'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/src/components/app-shell'
import { ScreenHeader } from '@/src/components/screen-header'
import { StatCard } from '@/src/components/ui/stat-card'
import { RiskBadge } from '@/src/components/ui/risk-badge'
import { objectivesService, analyticsService } from '@/src/services/api'
import type { Objective, AnalyticsSnapshot } from '@/src/types'
import { Skeleton } from '@/src/components/ui/loading-skeleton'
import { TrendingUp, BarChart2, DollarSign } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

const progressData = [
  { week: 'W1', expected: 12, actual: 10 },
  { week: 'W2', expected: 24, actual: 18 },
  { week: 'W3', expected: 36, actual: 28 },
  { week: 'W4', expected: 48, actual: 38 },
  { week: 'W5', expected: 58, actual: 44 },
  { week: 'Now', expected: 61, actual: 52 },
]

const spendData = [
  { month: 'Jan', spent: 210 },
  { month: 'Feb', spent: 890 },
  { month: 'Mar', spent: 740 },
]

export default function AnalyticsPage() {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string>('obj_001')

  useEffect(() => {
    async function load() {
      const [objs, an] = await Promise.all([
        objectivesService.list(),
        analyticsService.getSnapshot('obj_001'),
      ])
      setObjectives(objs.data)
      setAnalytics(an)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSelect(id: string) {
    setSelected(id)
    const an = await analyticsService.getSnapshot(id)
    setAnalytics(an)
  }

  const selectedObj = objectives.find((o) => o.id === selected)

  return (
    <AppShell>
      <ScreenHeader title="Analytics" subtitle="Performance overview" />

      <div className="flex flex-col gap-4 p-4">
        {/* Objective selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {loading
            ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-28 flex-shrink-0 rounded-lg" />)
            : objectives.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => handleSelect(obj.id)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-mono border transition-colors ${
                    selected === obj.id
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-secondary text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {obj.title.length > 16 ? obj.title.slice(0, 16) + '…' : obj.title}
                </button>
              ))}
        </div>

        {loading || !analytics || !selectedObj ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : (
          <>
            {/* Objective header */}
            <div className="rounded-lg border border-border bg-card p-4 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{selectedObj.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{selectedObj.category}</p>
              </div>
              <RiskBadge status={selectedObj.riskStatus} size="sm" />
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                label="Expected"
                value={`${analytics.expectedProgress}%`}
                sub="on schedule"
                icon={TrendingUp}
              />
              <StatCard
                label="Actual"
                value={`${analytics.actualProgress}%`}
                sub="completed"
                icon={BarChart2}
                accent={analytics.actualProgress >= analytics.expectedProgress}
              />
              <StatCard
                label="Consistency"
                value={`${analytics.consistencyScore}%`}
              />
              <StatCard
                label="Feasibility"
                value={`${analytics.feasibilityScore}%`}
                accent={analytics.feasibilityScore >= 70}
              />
            </div>

            {/* Progress over time */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                Progress Over Time
              </p>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.62 0.22 250)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="oklch(0.62 0.22 250)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.60 0.18 145)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="oklch(0.60 0.18 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'oklch(0.55 0.01 240)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'oklch(0.55 0.01 240)' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'oklch(0.14 0.008 240)', border: '1px solid oklch(0.22 0.010 240)', borderRadius: '8px', fontSize: '11px' }}
                    labelStyle={{ color: 'oklch(0.95 0.005 240)' }}
                  />
                  <Area type="monotone" dataKey="expected" stroke="oklch(0.62 0.22 250)" strokeWidth={2} fill="url(#gradExp)" name="Expected %" />
                  <Area type="monotone" dataKey="actual" stroke="oklch(0.60 0.18 145)" strokeWidth={2} fill="url(#gradAct)" name="Actual %" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-full bg-primary inline-block" />
                  <span className="text-[10px] text-muted-foreground">Expected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-full bg-status-on-track inline-block" />
                  <span className="text-[10px] text-muted-foreground">Actual</span>
                </div>
              </div>
            </div>

            {/* Schedule variance */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                Schedule Variance
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span
                  className={`text-3xl font-bold font-mono ${
                    analytics.scheduleVariance < 0 ? 'text-status-critical' : 'text-status-on-track'
                  }`}
                >
                  {analytics.scheduleVariance > 0 ? '+' : ''}
                  {analytics.scheduleVariance}
                </span>
                <span className="text-sm text-muted-foreground pb-1">days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.scheduleVariance < 0
                  ? `You are ${Math.abs(analytics.scheduleVariance)} days behind. A pace of ${analytics.paceRequired} tasks/day is required to recover.`
                  : 'You are ahead of schedule. Maintain current pace.'}
              </p>
            </div>

            {/* Monthly spend */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Monthly Spend
                </p>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={spendData} barSize={28}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'oklch(0.55 0.01 240)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'oklch(0.14 0.008 240)', border: '1px solid oklch(0.22 0.010 240)', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: number) => [`$${v}`, 'Spent']}
                  />
                  <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                    {spendData.map((_, i) => (
                      <Cell key={i} fill="oklch(0.62 0.22 250)" opacity={0.7 + i * 0.15} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk trend */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                Risk Trend
              </p>
              <div className="flex items-center gap-2">
                {analytics.riskTrend.map((risk, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-8 w-8 rounded flex items-center justify-center text-[10px] font-mono ${
                        risk === 'on_track'
                          ? 'bg-status-on-track/20 text-status-on-track'
                          : risk === 'at_risk'
                            ? 'bg-status-at-risk/20 text-status-at-risk'
                            : 'bg-status-critical/20 text-status-critical'
                      }`}
                    >
                      {risk === 'on_track' ? 'OK' : risk === 'at_risk' ? 'AR' : 'CR'}
                    </div>
                    <span className="text-[9px] text-muted-foreground">W{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pace required */}
            <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Required Pace
                </p>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  {analytics.paceRequired} <span className="text-base font-normal text-muted-foreground">tasks/day</span>
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
