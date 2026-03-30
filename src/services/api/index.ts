import { apiClient } from './client'
import { getFirebaseAuth, isFirebaseConfigured } from '@/src/lib/firebase'

import type {
  AnalyticsSnapshot,
  ApiResponse,
  CreateExpenseDTO,
  CreateObjectiveDTO,
  DailyPlan,
  DashboardData,
  Expense,
  FixedCommitment,
  IntegrationsStatus,
  Objective,
  PaginatedResponse,
  RecoveryPlan,
  Task,
  User,
  UserSettings,
} from '@/src/types'

type BootstrapResponse = {
  user_id: string
  email: string
  display_name: string
  timezone: string
  onboarded: boolean
  google_tasks_connected: boolean
  email_reminders_enabled: boolean
}

type BackendObjective = {
  id: string
  title: string
  description: string
  category: string
  start_date: string
  end_date: string
  target_outcome: string
  estimated_effort: string
  budget_limit: number
  total_spent: number
  progress_percentage: number
  risk_status: string
  feasibility_score: number
  preferred_checkpoint_hours: number[]
  email_reminders_enabled: boolean
  current_baseline: string
  strategy_notes: string
  pre_plan: string
  constraints: string[]
  fixed_commitments: Array<{
    label: string
    schedule: string
    date_range?: string | null
    notes?: string | null
  }>
  daily_non_negotiables: string[]
  execution_preferences: string[]
  reminder_strategy: string
  created_at: string
  updated_at: string
}

type BackendObjectiveListResponse = {
  objectives: Array<{
    id: string
    title: string
    category: string
    end_date: string
    progress_percentage: number
    risk_status: string
    total_tasks: number
    completed_tasks: number
    status: string
  }>
  total: number
}

type BackendTaskListResponse = {
  tasks: Array<{
    id: string
    title: string
    description: string
    due_date: string
    priority: string
    effort_estimate: string
    completion_status: string
    is_overdue: boolean
    sync_status: string
    milestone_id?: string | null
    google_task_id?: string | null
    google_task_list_id?: string | null
  }>
  total: number
  completed: number
  overdue: number
}

type BackendExpense = {
  id: string
  objective_id: string
  amount: number
  category: string
  date: string
  note?: string | null
  created_at: string
}

type BackendExpenseListResponse = {
  expenses: BackendExpense[]
  total_spent: number
  budget_limit: number
  budget_variance: number
  burn_rate: number
  projected_total_spend: number
}

type BackendAnalytics = {
  objective_id: string
  completion_rate: number
  expected_completion_rate: number
  schedule_variance: number
  consistency_score: number
  feasibility_score: number
  total_spent: number
  projected_total_spend: number
  pace_required_to_finish: number
  risk_status: string
  last_updated: string
}

type BackendRecoveryPlan = {
  id: string
  objective_id: string
  top_priorities: string[]
  explanation: string
  feasibility_score: number
  task_moves: Array<{ title?: string; new_due_date?: string }>
  created_at: string
}

type BackendCoachMessage = {
  objective_id: string
  dashboard_message: string
  execution_guidance: string
  risk_status: string
  created_at: string
}

type BackendDashboard = {
  objectives: Array<{
    id: string
    title: string
    progress_percentage: number
    risk_status: string
    end_date: string
    total_tasks: number
    completed_tasks: number
  }>
  active_objectives: number
  overall_completion: number
  at_risk_count: number
  coach_message?: string | null
}

type BackendIntegrationsResponse = {
  integrations: Array<{
    provider: string
    connected: boolean
    last_sync_at?: string | null
    last_error?: string | null
    details?: Record<string, unknown>
  }>
}

type BackendSettings = {
  timezone: string
  preferred_checkpoint_hours: number[]
  email_reminders_enabled: boolean
  google_tasks_connected: boolean
}

type BackendDailyPlan = {
  date: string
  focus_summary: string
  today_priorities: string[]
  recommended_tasks: Array<{
    objective_id: string
    objective_title: string
    task_id: string
    title: string
    due_date: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    effort_estimate: string
    reason: string
    source: string
    is_overdue: boolean
  }>
  carryover_count: number
  tomorrow_preview: string[]
  recommended_reminder_hours: number[]
  adaptation_notes: string[]
  pattern_insights: string[]
  why_today: string[]
  recommended_time_blocks: string[]
  workload_level: 'light' | 'moderate' | 'focused'
}

