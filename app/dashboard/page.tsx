'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/src/components/app-shell'
import { StatCard } from '@/src/components/ui/stat-card'
import { CoachMessageCard } from '@/src/components/ui/coach-message-card'
import { TaskRow } from '@/src/components/ui/task-row'
import { RiskBadge } from '@/src/components/ui/risk-badge'
import { DashboardSkeleton } from '@/src/components/ui/loading-skeleton'
import { authService, dashboardService, objectivesService } from '@/src/services/api'
import type { DashboardData, Objective, User } from '@/src/types'
import {
  Target,
  DollarSign,
  Plus,
  TrendingUp,
  Clock,
  ChevronRight,
  BarChart2,
  Bell,
  CalendarClock,
} from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [dash, objs, session] = await Promise.all([
          dashboardService.getDashboard(),
          objectivesService.list(),
          authService.getSession(),
        ])
        setData(dash)
        setObjectives(objs.data)
        setUser(session)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton />

  if (!data) {
    return (
      <AppShell>
        <div className="p-4">
          <div className="rounded-lg border border-status-critical/30 bg-status-critical/10 p-4 text-sm text-status-critical">
            {error || 'Dashboard data is unavailable.'}
          </div>
        </div>
      </AppShell>
    )
  }

  const now = new Date()
  const hours = now.getHours()
  const greeting =
    hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppShell>
      <div className="flex flex-col gap-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              {greeting}
            </span>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {user?.displayName || user?.email || 'Objective Commander'}
            </h1>
            <span className="text-xs text-muted-foreground">{data.today}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-xs font-mono font-semibold text-primary">
                CP {data.nextCheckpoint}
              </span>
            </div>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Coach message */}
        <div className="px-4 pt-2 pb-3">
          <CoachMessageCard message={data.coachMessage} />
        </div>

        {data.todayPriorityTasks.length > 0 && (
          <div className="px-4 pb-3">
            <div className="rounded-lg border border-primary/20 bg-primary/8 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-primary/70">
                    Today&apos;s Execution Window
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    Focus on the recommended tasks first, then review tomorrow&apos;s carryover during your next checkpoint.
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <CalendarClock className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-3">
          <StatCard
            label="Active"
            value={data.activeObjectivesCount}
            sub="objectives"
            icon={Target}
          />
          <StatCard
            label="This Week"
            value={`$${data.totalSpentThisWeek}`}
            sub="spent"
            icon={DollarSign}
          />
          <div className="rounded-lg border border-status-on-track/30 bg-status-on-track/8 p-4 flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-status-on-track/70">
              On Track
            </span>
            <span className="text-2xl font-bold text-status-on-track">
              {data.onTrackCount}
            </span>
          </div>
          <div className="rounded-lg border border-status-critical/30 bg-status-critical/8 p-4 flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-status-critical/70">
              Critical
            </span>
            <span className="text-2xl font-bold text-status-critical">
              {data.criticalCount}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Quick Actions
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: '/objectives/create', label: 'New Objective', icon: Plus, primary: true },
              { href: '/expenses', label: 'Log Expense', icon: DollarSign, primary: false },
              { href: '/analytics', label: 'Analytics', icon: BarChart2, primary: false },
            ].map(({ href, label, icon: Icon, primary }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-2 rounded-lg border py-3 px-2 transition-colors ${
                  primary
                    ? 'border-primary/40 bg-primary/10 hover:bg-primary/15'
                    : 'border-border bg-card hover:bg-secondary'
                }`}
              >
                <Icon className={`h-5 w-5 ${primary ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-mono uppercase tracking-wide text-center leading-tight ${primary ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Objectives overview */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Active Objectives
            </p>
            <Link
              href="/objectives"
              className="text-xs text-primary flex items-center gap-0.5 hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {objectives.slice(0, 3).map((obj) => (
              <Link
                key={obj.id}
                href={`/objectives/${obj.id}`}
                className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {obj.title}
                    </span>
                    <RiskBadge status={obj.riskStatus} size="sm" />
                  </div>
                  <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        obj.riskStatus === 'on_track'
                          ? 'bg-status-on-track'
                          : obj.riskStatus === 'at_risk'
                            ? 'bg-status-at-risk'
                            : 'bg-status-critical'
                      }`}
                      style={{ width: `${obj.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {obj.progressPercent}% complete
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Today's tasks */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {"Today's Priority Tasks"}
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">
              {data.todayPriorityTasks.length} tasks
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card px-4">
            {data.todayPriorityTasks.length > 0 ? (
              data.todayPriorityTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))
            ) : (
              <div className="py-6 text-center">
                <TrendingUp className="h-6 w-6 text-status-on-track mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All tasks complete for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
