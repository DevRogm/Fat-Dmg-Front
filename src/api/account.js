import { request } from './client'

/**
 * @typedef {{ username: string, email: string, nickname: string|null, console: 'x'|'p'|null,
 *   full_nickname: string|null, is_active_profile: boolean }} Account
 */

/** @returns {Promise<Account>} */
export const getAccount = () => request('account/')

/** @param {{ username?: string, email?: string }} payload @returns {Promise<Account>} */
export const updateAccount = (payload) => request('account/', { method: 'PATCH', body: payload })

/** @param {{ old_password: string, new_password: string }} payload */
export const changePassword = (payload) =>
  request('account/password/', { method: 'POST', body: payload })
