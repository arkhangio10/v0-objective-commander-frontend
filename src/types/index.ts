// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  timezone: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── Risk & Status ────────────────────────────────────────────────────────────

export type RiskStatus = 'on_track' | 'at_risk' | 'critical'
export type ObjectiveCategory =
  | 'health'
  | 'career'
  | 'finance'
  | 'education'
  | 'personal'
  | 'project'
  | 'business'
  | 'fitness'
  | 'other'

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type TaskSource = 'app' | 'google_tasks'

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'tools'
  | 'subscriptions'
  | 'study'
  | 'health'
  | 'misc'

export interface FixedCommitment {
  label: string
  schedule: string
  dateRange?: string
  notes?: string
}

// ─── Objective ────────────────────────────────────────────────────────────────

export interface Objective {
  id: string
  title: string
  description: string
  category: ObjectiveCategory
  startDate: string
  endDate: string
  targetOutcome: string
  estimatedEffort: number // hours
  budgetLimit: number
  moneySpent: number
  progressPercent: number
  riskStatus: RiskStatus
  feasibilityScore: number // 0-100
  consistencyScore: number // 0-100
  scheduleVariance: number // days (negative = behind)
  checkpointHours: number[]
  emailReminders: boolean
  currentBaseline: string
  strategyNotes: string
  prePlan: string
  constraints: string[]
  fixedCommitments: FixedCommitment[]
  dailyNonNegotiables: string[]
  executionPreferences: string[]
  reminderStrategy: string
  isActive: boolean
  coachMessage: string
  createdAt: string
  updatedAt: string
}

export interface CreateObjectiveDTO {
  title: string
  description: string
  category: ObjectiveCategory
  startDate: string
  endDate: string
  targetOutcome: string
  estimatedEffort: number
  budgetLimit: number
  checkpointHours: number[]
  emailReminders: boolean
  currentBaseline: string
  strategyNotes: string
  prePlan: string
  constraints: string[]
  fixedCommitments: FixedCommitment[]
  dailyNonNegotiables: string[]
  executionPreferences: string[]
  reminderStrategy: string
}

export interface ProgressNote {
  id: string
  objectiveId: string
  noteDate: string
  note: string
  metricLabel?: string
  metricValue?: number
  marksObjectiveComplete: boolean
  source: string
  createdAt: string
}

export interface CreateProgressNoteDTO {
  note: string
  noteDate?: string
  metricLabel?: string
  metricValue?: number
  marksObjectiveComplete?: boolean
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string
  objectiveId: string
  title: string
  dueDate: string
  status: MilestoneStatus
  completionPercent: number
  linkedTasksCount: number
  description?: string
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  objectiveId: string
  milestoneId?: string
  title: string
  dueDate: string
  source: TaskSource
  status: TaskStatus
  isOverdue: boolean
  googleTaskId?: string
  notes?: string
}

export interface DailyPlanTask {
  objectiveId: string
  objectiveTitle: string
  taskId: string
  title: string
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  effortEstimate: string
  reason: string
  source: string
  isOverdue: boolean
}

export interface DailyPlan {
  date: string
  focusSummary: string
  todayPriorities: string[]
  recommendedTasks: DailyPlanTask[]
  carryoverCount: number
  tomorrowPreview: string[]
  recommendedReminderHours: number[]
  adaptationNotes: string[]
  patternInsights: string[]
  whyToday: string[]
  recommendedTimeBlocks: string[]
  workloadLevel: 'light' | 'moderate' | 'focused'
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export interface Expense {
  id: string
  objectiveId: string
  amount: number
  category: ExpenseCategory
  date: string
  note?: string
  createdAt: string
}

export interface CreateExpenseDTO {
  objectiveId: string
  amount: number
  category: ExpenseCategory
  date: string
  note?: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsSnapshot {
  objectiveId: string
  date: string
  expectedProgress: number
  actualProgress: number
  scheduleVariance: number
  consistencyScore: number
  feasibilityScore: number
  moneySpent: number
  projectedTotalSpend: number
  paceRequired: number // tasks/day needed to finish on time
  riskTrend: RiskStatus[]
}

// ─── Recovery Plan ────────────────────────────────────────────────────────────

export interface RecoveryPlan {
  objectiveId: string
  generatedAt: string
  missedItems: string[]
  changedItems: string[]
  todayPriorities: string[]
  newTaskAllocation: string[]
  explanation: string
  deadlineUnchanged: boolean
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  greeting: string
  today: string
  nextCheckpoint: string
  activeObjectivesCount: number
  onTrackCount: number
  atRiskCount: number
  criticalCount: number
  totalSpentThisWeek: number
  coachMessage: string
  todayPriorityTasks: Task[]
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export interface IntegrationsStatus {
  googleTasksConnected: boolean
  googleTasksEmail?: string
  lastSyncTime?: string
  syncErrors: string[]
  emailNotificationsEnabled: boolean
  whatsappEnabled: boolean // future-ready
  googleTasksDetails?: Record<string, unknown>
  emailDetails?: Record<string, unknown>
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface UserSettings {
  timezone: string
  emailAddress: string
  emailNotificationsEnabled: boolean
  checkpointHours: number[]
  googleTasksConnected: boolean
  displayName: string
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
