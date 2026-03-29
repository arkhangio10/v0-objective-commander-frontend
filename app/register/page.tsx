'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Crosshair, Loader2 } from 'lucide-react'
import { authService } from '@/src/services/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await authService.register(form.email, form.password, form.name)
      router.push('/dashboard')
    } catch {
      setError('Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
          <Crosshair className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold font-mono uppercase tracking-widest text-foreground">
            Objective Commander
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Your execution system starts here</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Create account</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set up your mission control
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { id: 'name', label: 'Full Name', type: 'text', autoComplete: 'name', value: form.name, onChange: update('name'), placeholder: 'Alex Morgan' },
              { id: 'email', label: 'Email', type: 'email', autoComplete: 'email', value: form.email, onChange: update('email'), placeholder: 'you@example.com' },
            ].map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label htmlFor={field.id} className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  className="rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
            ))}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-lg border border-input bg-secondary px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Confirm Password
              </label>
              <input
                id="confirm"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="Repeat password"
                className="rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-status-critical bg-status-critical/10 border border-status-critical/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
