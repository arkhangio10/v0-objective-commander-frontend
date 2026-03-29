/**
 * Objective Commander — Frontend API Service Layer
 * All endpoints designed to match a FastAPI backend.
 * Falls back to mock data in development.
 */

import type {
  User,
  Objective,
  CreateObjectiveDTO,
  Milestone,
  Task,
  Expense,
  CreateExpenseDTO,
  AnalyticsSnapshot,
  RecoveryPlan,
  DashboardData,
  IntegrationsStatus,
  UserSettings,
  ApiResponse,
  PaginatedResponse,
} from '@/src/types'

import {
  mockUser,
  mockObjectives,
  mockMilestones,
  mockTasks,
  mockExpenses,
  mockAnalytics,
  mockRecoveryPlan,
  mockDashboard,
  mockIntegrations,
  mockSettings,
} from '@/src/lib/mock-data'

const USE_MOCK = true // Toggle to false when backend is live

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, _password: string): Promise<{ token: string; user: User }> => {
    await delay()
    return { token: 'mock_jwt_token', user: { ...mockUser, email } }
  },

  register: async (
    email: string,
    _password: string,
    displayName: string,
  ): Promise<{ token: string; user: User }> => {
    await delay()
    return { token: 'mock_jwt_token', user: { ...mockUser, email, displayName } }
  },

  logout: async (): Promise<void> => {
    await delay(200)
  },

  getSession: async (): Promise<User | null> => {
    await delay(200)
    if (USE_MOCK) return mockUser
    return null
  },

  forgotPassword: async (_email: string): Promise<ApiResponse<null>> => {
    await delay()
    return { data: null, success: true, message: 'Reset email sent.' }
  },
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    await delay()
    return mockDashboard
  },
}

// ─── Objectives ───────────────────────────────────────────────────────────────

export const objectivesService = {
  list: async (): Promise<PaginatedResponse<Objective>> => {
    await delay()
    return {
      data: mockObjectives,
      total: mockObjectives.length,
      page: 1,
      pageSize: 20,
      hasMore: false,
    }
  },

  getById: async (id: string): Promise<Objective> => {
    await delay()
    const obj = mockObjectives.find((o) => o.id === id)
    if (!obj) throw new Error(`Objective ${id} not found`)
    return obj
  },

  create: async (dto: CreateObjectiveDTO): Promise<Objective> => {
    await delay()
    return {
      id: `obj_${Date.now()}`,
      ...dto,
      moneySpent: 0,
      progressPercent: 0,
      riskStatus: 'on_track',
      feasibilityScore: 85,
      consistencyScore: 100,
      scheduleVariance: 0,
      isActive: true,
      coachMessage: 'Objective created. Begin execution immediately.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },

  update: async (id: string, dto: Partial<CreateObjectiveDTO>): Promise<Objective> => {
    await delay()
    const obj = mockObjectives.find((o) => o.id === id)
    if (!obj) throw new Error(`Objective ${id} not found`)
    return { ...obj, ...dto, updatedAt: new Date().toISOString() }
  },

  delete: async (_id: string): Promise<ApiResponse<null>> => {
    await delay()
    return { data: null, success: true, message: 'Objective deleted.' }
  },

  generatePlan: async (id: string): Promise<RecoveryPlan> => {
    await delay(800)
    return { ...mockRecoveryPlan, objectiveId: id, generatedAt: new Date().toISOString() }
  },

  resyncTasks: async (_id: string): Promise<ApiResponse<null>> => {
    await delay(600)
    return { data: null, success: true, message: 'Tasks resynced from Google Tasks.' }
  },

  getProgress: async (id: string): Promise<{ progressPercent: number; riskStatus: string }> => {
    await delay()
    const obj = mockObjectives.find((o) => o.id === id)
    return {
      progressPercent: obj?.progressPercent ?? 0,
      riskStatus: obj?.riskStatus ?? 'on_track',
    }
  },
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export const milestonesService = {
  listByObjective: async (objectiveId: string): Promise<Milestone[]> => {
    await delay()
    return mockMilestones.filter((m) => m.objectiveId === objectiveId)
  },
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksService = {
  listByObjective: async (objectiveId: string): Promise<Task[]> => {
    await delay()
    return mockTasks.filter((t) => t.objectiveId === objectiveId)
  },
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const expensesService = {
  listByObjective: async (objectiveId: string): Promise<Expense[]> => {
    await delay()
    return mockExpenses.filter((e) => e.objectiveId === objectiveId)
  },

  listAll: async (): Promise<Expense[]> => {
    await delay()
    return mockExpenses
  },

  create: async (dto: CreateExpenseDTO): Promise<Expense> => {
    await delay()
    return {
      id: `exp_${Date.now()}`,
      ...dto,
      createdAt: new Date().toISOString(),
    }
  },
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsService = {
  getSnapshot: async (objectiveId: string): Promise<AnalyticsSnapshot> => {
    await delay()
    return { ...mockAnalytics, objectiveId }
  },
}

// ─── Recovery Plan ────────────────────────────────────────────────────────────

export const recoveryService = {
  getPlan: async (objectiveId: string): Promise<RecoveryPlan> => {
    await delay()
    return { ...mockRecoveryPlan, objectiveId }
  },
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export const integrationsService = {
  getStatus: async (): Promise<IntegrationsStatus> => {
    await delay()
    return mockIntegrations
  },
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsService = {
  get: async (): Promise<UserSettings> => {
    await delay()
    return mockSettings
  },

  update: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    await delay()
    return { ...mockSettings, ...settings }
  },
}
