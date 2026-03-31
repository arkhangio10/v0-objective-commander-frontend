'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ScreenHeader } from '@/src/components/screen-header'
import { RiskBadge } from '@/src/components/ui/risk-badge'
import { StatCard } from '@/src/components/ui/stat-card'
import { CoachMessageCard } from '@/src/components/ui/coach-message-card'
import { ProgressNotesPanel } from '@/src/components/ui/progress-notes-panel'
import { MilestoneCard } from '@/src/components/ui/milestone-card'
import { TaskRow } from '@/src/components/ui/task-row'
import { ExpenseRow } from '@/src/components/ui/expense-row'
import { EmptyState } from '@/src/components/ui/empty-state'
import { Skeleton } from '@/src/components/ui/loading-skeleton'
import {
  objectivesService,
  milestonesService,
  tasksService,
  expensesService,
  analyticsService,
} from '@/src/services/api'
import type { Objective, Milestone, Task, Expense, AnalyticsSnapshot, DailyPlan } from '@/src/types'
import { cn } from '@/lib/utils'
import {
  Calendar,
  DollarSign,
  TrendingUp,
  ListTodo,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Tab = 'overview' | 'milestones' | 'tasks' | 'expenses' | 'analytics'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'analytics', label: 'Analytics' },
]

const analyticsChartData = [
  { day: 'W1', expected: 12, actual: 10 },
  { day: 'W2', expected: 24, actual: 18 },
  { day: 'W3', expected: 36, actual: 28 },
  { day: 'W4', expected: 48, actual: 38 },
  { day: 'W5', expected: 58, actual: 44 },
  { day: 'W6', expected: 61, actual: 52 },
]

