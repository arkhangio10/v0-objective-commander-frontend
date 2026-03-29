'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  right?: React.ReactNode
  className?: string
}

export function ScreenHeader({
  title,
  subtitle,
  backHref,
  right,
  className,
}: ScreenHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <h1 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </header>
  )
}
