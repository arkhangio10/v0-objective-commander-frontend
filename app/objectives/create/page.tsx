'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '@/src/components/screen-header'
import { objectivesService } from '@/src/services/api'
import type { ObjectiveCategory } from '@/src/types'
import { Loader2, Info } from 'lucide-react'
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
      })
      router.push(`/objectives/${obj.id}`)
    } catch {
      setError('Failed to create objective. Try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
  const labelClass =
    'text-[10px] font-mono uppercase tracking-widest text-muted-foreground'
  const fieldClass = 'flex flex-col gap-1.5'

  return (
    <div className="min-h-screen bg-background pb-8">
      <ScreenHeader title="New Objective" backHref="/objectives" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pt-5">
        {/* Title */}
        <div className={fieldClass}>
          <label htmlFor="title" className={labelClass}>
            Title <span className="text-status-critical">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={update('title')}
            placeholder="e.g. Launch SaaS MVP"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div className={fieldClass}>
          <label htmlFor="desc" className={labelClass}>Description</label>
          <textarea
            id="desc"
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="What is this objective about?"
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        {/* Category */}
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

        {/* Dates */}
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

        {/* Deadline notice */}
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/8 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            The end date is fixed. If you fall behind, the schedule adapts — not the deadline.
          </p>
        </div>

        {/* Target outcome */}
        <div className={fieldClass}>
          <label htmlFor="target" className={labelClass}>
            Target Outcome <span className="text-status-critical">*</span>
          </label>
          <input
            id="target"
            type="text"
            value={form.targetOutcome}
            onChange={update('targetOutcome')}
            placeholder="e.g. 10 paying customers live"
            className={inputClass}
          />
        </div>

        {/* Effort & Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div className={fieldClass}>
            <label htmlFor="effort" className={labelClass}>Estimated Hours</label>
            <input
              id="effort"
              type="number"
              min="0"
              value={form.estimatedEffort}
              onChange={update('estimatedEffort')}
              placeholder="e.g. 200"
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
              placeholder="e.g. 2000"
              className={inputClass}
            />
          </div>
        </div>

        {/* Checkpoint hours */}
        <div className={fieldClass}>
          <label className={labelClass}>
            Checkpoint Hours <span className="text-status-critical">*</span>
          </label>
          <p className="text-xs text-muted-foreground -mt-0.5">
            Analysis runs automatically at selected hours
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
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

        {/* Email reminders */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Email Reminders</p>
            <p className="text-xs text-muted-foreground">Receive checkpoint summaries by email</p>
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
          <p className="text-xs text-status-critical bg-status-critical/10 border border-status-critical/30 rounded px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating Objective...' : 'Create Objective'}
        </button>
      </form>
    </div>
  )
}
