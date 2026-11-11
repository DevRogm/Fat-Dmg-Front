import { request } from './client'

/** @returns {Promise<{ access: string, refresh: string }>} */
export const login = (username, password) =>
  request('auth/login/', { method: 'POST', body: { username, password }, auth: false })

/** @returns {Promise<Profile>} */
export const register = (username, email, password) =>
  request('auth/register/', { method: 'POST', body: { username, email, password }, auth: false })

/** Zawsze kończy się sukcesem (204) – backend nie zdradza, czy e-mail istnieje. */
export const requestPasswordReset = (email) =>
  request('auth/password-reset/', { method: 'POST', body: { email }, auth: false })

/** @param {{ uid: string, token: string, new_password: string }} payload */
export const confirmPasswordReset = (payload) =>
  request('auth/password-reset/confirm/', { method: 'POST', body: payload, auth: false })