const DEV_TOKEN = 'dev-testuser'

function ensureDevToken(): string {
  if (typeof window === 'undefined') return DEV_TOKEN
  const existing = localStorage.getItem('auth_token')
  if (existing) return existing
  localStorage.setItem('auth_token', DEV_TOKEN)
  return DEV_TOKEN
}

async function getAuthToken(): Promise<string> {
  if (typeof window === 'undefined') return DEV_TOKEN
  const firebaseAuth = getFirebaseAuth()
  const firebaseUser = firebaseAuth?.currentUser
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken()
    localStorage.setItem('auth_token', token)
    return token
  }
  return ensureDevToken()
}

function normalizeRiskStatus(value: string): 'on_track' | 'at_risk' | 'critical' {
  if (value === 'behind' || value === 'critical') return 'critical'
  if (value === 'at_risk') return 'at_risk'
  return 'on_track'
}

function parseEstimatedEffort(value: string): number {
  const match = value.match(/(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function mapFixedCommitment(commitment: BackendObjective['fixed_commitments'][number]): FixedCommitment {
  return {
    label: commitment.label,
    schedule: commitment.schedule,
    dateRange: commitment.date_range ?? undefined,
    notes: commitment.notes ?? undefined,
  }
}

function mapObjective(objective: BackendObjective): Objective {
  return {
    id: objective.id,
    title: objective.title,
    description: objective.description,
    category: objective.category as Objective['category'],
    startDate: objective.start_date,
    endDate: objective.end_date,
    targetOutcome: objective.target_outcome,
    estimatedEffort: parseEstimatedEffort(objective.estimated_effort),
    budgetLimit: objective.budget_limit,
    moneySpent: objective.total_spent,
    progressPercent: objective.progress_percentage,
    riskStatus: normalizeRiskStatus(objective.risk_status),
    feasibilityScore: Math.round(objective.feasibility_score * 100),
    consistencyScore: 0,
    scheduleVariance: 0,
    checkpointHours: objective.preferred_checkpoint_hours,
    emailReminders: objective.email_reminders_enabled,
    currentBaseline: objective.current_baseline,
    strategyNotes: objective.strategy_notes,
    prePlan: objective.pre_plan,
    constraints: objective.constraints,
    fixedCommitments: objective.fixed_commitments.map(mapFixedCommitment),
    dailyNonNegotiables: objective.daily_non_negotiables,
    executionPreferences: objective.execution_preferences,
    reminderStrategy: objective.reminder_strategy,
    isActive: true,
    coachMessage: '',
    createdAt: objective.created_at,
    updatedAt: objective.updated_at,
  }
}

function mapTask(task: BackendTaskListResponse['tasks'][number], objectiveId: string): Task {
  return {
    id: task.id,
    objectiveId,
    milestoneId: task.milestone_id ?? undefined,
    title: task.title,
    dueDate: task.due_date,
    source: task.google_task_id ? 'google_tasks' : 'app',
    status:
      task.completion_status === 'completed'
        ? 'completed'
        : task.completion_status === 'in_progress'
          ? 'in_progress'
          : task.is_overdue
            ? 'overdue'
            : 'pending',
    isOverdue: task.is_overdue,
    googleTaskId: task.google_task_id ?? undefined,
    notes: task.description,
  }
}

function mapExpense(expense: BackendExpense): Expense {
  return {
    id: expense.id,
    objectiveId: expense.objective_id,
    amount: expense.amount,
    category: expense.category as Expense['category'],
    date: expense.date,
    note: expense.note ?? undefined,
    createdAt: expense.created_at,
  }
}

function mapDailyPlan(plan: BackendDailyPlan): DailyPlan {
  return {
    date: plan.date,
    focusSummary: plan.focus_summary,
    todayPriorities: plan.today_priorities,
    recommendedTasks: plan.recommended_tasks.map((task) => ({
      objectiveId: task.objective_id,
      objectiveTitle: task.objective_title,
      taskId: task.task_id,
      title: task.title,
      dueDate: task.due_date,
      priority: task.priority,
      effortEstimate: task.effort_estimate,
      reason: task.reason,
      source: task.source,
      isOverdue: task.is_overdue,
    })),
    carryoverCount: plan.carryover_count,
    tomorrowPreview: plan.tomorrow_preview,
    recommendedReminderHours: plan.recommended_reminder_hours,
    adaptationNotes: plan.adaptation_notes,
    patternInsights: plan.pattern_insights,
    whyToday: plan.why_today,
    recommendedTimeBlocks: plan.recommended_time_blocks,
    workloadLevel: plan.workload_level,
  }
}

export const authService = {
  login: async (email: string, _password: string): Promise<{ token: string; user: User }> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', DEV_TOKEN)
      localStorage.setItem('auth_email', email)
    }
    const session = await apiClient.get<BootstrapResponse>('/session/bootstrap')
    return {
      token: DEV_TOKEN,
      user: {
        id: session.user_id,
        email: session.email,
        displayName: session.display_name,
        timezone: session.timezone,
        createdAt: new Date().toISOString(),
      },
    }
  },

  register: async (
    email: string,
    password: string,
    _displayName: string,
  ): Promise<{ token: string; user: User }> => authService.login(email, password),

  logout: async (): Promise<void> => {
    const firebaseAuth = getFirebaseAuth()
    if (firebaseAuth) {
      await firebaseAuth.signOut()
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_email')
    }
  },

  loginWithGoogle: async (): Promise<{ token: string; user: User }> => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth || !isFirebaseConfigured()) {
      throw new Error('Firebase Google Auth is not configured')
    }

    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(firebaseAuth, provider)
    const token = await credential.user.getIdToken()

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_email', credential.user.email || '')
    }

    const session = await apiClient.get<BootstrapResponse>('/session/bootstrap')
    return {
      token,
      user: {
        id: session.user_id,
        email: session.email,
        displayName: session.display_name,
        timezone: session.timezone,
        createdAt: new Date().toISOString(),
      },
    }
  },

  getSession: async (): Promise<User | null> => {
    await getAuthToken()
    try {
      const session = await apiClient.get<BootstrapResponse>('/session/bootstrap')
      return {
        id: session.user_id,
        email: session.email,
        displayName: session.display_name,
        timezone: session.timezone,
        createdAt: new Date().toISOString(),
      }
    } catch {
      return null
    }
  },

  forgotPassword: async (_email: string): Promise<ApiResponse<null>> => {
    return { data: null, success: true, message: 'Password reset is not implemented yet.' }
  },
}

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    ensureDevToken()
    const [dashboard, dailyPlan] = await Promise.all([
      apiClient.get<BackendDashboard>('/dashboard'),
      apiClient.get<BackendDailyPlan>('/dashboard/daily-plan').catch(() => null),
    ])
    const mappedDailyPlan = dailyPlan ? mapDailyPlan(dailyPlan) : null
    return {
      greeting: '',
      today: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      nextCheckpoint:
        mappedDailyPlan?.recommendedReminderHours?.length
          ? `${mappedDailyPlan.recommendedReminderHours[0]}:00`
          : '10:00',
      activeObjectivesCount: dashboard.active_objectives,
      onTrackCount: dashboard.objectives.filter((o) => normalizeRiskStatus(o.risk_status) === 'on_track').length,
      atRiskCount: dashboard.at_risk_count,
      criticalCount: dashboard.objectives.filter((o) => normalizeRiskStatus(o.risk_status) === 'critical').length,
      totalSpentThisWeek: 0,
      coachMessage:
        mappedDailyPlan?.focusSummary ||
        dashboard.coach_message ||
        'Execution status is live. Review your active objectives and keep momentum.',
      todayPriorityTasks: mappedDailyPlan
        ? mappedDailyPlan.recommendedTasks.map((task) => ({
            id: task.taskId,
            objectiveId: task.objectiveId,
            title: task.title,
            dueDate: task.dueDate,
            source: task.source === 'google_tasks' ? 'google_tasks' : 'app',
            status: task.isOverdue ? 'overdue' : 'pending',
            isOverdue: task.isOverdue,
            notes: task.reason,
          }))
        : [],
    }
  },
}

