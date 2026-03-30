/**
 * Typed API client for Objective Commander
 * Configured to connect to a FastAPI backend.
 * In development, returns mock data.
 */

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

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))

    let message = error.message ?? 'Request failed'
    if (Array.isArray(error.detail)) {
      message = error.detail
        .map((item: { loc?: Array<string | number>; msg?: string }) => {
          const path = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : 'field'
          return `${path}: ${item.msg ?? 'invalid value'}`
        })
        .join(' | ')
    }

    throw new ApiError(response.status, message, error.detail)
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
