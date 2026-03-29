'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, AlertCircle, Target, TrendingDown, Clock } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ScreenHeader } from '@/components/screen-header'
import { CoachMessageCard } from '@/components/ui/coach-message-card'
import { api } from '@/services/api'

export default function RecoveryPage() {
  const [objectives] = useState(api.getObjectives())
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(
    objectives.find(o => o.status === 'at-risk' || o.status === 'critical')?.id || null
  )

  const selectedObjective = selectedObjectiveId
    ? objectives.find(o => o.id === selectedObjectiveId)
    : null

  const atRiskObjectives = objectives.filter(
    o => o.status === 'at-risk' || o.status === 'critical'
  )

  const getRecoveryActions = (objective: typeof objectives[0]) => {
    const actions = []

    if (objective.status === 'critical') {
      actions.push({
        type: 'immediate' as const,
        title: 'Critical Recovery Needed',
        description: 'This objective requires immediate attention and action.',
        actions: [
          'Schedule focused work session within 24 hours',
          'Review and realign milestones',
          'Consider delegating non-critical tasks',
          'Identify and remove blockers',
        ],
      })
    }

    if (objective.status === 'at-risk') {
      actions.push({
        type: 'preventative' as const,
        title: 'Preventative Action',
        description: 'Take action now to avoid critical status.',
        actions: [
          'Increase weekly time allocation',
          'Add accountability checkpoints',
          'Break down next milestone into smaller tasks',
          'Communicate status to stakeholders',
        ],
      })
    }

    actions.push({
      type: 'strategic' as const,
      title: 'Strategic Review',
      description: 'Assess if this objective aligns with current priorities.',
      actions: [
        'Evaluate objective relevance',
        'Consider timeline adjustments',
        'Identify resource constraints',
        'Plan contingencies',
      ],
    })

    return actions
  }

  return (
    <AppShell currentScreen="recovery">
      <div className="min-h-screen bg-background">
        <ScreenHeader
          title="Recovery Plans"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Recovery Plans' },
          ]}
          description="Get back on track with targeted recovery actions"
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {atRiskObjectives.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary mb-4">
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                All Clear
              </h3>
              <p className="text-muted-foreground">
                No objectives need recovery plans. Keep up the momentum!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Objectives List */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">
                    At-Risk Objectives
                  </h3>
                  <div className="space-y-2">
                    {atRiskObjectives.map(obj => (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObjectiveId(obj.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedObjectiveId === obj.id
                            ? 'bg-primary/10 border-primary'
                            : 'border-border hover:bg-secondary'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              obj.status === 'critical'
                                ? 'text-red-500'
                                : 'text-amber-500'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {obj.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {obj.status === 'critical'
                                ? 'Critical'
                                : 'At Risk'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recovery Plan */}
              {selectedObjective && (
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {selectedObjective.name}
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {selectedObjective.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Current Progress
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${selectedObjective.progress}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {selectedObjective.progress}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Target Due
                          </p>
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Clock className="w-4 h-4" />
                            {new Date(
                              selectedObjective.targetDate
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recovery Actions */}
                    {getRecoveryActions(selectedObjective).map(
                      (action, idx) => (
                        <div
                          key={idx}
                          className="bg-card rounded-lg border border-border p-6"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            {action.type === 'immediate' && (
                              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            {action.type === 'preventative' && (
                              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            )}
                            {action.type === 'strategic' && (
                              <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {action.description}
                              </p>
                            </div>
                          </div>

                          <ul className="space-y-2">
                            {action.actions.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-foreground"
                              >
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-border bg-secondary mt-0.5 cursor-pointer"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/objectives/${selectedObjective.id}`}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-center"
                      >
                        View Objective
                      </Link>
                      <button className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors">
                        Generate Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