export const objectivesService = {
  list: async (): Promise<PaginatedResponse<Objective>> => {
    await getAuthToken()
    const res = await apiClient.get<BackendObjectiveListResponse>('/objectives')
    const objectives = res.objectives.map((item) => ({
      id: item.id,
      title: item.title,
      description: '',
      category: item.category as Objective['category'],
      startDate: '',
      endDate: item.end_date,
      targetOutcome: '',
      estimatedEffort: 0,
      budgetLimit: 0,
      moneySpent: 0,
      progressPercent: item.progress_percentage,
      riskStatus: normalizeRiskStatus(item.risk_status),
      feasibilityScore: 0,
      consistencyScore: 0,
      scheduleVariance: 0,
      checkpointHours: [],
      emailReminders: true,
      currentBaseline: '',
      strategyNotes: '',
      prePlan: '',
      constraints: [],
      fixedCommitments: [],
      dailyNonNegotiables: [],
      executionPreferences: [],
      reminderStrategy: '',
      isActive: item.status === 'active',
      coachMessage: '',
      createdAt: '',
      updatedAt: '',
    }))
    return {
      data: objectives,
      total: res.total,
      page: 1,
      pageSize: res.total,
      hasMore: false,
    }
  },

  getById: async (id: string): Promise<Objective> => {
    await getAuthToken()
    const [detail, analytics, coach] = await Promise.all([
      apiClient.get<BackendObjective>(`/objectives/${id}`),
      apiClient.get<BackendAnalytics>(`/objectives/${id}/analytics`).catch(() => null),
      apiClient.get<BackendCoachMessage | { message: string }>(`/objectives/${id}/coach-message`).catch(() => ({ message: '' })),
    ])
    const mapped = mapObjective(detail)
    mapped.coachMessage = 'dashboard_message' in coach ? coach.dashboard_message : ''
    if (analytics) {
      mapped.consistencyScore = Math.round(analytics.consistency_score * 100)
      mapped.scheduleVariance = analytics.schedule_variance
      mapped.moneySpent = analytics.total_spent
      mapped.feasibilityScore = Math.round(analytics.feasibility_score * 100)
      mapped.riskStatus = normalizeRiskStatus(analytics.risk_status)
    }
    return mapped
  },

  create: async (dto: CreateObjectiveDTO): Promise<Objective> => {
    await getAuthToken()
    const created = await apiClient.post<BackendObjective>('/objectives', {
      title: dto.title,
      description: dto.description,
      category: dto.category === 'business' || dto.category === 'fitness' ? 'other' : dto.category,
      start_date: dto.startDate,
      end_date: dto.endDate,
      target_outcome: dto.targetOutcome,
      estimated_effort: dto.estimatedEffort ? `${dto.estimatedEffort} hours` : '',
      budget_limit: dto.budgetLimit,
      preferred_checkpoint_hours: dto.checkpointHours,
      email_reminders_enabled: dto.emailReminders,
      current_baseline: dto.currentBaseline,
      strategy_notes: dto.strategyNotes,
      pre_plan: dto.prePlan,
      constraints: dto.constraints,
      fixed_commitments: dto.fixedCommitments.map((item) => ({
        label: item.label,
        schedule: item.schedule,
        ...(item.dateRange ? { date_range: item.dateRange } : {}),
        ...(item.notes ? { notes: item.notes } : {}),
      })),
      daily_non_negotiables: dto.dailyNonNegotiables,
      execution_preferences: dto.executionPreferences,
      reminder_strategy: dto.reminderStrategy,
    })
    return mapObjective(created)
  },

  update: async (id: string, dto: Partial<CreateObjectiveDTO>): Promise<Objective> => {
    await getAuthToken()
    const updated = await apiClient.patch<BackendObjective>(`/objectives/${id}`, {
      ...(dto.title ? { title: dto.title } : {}),
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.category ? { category: dto.category === 'business' || dto.category === 'fitness' ? 'other' : dto.category } : {}),
      ...(dto.targetOutcome ? { target_outcome: dto.targetOutcome } : {}),
      ...(dto.estimatedEffort !== undefined ? { estimated_effort: `${dto.estimatedEffort} hours` } : {}),
      ...(dto.budgetLimit !== undefined ? { budget_limit: dto.budgetLimit } : {}),
      ...(dto.checkpointHours ? { preferred_checkpoint_hours: dto.checkpointHours } : {}),
      ...(dto.emailReminders !== undefined ? { email_reminders_enabled: dto.emailReminders } : {}),
      ...(dto.currentBaseline !== undefined ? { current_baseline: dto.currentBaseline } : {}),
      ...(dto.strategyNotes !== undefined ? { strategy_notes: dto.strategyNotes } : {}),
      ...(dto.prePlan !== undefined ? { pre_plan: dto.prePlan } : {}),
      ...(dto.constraints ? { constraints: dto.constraints } : {}),
      ...(dto.fixedCommitments
        ? {
            fixed_commitments: dto.fixedCommitments.map((item) => ({
              label: item.label,
              schedule: item.schedule,
              ...(item.dateRange ? { date_range: item.dateRange } : {}),
              ...(item.notes ? { notes: item.notes } : {}),
            })),
          }
        : {}),
      ...(dto.dailyNonNegotiables ? { daily_non_negotiables: dto.dailyNonNegotiables } : {}),
      ...(dto.executionPreferences ? { execution_preferences: dto.executionPreferences } : {}),
      ...(dto.reminderStrategy !== undefined ? { reminder_strategy: dto.reminderStrategy } : {}),
    })
    return mapObjective(updated)
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    await getAuthToken()
    await apiClient.delete(`/objectives/${id}`)
    return { data: null, success: true, message: 'Objective deleted.' }
  },

  generatePlan: async (id: string): Promise<RecoveryPlan> => {
    await getAuthToken()
    await apiClient.post(`/objectives/${id}/generate-plan`, {})
    return recoveryService.getPlan(id)
  },

  resyncTasks: async (id: string): Promise<ApiResponse<{ synced: number; skipped: number; errors: number }>> => {
    await getAuthToken()
    const result = await apiClient.post<{ synced: number; skipped: number; errors: number }>(`/objectives/${id}/resync-tasks`, {})
    return { data: result, success: true, message: 'Tasks synced with Google Tasks.' }
  },

  getProgress: async (id: string): Promise<{ progressPercent: number; riskStatus: string }> => {
    await getAuthToken()
    const analytics = await apiClient.get<BackendAnalytics>(`/objectives/${id}/analytics`)
    return {
      progressPercent: Math.round(analytics.completion_rate * 100),
      riskStatus: normalizeRiskStatus(analytics.risk_status),
    }
  },

  getDailyPlan: async (id: string): Promise<DailyPlan> => {
    await getAuthToken()
    const plan = await apiClient.get<BackendDailyPlan>(`/objectives/${id}/daily-plan`)
    return mapDailyPlan(plan)
  },
}

