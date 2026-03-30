'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '@/src/components/screen-header'
import { objectivesService } from '@/src/services/api'
import type { FixedCommitment, ObjectiveCategory } from '@/src/types'
import { Loader2, Info, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories: { value: ObjectiveCategory; label: string }[] = [
  { value: 'health', label: 'Health' },
  { value: 'career', label: 'Career' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Other' },
]

const CHECKPOINT_HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22]
const FIELD_LIMITS = {
  title: 200,
  description: 2000,
  targetOutcome: 1000,
  currentBaseline: 2500,
  strategyNotes: 2500,
  prePlan: 4000,
  reminderStrategy: 1000,
  commitmentLabel: 120,
  commitmentSchedule: 200,
  commitmentDateRange: 120,
  commitmentNotes: 250,
} as const

const EMPTY_COMMITMENT: FixedCommitment = {
  label: '',
  schedule: '',
  dateRange: '',
  notes: '',
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function CreateObjectivePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as ObjectiveCategory | '',
    startDate: '',
    endDate: '',
    targetOutcome: '',
    estimatedEffort: '',
    budgetLimit: '',
    checkpointHours: [10, 14, 18, 22] as number[],
    emailReminders: true,
    currentBaseline: '',
    strategyNotes: '',
    prePlan: '',
    constraintsText: '',
    dailyNonNegotiablesText: '',
    executionPreferencesText: '',
    reminderStrategy: '',
    fixedCommitments: [{ ...EMPTY_COMMITMENT }] as FixedCommitment[],
  })

  function update<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
    }
  }

  function toggleCheckpoint(hour: number) {
    setForm((f) => ({
      ...f,
      checkpointHours: f.checkpointHours.includes(hour)
        ? f.checkpointHours.filter((h) => h !== hour)
        : [...f.checkpointHours, hour].sort((a, b) => a - b),
    }))
  }

  function updateCommitment(index: number, key: keyof FixedCommitment, value: string) {
    setForm((f) => ({
      ...f,
      fixedCommitments: f.fixedCommitments.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }))
  }

  function addCommitment() {
    setForm((f) => ({
      ...f,
      fixedCommitments: [...f.fixedCommitments, { ...EMPTY_COMMITMENT }],
    }))
  }

  function removeCommitment(index: number) {
    setForm((f) => ({
      ...f,
      fixedCommitments:
        f.fixedCommitments.length === 1
          ? [{ ...EMPTY_COMMITMENT }]
          : f.fixedCommitments.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.category || !form.startDate || !form.endDate || !form.targetOutcome) {
      setError('Please fill in all required fields.')
      return
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after start date.')
      return
    }
    if (form.checkpointHours.length === 0) {
      setError('Select at least one checkpoint hour.')
      return
    }

    const textChecks: Array<[string, string, number]> = [
      ['Title', form.title, FIELD_LIMITS.title],
      ['Objective summary', form.description, FIELD_LIMITS.description],
      ['Target outcome', form.targetOutcome, FIELD_LIMITS.targetOutcome],
      ['Current baseline', form.currentBaseline, FIELD_LIMITS.currentBaseline],
      ['Strategy notes', form.strategyNotes, FIELD_LIMITS.strategyNotes],
      ['Pre-plan / existing plan', form.prePlan, FIELD_LIMITS.prePlan],
      ['Reminder strategy', form.reminderStrategy, FIELD_LIMITS.reminderStrategy],
    ]

    for (const [label, value, limit] of textChecks) {
      if (value.length > limit) {
        setError(`${label} is too long. Maximum ${limit} characters.`)
        return
      }
    }

    for (const commitment of form.fixedCommitments) {
      if (commitment.label.length > FIELD_LIMITS.commitmentLabel) {
        setError(`Commitment name is too long. Maximum ${FIELD_LIMITS.commitmentLabel} characters.`)
        return
      }
      if (commitment.schedule.length > FIELD_LIMITS.commitmentSchedule) {
        setError(`Commitment schedule is too long. Maximum ${FIELD_LIMITS.commitmentSchedule} characters.`)
        return
      }
      if ((commitment.dateRange || '').length > FIELD_LIMITS.commitmentDateRange) {
        setError(`Commitment date range is too long. Maximum ${FIELD_LIMITS.commitmentDateRange} characters.`)
        return
      }
      if ((commitment.notes || '').length > FIELD_LIMITS.commitmentNotes) {
        setError(`Commitment notes are too long. Maximum ${FIELD_LIMITS.commitmentNotes} characters.`)
        return
      }
    }

    setLoading(true)
    try {
      const obj = await objectivesService.create({
        title: form.title,
        description: form.description,
        category: form.category as ObjectiveCategory,
        startDate: form.startDate,
        endDate: form.endDate,
        targetOutcome: form.targetOutcome,
        estimatedEffort: Number(form.estimatedEffort) || 0,
        budgetLimit: Number(form.budgetLimit) || 0,
        checkpointHours: form.checkpointHours,
        emailReminders: form.emailReminders,
        currentBaseline: form.currentBaseline,
        strategyNotes: form.strategyNotes,
        prePlan: form.prePlan,
        constraints: splitLines(form.constraintsText),
        fixedCommitments: form.fixedCommitments
          .map((item) => ({
            label: item.label.trim(),
            schedule: item.schedule.trim(),
            dateRange: item.dateRange?.trim() || undefined,
            notes: item.notes?.trim() || undefined,
          }))
          .filter((item) => item.label && item.schedule),
        dailyNonNegotiables: splitLines(form.dailyNonNegotiablesText),
        executionPreferences: splitLines(form.executionPreferencesText),
        reminderStrategy: form.reminderStrategy,
      })
      router.push(`/objectives/${obj.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create objective. Try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
  const labelClass = 'text-[10px] font-mono uppercase tracking-widest text-muted-foreground'
  const fieldClass = 'flex flex-col gap-1.5'

  return (
    <div className="min-h-screen bg-background pb-8">
      <ScreenHeader title="New Objective" backHref="/objectives" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pt-5">
        <div className={fieldClass}>
          <label htmlFor="title" className={labelClass}>
            Title <span className="text-status-critical">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={update('title')}
            placeholder="e.g. Reach IELTS 6.5 by May 23"
            maxLength={FIELD_LIMITS.title}
            className={inputClass}
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="desc" className={labelClass}>Objective Summary</label>
          <textarea
            id="desc"
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="What is this objective about, and what should the system optimize for?"
            maxLength={FIELD_LIMITS.description}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="baseline" className={labelClass}>Current Baseline</label>
          <textarea
            id="baseline"
            rows={4}
            value={form.currentBaseline}
            onChange={update('currentBaseline')}
            placeholder="Current level, recent results, weakest areas, diagnostic notes, or any starting context."
            maxLength={FIELD_LIMITS.currentBaseline}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="strategy" className={labelClass}>Strategy Notes</label>
          <textarea
            id="strategy"
            rows={3}
            value={form.strategyNotes}
            onChange={update('strategyNotes')}
            placeholder="Tell the AI what matters most: prioritize writing first, protect sleep, keep weekends lighter, etc."
            maxLength={FIELD_LIMITS.strategyNotes}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="prePlan" className={labelClass}>Pre-Plan / Existing Plan</label>
          <textarea
            id="prePlan"
            rows={7}
            value={form.prePlan}
            onChange={update('prePlan')}
            placeholder="Paste the plan you already have. The AI will review it, improve it, and turn it into daily execution tasks."
            maxLength={FIELD_LIMITS.prePlan}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>
            Category <span className="text-status-critical">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: value }))}
                className={cn(
                  'rounded px-3 py-1.5 text-xs font-mono border transition-colors',
                  form.category === value
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'bg-secondary text-muted-foreground border-border hover:bg-muted',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={fieldClass}>
            <label htmlFor="startDate" className={labelClass}>
              Start Date <span className="text-status-critical">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={update('startDate')}
              className={inputClass}
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="endDate" className={labelClass}>
              End Date <span className="text-status-critical">*</span>
            </label>
            <input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={update('endDate')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/8 px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            The deadline stays fixed. The plan, daily task mix, and reminders should adapt around your real life.
          </p>
        </div>

        <div className={fieldClass}>
          <label htmlFor="target" className={labelClass}>
            Target Outcome <span className="text-status-critical">*</span>
          </label>
          <input
            id="target"
            type="text"
            value={form.targetOutcome}
            onChange={update('targetOutcome')}
            placeholder="e.g. Achieve IELTS overall 6.5 with Writing at 6.0 or above"
            maxLength={FIELD_LIMITS.targetOutcome}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={fieldClass}>
            <label htmlFor="effort" className={labelClass}>Estimated Hours</label>
            <input
              id="effort"
              type="number"
              min="0"
              value={form.estimatedEffort}
              onChange={update('estimatedEffort')}
              placeholder="e.g. 65"
              className={inputClass}
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="budget" className={labelClass}>Budget ($)</label>
            <input
              id="budget"
              type="number"
              min="0"
              value={form.budgetLimit}
              onChange={update('budgetLimit')}
              placeholder="e.g. 50"
              className={inputClass}
            />
          </div>
        </div>

        <div className={fieldClass}>
          <label htmlFor="constraints" className={labelClass}>Constraints</label>
          <textarea
            id="constraints"
            rows={4}
            value={form.constraintsText}
            onChange={update('constraintsText')}
            placeholder={'One rule per line.\nWork 8:00 AM to 6:00 PM\nClass Apr 30 to May 16 from 9:00 PM to 11:00 PM\nGym 6 days per week'}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className={fieldClass}>
          <div className="flex items-center justify-between">
            <label className={labelClass}>Fixed Commitments</label>
            <button
              type="button"
              onClick={addCommitment}
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-mono text-muted-foreground hover:bg-muted"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {form.fixedCommitments.map((commitment, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={commitment.label}
                    onChange={(e) => updateCommitment(index, 'label', e.target.value)}
                    placeholder="Commitment name"
                    maxLength={FIELD_LIMITS.commitmentLabel}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={commitment.schedule}
                    onChange={(e) => updateCommitment(index, 'schedule', e.target.value)}
                    placeholder="Schedule, e.g. Mon-Fri 8:00 AM-6:00 PM"
                    maxLength={FIELD_LIMITS.commitmentSchedule}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={commitment.dateRange || ''}
                    onChange={(e) => updateCommitment(index, 'dateRange', e.target.value)}
                    placeholder="Date range, optional"
                    maxLength={FIELD_LIMITS.commitmentDateRange}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commitment.notes || ''}
                      onChange={(e) => updateCommitment(index, 'notes', e.target.value)}
                      placeholder="Notes, optional"
                      maxLength={FIELD_LIMITS.commitmentNotes}
                      className={cn(inputClass, 'flex-1')}
                    />
                    <button
                      type="button"
                      onClick={() => removeCommitment(index)}
                      className="rounded-lg border border-border px-3 text-muted-foreground hover:bg-muted"
                      aria-label="Remove commitment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={fieldClass}>
          <label htmlFor="nonNegotiables" className={labelClass}>Daily Non-Negotiables</label>
          <textarea
            id="nonNegotiables"
            rows={4}
            value={form.dailyNonNegotiablesText}
            onChange={update('dailyNonNegotiablesText')}
            placeholder={'One per line.\nWrite every day\nRead 30 minutes daily'}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="preferences" className={labelClass}>Execution Preferences</label>
          <textarea
            id="preferences"
            rows={4}
            value={form.executionPreferencesText}
            onChange={update('executionPreferencesText')}
            placeholder={'One preference per line.\nAlternate speaking and listening every day\nKeep class nights lighter'}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>
            Checkpoint Hours <span className="text-status-critical">*</span>
          </label>
          <p className="text-xs text-muted-foreground -mt-0.5">
            These are the times when the system checks progress, replans, and sends reminders.
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {CHECKPOINT_HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => toggleCheckpoint(h)}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-mono border transition-colors',
                  form.checkpointHours.includes(h)
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'bg-secondary text-muted-foreground border-border hover:bg-muted',
                )}
              >
                {h}:00
              </button>
            ))}
          </div>
        </div>

        <div className={fieldClass}>
          <label htmlFor="reminders" className={labelClass}>Reminder Strategy</label>
          <textarea
            id="reminders"
            rows={3}
            value={form.reminderStrategy}
            onChange={update('reminderStrategy')}
            placeholder="Tell the system when reminders should be sent and when they should be avoided."
            maxLength={FIELD_LIMITS.reminderStrategy}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Email Reminders</p>
            <p className="text-xs text-muted-foreground">Receive checkpoint summaries and execution nudges by email</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, emailReminders: !f.emailReminders }))}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              form.emailReminders ? 'bg-primary' : 'bg-secondary',
            )}
            role="switch"
            aria-checked={form.emailReminders}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                form.emailReminders ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </div>

        {error && (
          <p className="rounded border border-status-critical/30 bg-status-critical/10 px-3 py-2 text-xs text-status-critical">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating Objective...' : 'Create Objective'}
        </button>
      </form>
    </div>
  )
}
