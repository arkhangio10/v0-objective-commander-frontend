'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/src/components/app-shell'
import { ScreenHeader } from '@/src/components/screen-header'
import { ObjectiveCard } from '@/src/components/ui/objective-card'
import { EmptyState } from '@/src/components/ui/empty-state'
import { ObjectiveCardSkeleton } from '@/src/components/ui/loading-skeleton'
import { objectivesService } from '@/src/services/api'
import type { Objective, RiskStatus, ObjectiveCategory } from '@/src/types'
import { Search, SlidersHorizontal, Plus, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortKey = 'deadline' | 'progress' | 'risk'

const riskOrder: Record<RiskStatus, number> = { critical: 0, at_risk: 1, on_track: 2 }

const categories: ObjectiveCategory[] = [
  'health', 'career', 'finance', 'education', 'personal', 'business', 'fitness', 'other',
]

export default function ObjectivesPage() {
  const router = useRouter()
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<RiskStatus | 'all'>('all')
  const [catFilter, setCatFilter] = useState<ObjectiveCategory | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('risk')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    objectivesService.list().then((res) => {
      setObjectives(res.data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return objectives
      .filter((o) => {
        const matchSearch =
          !search || o.title.toLowerCase().includes(search.toLowerCase())
        const matchRisk = riskFilter === 'all' || o.riskStatus === riskFilter
        const matchCat = catFilter === 'all' || o.category === catFilter
        return matchSearch && matchRisk && matchCat
      })
      .sort((a, b) => {
        if (sort === 'deadline')
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        if (sort === 'progress') return b.progressPercent - a.progressPercent
        if (sort === 'risk') return riskOrder[a.riskStatus] - riskOrder[b.riskStatus]
        return 0
      })
  }, [objectives, search, riskFilter, catFilter, sort])

  return (
    <AppShell>
      <ScreenHeader
        title="Objectives"
        subtitle={`${objectives.length} active`}
        right={
          <Link
            href="/objectives/create"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="Create objective"
          >
            <Plus className="h-4 w-4 text-primary" />
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search objectives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-secondary pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
              showFilters ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-4">
            {/* Risk filter */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Risk Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'on_track', 'at_risk', 'critical'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-mono uppercase tracking-wide border transition-colors',
                      riskFilter === r
                        ? r === 'on_track'
                          ? 'bg-status-on-track/20 text-status-on-track border-status-on-track/40'
                          : r === 'at_risk'
                            ? 'bg-status-at-risk/20 text-status-at-risk border-status-at-risk/40'
                            : r === 'critical'
                              ? 'bg-status-critical/20 text-status-critical border-status-critical/40'
                              : 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-secondary text-muted-foreground border-border hover:bg-muted',
                    )}
                  >
                    {r === 'all' ? 'All' : r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(['all', ...categories] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(c)}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-mono uppercase tracking-wide border transition-colors',
                      catFilter === c
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-secondary text-muted-foreground border-border hover:bg-muted',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Sort By
              </p>
              <div className="flex gap-1.5">
                {(['risk', 'deadline', 'progress'] as SortKey[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-mono uppercase tracking-wide border transition-colors',
                      sort === s
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-secondary text-muted-foreground border-border hover:bg-muted',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-muted-foreground font-mono">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => <ObjectiveCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No objectives found"
            description="Try adjusting your filters or create a new objective."
            action={
              <Link
                href="/objectives/create"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Objective
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((obj) => (
              <ObjectiveCard
                key={obj.id}
                objective={obj}
                onClick={() => router.push(`/objectives/${obj.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