export default function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [tab, setTab] = useState<Tab>('overview')
  const [objective, setObjective] = useState<Objective | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null)
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [generatingPlan, setGeneratingPlan] = useState(false)

  useEffect(() => {
    async function load() {
      const [obj, ms, ts, exps, an, plan] = await Promise.all([
        objectivesService.getById(id),
        milestonesService.listByObjective(id),
        tasksService.listByObjective(id),
        expensesService.listByObjective(id),
        analyticsService.getSnapshot(id),
        objectivesService.getDailyPlan(id).catch(() => null),
      ])
      setObjective(obj)
      setMilestones(ms)
      setTasks(ts)
      setExpenses(exps)
      setAnalytics(an)
      setDailyPlan(plan)
      setLoading(false)
    }
    load()
  }, [id])

  async function reloadObjectiveData() {
    const [obj, ms, ts, exps, an, plan] = await Promise.all([
      objectivesService.getById(id),
      milestonesService.listByObjective(id),
      tasksService.listByObjective(id),
      expensesService.listByObjective(id),
      analyticsService.getSnapshot(id),
      objectivesService.getDailyPlan(id).catch(() => null),
    ])
    setObjective(obj)
    setMilestones(ms)
    setTasks(ts)
    setExpenses(exps)
    setAnalytics(an)
    setDailyPlan(plan)
  }

  async function handleGeneratePlan() {
    setGeneratingPlan(true)
    try {
      await objectivesService.generatePlan(id)
      await reloadObjectiveData()
      setTab('tasks')
    } finally {
      setGeneratingPlan(false)
    }
  }

  async function handleResync() {
    setSyncing(true)
    try {
      await objectivesService.resyncTasks(id)
      await reloadObjectiveData()
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b border-border" />
        <div className="p-4 flex flex-col gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!objective) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Objective not found.</p>
      </div>
    )
  }

  const budgetUsedPct = objective.budgetLimit > 0
    ? Math.round((objective.moneySpent / objective.budgetLimit) * 100)
    : 0

  const todayTasks = tasks.filter(
    (t) => t.dueDate === new Date().toISOString().split('T')[0] && t.status !== 'completed',
  )
  const upcomingTasks = tasks.filter(
    (t) => new Date(t.dueDate) > new Date() && t.status !== 'completed',
  )
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="min-h-screen bg-background pb-8">
      <ScreenHeader
        title={objective.title}
        subtitle={objective.category}
        backHref="/objectives"
        right={
          <div className="flex items-center gap-2">
            <RiskBadge status={objective.riskStatus} size="sm" />
            {objective.riskStatus !== 'on_track' && (
              <Link
                href={`/objectives/${id}/recovery`}
                className="rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wide border border-status-critical/30 bg-status-critical/10 text-status-critical hover:bg-status-critical/20 transition-colors"
              >
                Recovery
              </Link>
            )}
          </div>
        }
      />

      {/* Progress hero */}
      <div className="px-4 pt-4 pb-0">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-xl font-bold font-mono text-foreground">
              {objective.progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                objective.riskStatus === 'on_track'
                  ? 'bg-status-on-track'
                  : objective.riskStatus === 'at_risk'
                    ? 'bg-status-at-risk'
                    : 'bg-status-critical',
              )}
              style={{ width: `${objective.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Started {new Date(objective.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Deadline{' '}
              {new Date(objective.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 sticky top-14 z-30 bg-background/95 backdrop-blur pb-1">
        <div className="flex gap-0 border-b border-border overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-2 text-xs font-mono uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors',
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGeneratePlan}
            disabled={generatingPlan}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-mono uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {generatingPlan ? 'Generating Plan...' : 'Generate Plan'}
          </button>
          <button
            onClick={handleResync}
            disabled={syncing}
            className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-mono uppercase tracking-wide text-primary transition-colors hover:bg-primary/15 disabled:opacity-60"
          >
            {syncing ? 'Syncing...' : 'Sync to Google Tasks'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="flex flex-col gap-4">
            <ProgressNotesPanel
              objectiveId={id}
              targetOutcome={objective.targetOutcome}
              onSaved={reloadObjectiveData}
            />

            {/* Coach */}
            <CoachMessageCard message={objective.coachMessage} />

            {dailyPlan && (
              <div className="rounded-lg border border-primary/20 bg-primary/8 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-primary/80">
                      Today's Execution Plan
                    </p>
                    <p className="mt-1 text-sm text-foreground">{dailyPlan.focusSummary}</p>
                  </div>
                  <div className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-mono text-primary">
                    {dailyPlan.workloadLevel}
                  </div>
                </div>
                {dailyPlan.recommendedTimeBlocks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dailyPlan.recommendedTimeBlocks.map((block) => (
                      <span
                        key={block}
                        className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-primary"
                      >
                        {block}
                      </span>
                    ))}
                  </div>
                )}
                {dailyPlan.adaptationNotes.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-primary/15 pt-3">
                    {dailyPlan.adaptationNotes.map((note, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Objective
              </p>
              <p className="text-sm text-foreground leading-relaxed">{objective.description}</p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Target Outcome
                </p>
                <p className="text-sm font-medium text-foreground">{objective.targetOutcome}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                label="Feasibility"
                value={`${objective.feasibilityScore}%`}
                sub="score"
                icon={TrendingUp}
                accent={objective.feasibilityScore >= 70}
              />
              <StatCard
                label="Consistency"
                value={`${objective.consistencyScore}%`}
                sub="score"
              />
              <StatCard
                label="Money Spent"
                value={`$${objective.moneySpent.toLocaleString()}`}
                sub={`of $${objective.budgetLimit.toLocaleString()} budget`}
                icon={DollarSign}
              />
              <StatCard
                label="Schedule"
                value={
                  objective.scheduleVariance >= 0
                    ? `+${objective.scheduleVariance}d`
                    : `${objective.scheduleVariance}d`
                }
                sub={
                  objective.scheduleVariance >= 0 ? 'ahead of plan' : 'behind plan'
                }
              />
            </div>

            {/* Budget bar */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Budget Usage
                </p>
                <span
                  className={cn(
                    'text-xs font-mono font-semibold',
                    budgetUsedPct > 90
                      ? 'text-status-critical'
                      : budgetUsedPct > 70
                        ? 'text-status-at-risk'
                        : 'text-status-on-track',
                  )}
                >
                  {budgetUsedPct}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    budgetUsedPct > 90
                      ? 'bg-status-critical'
                      : budgetUsedPct > 70
                        ? 'bg-status-at-risk'
                        : 'bg-status-on-track',
                  )}
                  style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                <span>${objective.moneySpent.toLocaleString()} spent</span>
                <span>${(objective.budgetLimit - objective.moneySpent).toLocaleString()} remaining</span>
              </div>
            </div>
          </div>
        )}

        {/* ── MILESTONES TAB ───────────────────────────────────────── */}
        {tab === 'milestones' && (
          <div className="flex flex-col gap-3">
            {milestones.length === 0 ? (
              <EmptyState icon={ListTodo} title="No milestones" description="Milestones will appear as the plan is generated." />
            ) : (
              milestones.map((m) => <MilestoneCard key={m.id} milestone={m} />)
            )}
          </div>
        )}

        {/* ── TASKS TAB ────────────────────────────────────────────── */}
        {tab === 'tasks' && (
          <div className="flex flex-col gap-4">
            {dailyPlan && dailyPlan.recommendedTasks.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Today&apos;s Planned Tasks
                </p>
                <div className="rounded-lg border border-primary/20 bg-primary/6 p-4">
                  {dailyPlan.whyToday.length > 0 && (
                    <div className="mb-3 rounded border border-border bg-card p-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Why These Tasks
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {dailyPlan.whyToday.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3">
                    {dailyPlan.recommendedTasks.map((task) => (
                      <div key={task.taskId} className="rounded border border-border bg-card px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{task.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{task.reason}</p>
                          </div>
                          <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase text-primary">
                            {task.priority}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                          <span>{task.effortEstimate || 'Unspecified effort'}</span>
                          <span>Due {task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {dailyPlan.patternInsights.length > 0 && (
                    <div className="mt-3 border-t border-primary/15 pt-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Pattern Insights
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {dailyPlan.patternInsights.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dailyPlan.tomorrowPreview.length > 0 && (
                    <div className="mt-3 border-t border-primary/15 pt-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Tomorrow Preview
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {dailyPlan.tomorrowPreview.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Google Tasks banner */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/8 px-4 py-3 flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-blue-500/30 bg-blue-500/15 flex-shrink-0">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">Task completion via Google Tasks</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Planning happens here. Mark tasks complete in Google Tasks — progress syncs automatically.
                </p>
              </div>
              <button
                onClick={handleResync}
                disabled={syncing}
                className="flex-shrink-0 rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wide border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} />
              </button>
            </div>

            {/* Today */}
            {todayTasks.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Today
                </p>
                <div className="rounded-lg border border-border bg-card px-4">
                  {todayTasks.map((t) => <TaskRow key={t.id} task={t} />)}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingTasks.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Upcoming
                </p>
                <div className="rounded-lg border border-border bg-card px-4">
                  {upcomingTasks.map((t) => <TaskRow key={t.id} task={t} />)}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedTasks.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Completed ({completedTasks.length})
                </p>
                <div className="rounded-lg border border-border bg-card px-4">
                  {completedTasks.map((t) => <TaskRow key={t.id} task={t} />)}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <EmptyState icon={ListTodo} title="No tasks yet" description="Tasks will appear once the plan is generated and synced." />
            )}
          </div>
        )}

        {/* ── EXPENSES TAB ─────────────────────────────────────────── */}
        {tab === 'expenses' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Spent" value={`$${objective.moneySpent.toLocaleString()}`} icon={DollarSign} accent />
              <StatCard label="Budget" value={`$${objective.budgetLimit.toLocaleString()}`} />
              <StatCard
                label="Remaining"
                value={`$${(objective.budgetLimit - objective.moneySpent).toLocaleString()}`}
                sub={`${100 - budgetUsedPct}% left`}
              />
              <StatCard
                label="Burn Rate"
                value="$420/wk"
                sub="projected"
              />
            </div>

            {expenses.length === 0 ? (
              <EmptyState icon={DollarSign} title="No expenses logged" description="Log expenses to track budget usage." />
            ) : (
              <div className="rounded-lg border border-border bg-card px-4">
                {expenses.map((exp) => <ExpenseRow key={exp.id} expense={exp} />)}
              </div>
            )}

            <Link
              href="/expenses"
              className="w-full rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary text-center hover:bg-primary/15 transition-colors"
            >
              + Log Expense
            </Link>
          </div>
        )}

        {/* ── ANALYTICS TAB ────────────────────────────────────────── */}
        {tab === 'analytics' && analytics && (
          <div className="flex flex-col gap-4">
            {/* Progress chart */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                Expected vs Actual Progress
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={analyticsChartData}>
                  <defs>
                    <linearGradient id="expected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.62 0.22 250)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.62 0.22 250)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.60 0.18 145)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.60 0.18 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'oklch(0.55 0.01 240)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'oklch(0.55 0.01 240)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.14 0.008 240)',
                      border: '1px solid oklch(0.22 0.010 240)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'oklch(0.95 0.005 240)' }}
                  />
                  <Area type="monotone" dataKey="expected" stroke="oklch(0.62 0.22 250)" strokeWidth={2} fill="url(#expected)" name="Expected" />
                  <Area type="monotone" dataKey="actual" stroke="oklch(0.60 0.18 145)" strokeWidth={2} fill="url(#actual)" name="Actual" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded-full bg-primary inline-block" />
                  <span className="text-[10px] text-muted-foreground">Expected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded-full bg-status-on-track inline-block" />
                  <span className="text-[10px] text-muted-foreground">Actual</span>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Consistency" value={`${analytics.consistencyScore}%`} icon={BarChart2} />
              <StatCard label="Feasibility" value={`${analytics.feasibilityScore}%`} icon={TrendingUp} accent={analytics.feasibilityScore >= 70} />
              <StatCard label="Schedule Δ" value={`${analytics.scheduleVariance}d`} sub={analytics.scheduleVariance < 0 ? 'behind' : 'ahead'} />
              <StatCard label="Pace Needed" value={`${analytics.paceRequired}`} sub="tasks/day" />
            </div>

            {/* Spend projection */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                Spend Projection
              </p>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ${analytics.projectedTotalSpend.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">projected total</p>
                </div>
                {analytics.projectedTotalSpend <= objective.budgetLimit ? (
                  <div className="flex items-center gap-1.5 rounded px-2 py-1 bg-status-on-track/10 border border-status-on-track/30">
                    <CheckCircle className="h-3 w-3 text-status-on-track" />
                    <span className="text-xs font-mono text-status-on-track">Within budget</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded px-2 py-1 bg-status-at-risk/10 border border-status-at-risk/30">
                    <AlertTriangle className="h-3 w-3 text-status-at-risk" />
                    <span className="text-xs font-mono text-status-at-risk">Over budget</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