export const milestonesService = {
  listByObjective: async (_objectiveId: string) => [],
}

export const tasksService = {
  listByObjective: async (objectiveId: string): Promise<Task[]> => {
    await getAuthToken()
    const response = await apiClient.get<BackendTaskListResponse>(`/objectives/${objectiveId}/tasks`)
    return response.tasks.map((task) => mapTask(task, objectiveId))
  },

  updateCompletion: async (objectiveId: string, taskId: string, completed: boolean) => {
    await getAuthToken()
    return apiClient.patch(`/objectives/${objectiveId}/tasks/${taskId}`, {
      completion_status: completed ? 'completed' : 'not_started',
    })
  },
}

export const expensesService = {
  listByObjective: async (objectiveId: string): Promise<Expense[]> => {
    await getAuthToken()
    const response = await apiClient.get<BackendExpenseListResponse>(`/objectives/${objectiveId}/expenses`)
    return response.expenses.map(mapExpense)
  },

  listAll: async (): Promise<Expense[]> => {
    await getAuthToken()
    const objectives = await objectivesService.list()
    const grouped = await Promise.all(objectives.data.map((objective) => expensesService.listByObjective(objective.id)))
    return grouped.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  create: async (dto: CreateExpenseDTO): Promise<Expense> => {
    await getAuthToken()
    const created = await apiClient.post<BackendExpense>(`/objectives/${dto.objectiveId}/expenses`, {
      amount: dto.amount,
      category: dto.category,
      currency: 'USD',
      date: dto.date,
      note: dto.note,
    })
    return mapExpense(created)
  },
}

export const analyticsService = {
  getSnapshot: async (objectiveId: string): Promise<AnalyticsSnapshot> => {
    await getAuthToken()
    const analytics = await apiClient.get<BackendAnalytics>(`/objectives/${objectiveId}/analytics`)
    return {
      objectiveId,
      date: analytics.last_updated,
      expectedProgress: Math.round(analytics.expected_completion_rate * 100),
      actualProgress: Math.round(analytics.completion_rate * 100),
      scheduleVariance: analytics.schedule_variance,
      consistencyScore: Math.round(analytics.consistency_score * 100),
      feasibilityScore: Math.round(analytics.feasibility_score * 100),
      moneySpent: analytics.total_spent,
      projectedTotalSpend: analytics.projected_total_spend,
      paceRequired: analytics.pace_required_to_finish,
      riskTrend: [normalizeRiskStatus(analytics.risk_status)],
    }
  },
}

export const recoveryService = {
  getPlan: async (objectiveId: string): Promise<RecoveryPlan> => {
    await getAuthToken()
    const plan = await apiClient.get<BackendRecoveryPlan | { message: string }>(`/objectives/${objectiveId}/recovery-plan`)
    if ('message' in plan) {
      return {
        objectiveId,
        generatedAt: new Date().toISOString(),
        missedItems: [],
        changedItems: [],
        todayPriorities: [],
        newTaskAllocation: [],
        explanation: plan.message,
        deadlineUnchanged: true,
      }
    }
    return {
      objectiveId,
      generatedAt: plan.created_at,
      missedItems: [],
      changedItems: plan.task_moves.map((item) => item.title || 'Updated task'),
      todayPriorities: plan.top_priorities,
      newTaskAllocation: plan.task_moves.map((item) => `${item.title || 'Task'} -> ${item.new_due_date || 'unscheduled'}`),
      explanation: plan.explanation,
      deadlineUnchanged: true,
    }
  },
}

export const integrationsService = {
  getStatus: async (): Promise<IntegrationsStatus> => {
    await getAuthToken()
    const response = await apiClient.get<BackendIntegrationsResponse>('/integrations')
    const google = response.integrations.find((item) => item.provider === 'google_tasks')
    const email = response.integrations.find((item) => item.provider === 'email')
    return {
      googleTasksConnected: !!google?.connected,
      lastSyncTime: google?.last_sync_at || undefined,
      syncErrors: google?.last_error ? [google.last_error] : [],
      emailNotificationsEnabled: !!email?.connected,
      whatsappEnabled: false,
      googleTasksDetails: google?.details,
      emailDetails: email?.details,
    }
  },

  connectGoogleTasks: async (): Promise<{ authorizationUrl: string }> => {
    await getAuthToken()
    const response = await apiClient.post<{ authorization_url: string }>('/integrations/google-tasks/connect', {})
    return { authorizationUrl: response.authorization_url }
  },

  disconnectGoogleTasks: async (): Promise<void> => {
    await getAuthToken()
    await apiClient.post('/integrations/google-tasks/disconnect', {})
  },
}

export const settingsService = {
  get: async (): Promise<UserSettings> => {
    await getAuthToken()
    const [session, settings] = await Promise.all([
      apiClient.get<BootstrapResponse>('/session/bootstrap'),
      apiClient.get<BackendSettings>('/settings'),
    ])
    return {
      timezone: settings.timezone,
      emailAddress: session.email,
      emailNotificationsEnabled: settings.email_reminders_enabled,
      checkpointHours: settings.preferred_checkpoint_hours,
      googleTasksConnected: settings.google_tasks_connected,
      displayName: session.display_name,
    }
  },

  update: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    await getAuthToken()
    const updated = await apiClient.patch<BackendSettings>('/settings', {
      ...(settings.timezone ? { timezone: settings.timezone } : {}),
      ...(settings.checkpointHours ? { preferred_checkpoint_hours: settings.checkpointHours } : {}),
      ...(settings.emailNotificationsEnabled !== undefined
        ? { email_reminders_enabled: settings.emailNotificationsEnabled }
        : {}),
    })
    const session = await apiClient.get<BootstrapResponse>('/session/bootstrap')
    return {
      timezone: updated.timezone,
      emailAddress: session.email,
      emailNotificationsEnabled: updated.email_reminders_enabled,
      checkpointHours: updated.preferred_checkpoint_hours,
      googleTasksConnected: updated.google_tasks_connected,
      displayName: session.display_name,
    }
  },
}
