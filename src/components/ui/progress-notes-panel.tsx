'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Calendar, CheckCircle, Loader2, MessageSquare, Save, TrendingUp } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { objectivesService } from '@/src/services/api'
import type { ProgressNote } from '@/src/types'

interface ProgressNotesPanelProps {
  objectiveId: string
  targetOutcome: string
  onSaved?: () => Promise<void> | void
}

interface ProgressNoteFormState {
  noteDate: string
  note: string
  metricLabel: string
  metricValue: string
  marksObjectiveComplete: boolean
}

function getTodayInputValue() {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

function createInitialFormState(): ProgressNoteFormState {
  return {
    noteDate: getTodayInputValue(),
    note: '',
    metricLabel: '',
    metricValue: '',
    marksObjectiveComplete: false,
  }
}

function sortProgressNotes(notes: ProgressNote[]) {
  return [...notes].sort((left, right) => {
    const leftTime = new Date(`${left.noteDate}T00:00:00`).getTime()
    const rightTime = new Date(`${right.noteDate}T00:00:00`).getTime()
    if (leftTime !== rightTime) {
      return rightTime - leftTime
    }
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
}

function formatNoteDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMetricValue(value?: number) {
  if (value === undefined) return ''
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, '')
}

export function ProgressNotesPanel({
  objectiveId,
  targetOutcome,
  onSaved,
}: ProgressNotesPanelProps) {
  const [notes, setNotes] = useState<ProgressNote[]>([])
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [form, setForm] = useState<ProgressNoteFormState>(createInitialFormState)

  useEffect(() => {
    let cancelled = false

    async function loadNotes() {
      setLoadingNotes(true)
      setLoadError('')
      try {
        const items = await objectivesService.listProgressNotes(objectiveId)
        if (!cancelled) {
          setNotes(sortProgressNotes(items))
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load progress notes right now.')
        }
      } finally {
        if (!cancelled) {
          setLoadingNotes(false)
        }
      }
    }

    void loadNotes()

    return () => {
      cancelled = true
    }
  }, [objectiveId])

  function updateForm<K extends keyof ProgressNoteFormState>(key: K, value: ProgressNoteFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (submitError) setSubmitError('')
    if (submitSuccess) setSubmitSuccess('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedNote = form.note.trim()
    const trimmedMetricLabel = form.metricLabel.trim()
    const rawMetricValue = form.metricValue.trim()

    if (!trimmedNote && rawMetricValue === '') {
      setSubmitError('Add a note or a metric value before saving.')
      return
    }

    const parsedMetricValue = rawMetricValue === '' ? undefined : Number(rawMetricValue)
    if (rawMetricValue !== '' && Number.isNaN(parsedMetricValue)) {
      setSubmitError('Metric value must be a valid number.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const created = await objectivesService.createProgressNote(objectiveId, {
        note: trimmedNote,
        noteDate: form.noteDate,
        ...(trimmedMetricLabel ? { metricLabel: trimmedMetricLabel } : {}),
        ...(parsedMetricValue !== undefined ? { metricValue: parsedMetricValue } : {}),
        marksObjectiveComplete: form.marksObjectiveComplete,
      })

      setNotes((current) => sortProgressNotes([created, ...current]))
      setForm(createInitialFormState())

      try {
        await onSaved?.()
        setSubmitSuccess('Progress note saved and objective analysis refreshed.')
      } catch {
        setSubmitError('Progress note saved, but the refreshed analysis did not load yet.')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to save progress note right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const labelClass = 'text-[10px] font-mono uppercase tracking-widest text-muted-foreground'
  const helperCopy = targetOutcome
    ? `Use dated evidence that proves movement toward "${targetOutcome}".`
    : 'Use dated evidence that proves movement toward this objective.'

  return (
    <div className="rounded-lg border border-primary/20 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded border border-primary/35 bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-primary/80">
              Progress Notes
            </p>
            <p className="mt-1 text-sm text-foreground">
              Save a dated score, checkpoint, blocker, or win so the AI can reason with real evidence instead of task completion alone.
            </p>
          </div>
        </div>
        <div className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-primary">
          {notes.length} saved
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{helperCopy}</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Note Date</label>
            <Input
              type="date"
              value={form.noteDate}
              onChange={(event) => updateForm('noteDate', event.target.value)}
              className="bg-secondary/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Metric Value</label>
            <Input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={form.metricValue}
              onChange={(event) => updateForm('metricValue', event.target.value)}
              placeholder="6.5"
              className="bg-secondary/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Metric Label</label>
          <Input
            type="text"
            value={form.metricLabel}
            onChange={(event) => updateForm('metricLabel', event.target.value)}
            placeholder="IELTS overall band"
            className="bg-secondary/40"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>What Happened</label>
          <Textarea
            value={form.note}
            onChange={(event) => updateForm('note', event.target.value)}
            placeholder="Mock test completed: Listening 6.0, Reading 6.5, Writing 5.5. Biggest weakness was timing in Task 2."
            className="min-h-28 bg-secondary/40"
          />
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-3">
          <Checkbox
            checked={form.marksObjectiveComplete}
            onCheckedChange={(checked) => updateForm('marksObjectiveComplete', checked === true)}
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">
              This note confirms the objective is achieved
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Use this only when you have clear evidence that the target outcome has been reached.
            </span>
          </span>
        </label>

        {(submitError || submitSuccess) && (
          <div
            className={cn(
              'rounded-lg border px-3 py-2 text-xs',
              submitError
                ? 'border-status-critical/30 bg-status-critical/10 text-status-critical'
                : 'border-status-on-track/30 bg-status-on-track/10 text-status-on-track',
            )}
          >
            {submitError || submitSuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-mono uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Saving Note...' : 'Save Progress Note'}
        </button>
      </form>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Recent Evidence
          </p>
        </div>

        {loadingNotes ? (
          <div className="mt-3 space-y-2">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-lg border border-border bg-secondary/30" />
            ))}
          </div>
        ) : loadError ? (
          <div className="mt-3 rounded-lg border border-status-critical/25 bg-status-critical/10 px-3 py-2 text-xs text-status-critical">
            {loadError}
          </div>
        ) : notes.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-border px-4 py-5 text-center">
            <p className="text-sm text-foreground">No progress notes yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start with a score, a dated update, or a blocker the coach should factor into the plan.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatNoteDate(note.noteDate)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {note.metricValue !== undefined && (
                      <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-primary">
                        {(note.metricLabel || 'Metric').trim()}: {formatMetricValue(note.metricValue)}
                      </span>
                    )}
                    {note.marksObjectiveComplete && (
                      <span className="inline-flex items-center gap-1 rounded border border-status-on-track/30 bg-status-on-track/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-status-on-track">
                        <CheckCircle className="h-3 w-3" />
                        Goal Reached
                      </span>
                    )}
                  </div>
                </div>

                {note.note ? (
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{note.note}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Metric-only update recorded for this date.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
