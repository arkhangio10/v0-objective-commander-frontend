'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/src/components/app-shell'
import { ScreenHeader } from '@/src/components/screen-header'
import { StatCard } from '@/src/components/ui/stat-card'
import { ExpenseRow } from '@/src/components/ui/expense-row'
import { EmptyState } from '@/src/components/ui/empty-state'
import { expensesService, objectivesService } from '@/src/services/api'
import type { Expense, Objective, ExpenseCategory } from '@/src/types'
import { DollarSign, Plus, X, Loader2 } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

const EXPENSE_COLORS = [
  'oklch(0.72 0.19 70)',   // food — amber
  'oklch(0.70 0.15 200)',  // transport — sky
  'oklch(0.62 0.22 250)',  // tools — blue
  'oklch(0.65 0.18 300)',  // subscriptions — violet
  'oklch(0.72 0.18 85)',   // study — yellow
  'oklch(0.60 0.18 145)',  // health — green
  'oklch(0.55 0.01 240)',  // misc — gray
]

const EXPENSE_CATS: ExpenseCategory[] = [
  'food', 'transport', 'tools', 'subscriptions', 'study', 'health', 'misc',
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    objectiveId: '',
    amount: '',
    category: 'misc' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    note: '',
  })

  useEffect(() => {
    async function load() {
      const [exps, objs] = await Promise.all([
        expensesService.listAll(),
        objectivesService.list(),
      ])
      setExpenses(exps)
      setObjectives(objs.data)
      setLoading(false)
    }
    load()
  }, [])

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const totalBudget = objectives.reduce((s, o) => s + o.budgetLimit, 0)
  const remaining = totalBudget - totalSpent

  // Category breakdown
  const catBreakdown = EXPENSE_CATS.map((cat) => ({
    name: cat,
    value: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.value > 0)

  // This week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = expenses
    .filter((e) => new Date(e.date) >= weekAgo)
    .reduce((s, e) => s + e.amount, 0)

  async function handleAddExpense(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.objectiveId || !form.amount) return
    setSubmitting(true)
    const newExp = await expensesService.create({
      objectiveId: form.objectiveId,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note,
    })
    setExpenses((prev) => [newExp, ...prev])
    setForm({ objectiveId: '', amount: '', category: 'misc', date: new Date().toISOString().split('T')[0], note: '' })
    setShowForm(false)
    setSubmitting(false)
  }

  const inputClass =
    'w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'text-[10px] font-mono uppercase tracking-widest text-muted-foreground'

  return (
    <AppShell>
      <ScreenHeader
        title="Expenses"
        subtitle="All objectives"
        right={
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="Log expense"
          >
            <Plus className="h-4 w-4 text-primary" />
          </button>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Total Spent" value={`$${totalSpent.toLocaleString()}`} icon={DollarSign} accent />
          <StatCard label="This Week" value={`$${thisWeek.toLocaleString()}`} sub="last 7 days" />
          <StatCard
            label="Budget"
            value={`$${totalBudget.toLocaleString()}`}
            sub="all objectives"
          />
          <StatCard
            label="Remaining"
            value={`$${remaining.toLocaleString()}`}
            sub={remaining >= 0 ? 'available' : 'over budget'}
          />
        </div>

        {/* Category breakdown chart */}
        {catBreakdown.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              By Category
            </p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={catBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {catBreakdown.map((_, i) => (
                      <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.14 0.008 240)',
                      border: '1px solid oklch(0.22 0.010 240)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(v: number) => [`$${v}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1">
                {catBreakdown.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">{cat.name}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground">
                      ${cat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expense list */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            All Expenses
          </p>
          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-secondary/60 animate-pulse" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No expenses logged"
              description="Track your spending per objective."
              action={
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Log Expense
                </button>
              }
            />
          ) : (
            <div className="rounded-lg border border-border bg-card px-4">
              {expenses.map((exp) => <ExpenseRow key={exp.id} expense={exp} />)}
            </div>
          )}
        </div>
      </div>

      {/* Add expense modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-background/80 backdrop-blur">
          <div className="w-full max-w-md mx-auto rounded-t-2xl border-t border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Log Expense</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Objective *</label>
                <select
                  value={form.objectiveId}
                  onChange={(e) => setForm((f) => ({ ...f, objectiveId: e.target.value }))}
                  className={inputClass}
                  required
                >
                  <option value="">Select objective...</option>
                  {objectives.map((o) => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {EXPENSE_CATS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className={cn(
                        'rounded px-2.5 py-1 text-xs font-mono border transition-colors capitalize',
                        form.category === cat
                          ? 'bg-primary/20 text-primary border-primary/40'
                          : 'bg-secondary text-muted-foreground border-border',
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Note</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. AWS hosting invoice"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Saving...' : 'Log Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
