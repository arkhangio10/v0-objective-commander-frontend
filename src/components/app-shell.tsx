'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  DollarSign,
  BarChart2,
  Settings,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/objectives', label: 'Objectives', icon: Target },
  { href: '/expenses', label: 'Expenses', icon: DollarSign },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Main content area */}
      <main
        className={cn(
          'flex-1 pb-20 overflow-y-auto max-w-md mx-auto w-full',
          className,
        )}
      >
        {children}
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-md mx-auto flex items-center">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-mono tracking-wide uppercase">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
