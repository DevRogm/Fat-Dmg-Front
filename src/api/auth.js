import { request } from './client'

/** @returns {Promise<{ access: string, refresh: string }>} */
export const login = (username, password) =>
  request('auth/login/', { method: 'POST', body: { username, password }, auth: false })

/** @returns {Promise<Profile>} */
export const register = (username, password) =>
  request('auth/register/', { method: 'POST', body: { username, password }, auth: false })
