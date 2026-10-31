import { tokens } from './tokens'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')

/** Wyciąga czytelny komunikat z odpowiedzi błędu DRF. */
function extractMessage(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return typeof data[0] === 'string' ? data[0] : null
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors[0]
  return null
}

export class ApiError extends Error {
  /**
   * @param {number} status kod HTTP
   * @param {any} data sparsowane body odpowiedzi (np. { username: ['...'] })
   */
  constructor(status, data) {
    super(extractMessage(data) ?? `Błąd serwera (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  /** Błędy pól formularza, np. { username: 'Ten login jest już zajęty.' } */
  get fieldErrors() {
    if (!this.data || typeof this.data !== 'object' || Array.isArray(this.data)) return {}
    const result = {}
    for (const [field, value] of Object.entries(this.data)) {
      if (field === 'detail') continue
      result[field] = Array.isArray(value) ? value.join(' ') : String(value)
    }
    return result
  }
}

let authLostHandler = null

/** Wywoływane, gdy nie da się już odświeżyć sesji (store robi wtedy logout). */
export function setAuthLostHandler(fn) {
  authLostHandler = fn
}

let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = tokens.getRefresh()
      if (!refresh) throw new Error('Brak refresh tokenu')

      const res = await fetch(`${BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (!res.ok) throw new Error('Nie udało się odświeżyć tokenu')

      const data = await res.json()
      tokens.set({ access: data.access, refresh: data.refresh ?? refresh })
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}/${path.replace(/^\//, '')}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value)
    }
  }
  return url
}

async function parseBody(res) {
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * @param {string} path np. 'events/' (bez wiodącego /api)
 * @param {{ method?: string, body?: any, params?: Record<string, any>, auth?: boolean }} [options]
 *   auth: false = nie dołączaj tokenu ani nie próbuj odświeżać (logowanie, rejestracja)
 */
export async function request(path, { method = 'GET', body, params, auth = true } = {}) {
  const send = () => {
    const headers = {}
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    const access = auth ? tokens.getAccess() : null
    if (access) headers.Authorization = `Bearer ${access}`

    const init = { method, headers }
    if (body !== undefined) init.body = JSON.stringify(body)
    return fetch(buildUrl(path, params), init)
  }

  let res
  try {
    res = await send()
  } catch {
    throw new ApiError(0, { detail: 'Brak połączenia z serwerem.' })
  }

  if (res.status === 401 && auth && tokens.getRefresh()) {
    try {
      await refreshAccessToken()
      res = await send()
    } catch {
      tokens.clear()
      authLostHandler?.()
      throw new ApiError(401, { detail: 'Sesja wygasła. Zaloguj się ponownie.' })
    }
  }

  const data = await parseBody(res)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}
