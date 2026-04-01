/**
 * Typed API client for Objective Commander
 * Configured to connect to a FastAPI backend.
 * In development, returns mock data.
 */

import { getFirebaseAuth } from '@/src/lib/firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function forceRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const firebaseUser = getFirebaseAuth()?.currentUser
  if (!firebaseUser) return null
  const token = await firebaseUser.getIdToken(true)
  localStorage.setItem('auth_token', token)
  return token
}

function buildHeaders(token: string | null, options?: RequestInit): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  }
}

function parseApiError(status: number, error: { message?: string; detail?: unknown; details?: unknown }): ApiError {
  const validationDetails = error.detail ?? error.details
  let message = error.message ?? 'Request failed'
  if (Array.isArray(validationDetails)) {
    message = validationDetails
      .map((item: { loc?: Array<string | number>; msg?: string }) => {
        const path = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : 'field'
        return `${path}: ${item.msg ?? 'invalid value'}`
      })
      .join(' | ')
  }
  return new ApiError(status, message, validationDetails)
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const headers = buildHeaders(token, options)

  const response = await fetch(url, { ...options, headers })

  // On 401, force-refresh the Firebase token and retry once
  if (response.status === 401) {
    const newToken = await forceRefreshToken()
    if (newToken) {
      const retryResponse = await fetch(url, {
        ...options,
        headers: buildHeaders(newToken, options),
      })
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({ message: 'Request failed' }))
        throw parseApiError(retryResponse.status, error)
      }
      return retryResponse.json() as Promise<T>
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw parseApiError(response.status, error)
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

export { ApiError }
