'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/src/components/app-shell'
import { ScreenHeader } from '@/src/components/screen-header'
import { integrationsService, settingsService } from '@/src/services/api'
import type { IntegrationsStatus, UserSettings } from '@/src/types'

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-12 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-secondary'}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-foreground transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [integrations, setIntegrations] = useState<IntegrationsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [settingsData, integrationData] = await Promise.all([
        settingsService.get(),
        integrationsService.getStatus(),
      ])
      setSettings(settingsData)
      setIntegrations(integrationData)
      setLoading(false)
    }

    load()
  }, [])

  async function updateSettings(next: Partial<UserSettings>) {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await settingsService.update({ ...settings, ...next })
      setSettings(updated)
    } finally {
      setSaving(false)
    }
  }

  async function connectGoogleTasks() {
    const { authorizationUrl } = await integrationsService.connectGoogleTasks()
    window.location.href = authorizationUrl
  }

  async function disconnectGoogleTasks() {
    await integrationsService.disconnectGoogleTasks()
    const refreshed = await integrationsService.getStatus()
    setIntegrations(refreshed)
    if (settings) {
      setSettings({ ...settings, googleTasksConnected: false })
    }
  }

  if (loading || !settings || !integrations) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background p-4">
          <div className="h-24 animate-pulse rounded-lg bg-secondary" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Settings" subtitle="Account, notifications, and integrations" />

        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-1 text-lg font-semibold text-foreground">Profile</h3>
            <p className="mb-6 text-sm text-muted-foreground">Current session details from the backend.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-mono uppercase tracking-widest text-muted-foreground">Email</label>
                <input value={settings.emailAddress} disabled className="w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-mono uppercase tracking-widest text-muted-foreground">Display Name</label>
                <input value={settings.displayName || 'Objective Commander User'} disabled className="w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-1 text-lg font-semibold text-foreground">Execution Settings</h3>
            <p className="mb-6 text-sm text-muted-foreground">These values are saved to your backend profile.</p>
            <div className="mb-5">
              <label className="mb-1 block text-xs font-mono uppercase tracking-widest text-muted-foreground">Timezone</label>
              <input
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground"
              />
            </div>
            <div className="space-y-4">
              <SettingToggle
                label="Email reminders"
                description="Use the backend notification pipeline for checkpoint emails."
                enabled={settings.emailNotificationsEnabled}
                onChange={(value) => updateSettings({ emailNotificationsEnabled: value })}
              />
            </div>
            <div className="mt-6">
              <button
                onClick={() => updateSettings({ timezone: settings.timezone })}
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-1 text-lg font-semibold text-foreground">Integrations</h3>
            <p className="mb-6 text-sm text-muted-foreground">Live backend integration status.</p>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Google Tasks</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {integrations.googleTasksConnected
                      ? 'Connected and ready for task sync.'
                      : 'Not connected yet.'}
                  </p>
                  {integrations.lastSyncTime && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Last sync: {new Date(integrations.lastSyncTime).toLocaleString()}
                    </p>
                  )}
                </div>
                {integrations.googleTasksConnected ? (
                  <button
                    onClick={disconnectGoogleTasks}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={connectGoogleTasks}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {integrations.emailNotificationsEnabled
                      ? 'SMTP is configured on the backend.'
                      : 'SMTP is not configured.'}
                  </p>
                </div>
                <span className="rounded border border-border px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                  {integrations.emailNotificationsEnabled ? 'Ready' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
