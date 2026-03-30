'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/src/components/app-shell'
import { ScreenHeader } from '@/src/components/screen-header'
import { CoachMessageCard } from '@/src/components/ui/coach-message-card'
import { objectivesService, recoveryService } from '@/src/services/api'
import type { Objective, RecoveryPlan } from '@/src/types'

export default function RecoveryPage() {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null)
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const response = await objectivesService.list()
      const risky = response.data.filter((objective) => objective.riskStatus !== 'on_track')
      setObjectives(risky)
      setSelectedObjectiveId(risky[0]?.id ?? null)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    async function loadPlan() {
      if (!selectedObjectiveId) {
        setRecoveryPlan(null)
        return
      }
      const plan = await recoveryService.getPlan(selectedObjectiveId)
      setRecoveryPlan(plan)
    }
    loadPlan()
  }, [selectedObjectiveId])

  const selectedObjective = objectives.find((objective) => objective.id === selectedObjectiveId) ?? null

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Recovery Plans" subtitle="Live recovery guidance from the backend" />

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Objectives Needing Attention</h3>
            {loading ? (
              <div className="h-24 animate-pulse rounded-lg bg-secondary" />
            ) : objectives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No objective currently needs a recovery plan.</p>
            ) : (
              <div className="space-y-2">
                {objectives.map((objective) => (
                  <button
                    key={objective.id}
                    onClick={() => setSelectedObjectiveId(objective.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      objective.id === selectedObjectiveId
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-secondary'
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{objective.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{objective.riskStatus.replace('_', ' ')}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {!selectedObjective || !recoveryPlan ? (
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Select an objective to inspect its recovery plan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-2xl font-bold text-foreground">{selectedObjective.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedObjective.description}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Progress</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{selectedObjective.progressPercent}%</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Deadline</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{selectedObjective.endDate}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Feasibility</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{selectedObjective.feasibilityScore}%</p>
                    </div>
                  </div>
                </div>

                <CoachMessageCard message={selectedObjective.coachMessage || recoveryPlan.explanation} />

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Top Priorities</h3>
                  <ul className="space-y-2">
                    {recoveryPlan.todayPriorities.length === 0 ? (
                      <li className="text-sm text-muted-foreground">No priorities generated yet.</li>
                    ) : (
                      recoveryPlan.todayPriorities.map((priority) => (
                        <li key={priority} className="text-sm text-foreground">{priority}</li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Rescheduled Work</h3>
                  <ul className="space-y-2">
                    {recoveryPlan.newTaskAllocation.length === 0 ? (
                      <li className="text-sm text-muted-foreground">No task moves available.</li>
                    ) : (
                      recoveryPlan.newTaskAllocation.map((item) => (
                        <li key={item} className="text-sm text-foreground">{item}</li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/objectives/${selectedObjective.id}`}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    View Objective
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
