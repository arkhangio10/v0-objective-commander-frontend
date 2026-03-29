'use client'

import { useState } from 'react'
import { Settings, Bell, Shield, Zap, LogOut, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ScreenHeader } from '@/components/screen-header'

interface SettingsSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      {children}
    </div>
  )
}

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
    <div className="flex items-start justify-between mb-4 pb-4 border-b border-border last:border-0 last:mb-0 last:pb-0">
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
          enabled ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-foreground rounded-full transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [riskAlerts, setRiskAlerts] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <AppShell currentScreen="settings">
      <div className="min-h-screen bg-background">
        <ScreenHeader
          title="Settings"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings' },
          ]}
          description="Manage your account, preferences, and integrations"
        />

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Notifications */}
            <SettingsSection
              title="Notifications"
              description="Control how and when you receive updates about your objectives"
            >
              <SettingToggle
                label="Push Notifications"
                description="Receive push notifications for objective updates and milestones"
                enabled={notifications}
                onChange={setNotifications}
              />
              <SettingToggle
                label="Email Digest"
                description="Weekly summary email of your progress and objectives"
                enabled={emailDigest}
                onChange={setEmailDigest}
              />
              <SettingToggle
                label="Risk Alerts"
                description="Immediate notification when an objective enters at-risk or critical status"
                enabled={riskAlerts}
                onChange={setRiskAlerts}
              />
            </SettingsSection>

            {/* Display Preferences */}
            <SettingsSection
              title="Display Preferences"
              description="Customize how the app looks and feels"
            >
              <SettingToggle
                label="Dark Mode"
                description="Use dark theme throughout the application"
                enabled={darkMode}
                onChange={setDarkMode}
              />
            </SettingsSection>

            {/* Security */}
            <SettingsSection
              title="Security"
              description="Protect your account with security settings"
            >
              <SettingToggle
                label="Two-Factor Authentication"
                description="Require a second verification method when signing in"
                enabled={twoFactor}
                onChange={setTwoFactor}
              />
              <button className="w-full mt-4 px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors">
                Change Password
              </button>
            </SettingsSection>

            {/* Account */}
            <SettingsSection
              title="Account"
              description="Manage your account information"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="commander@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Mission Commander"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </SettingsSection>

            {/* Integrations */}
            <SettingsSection
              title="Integrations"
              description="Connect external tools and services"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">
                      Slack
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get Slack notifications for milestone completions
                    </p>
                  </div>
                  <button className="px-3 py-1 text-xs rounded border border-border text-foreground hover:bg-secondary transition-colors">
                    Connect
                  </button>
                </div>

                <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">
                      Google Calendar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sync your milestones and tasks to your calendar
                    </p>
                  </div>
                  <button className="px-3 py-1 text-xs rounded border border-border text-foreground hover:bg-secondary transition-colors">
                    Connect
                  </button>
                </div>

                <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">
                      Jira
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Import tasks from your Jira projects
                    </p>
                  </div>
                  <button className="px-3 py-1 text-xs rounded border border-border text-foreground hover:bg-secondary transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            </SettingsSection>

            {/* Danger Zone */}
            <SettingsSection
              title="Danger Zone"
              description="Irreversible actions"
            >
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors font-medium">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </SettingsSection>

            {/* Sign Out */}
            <div className="pt-4">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
