import { request } from './client'

/**
 * @typedef {{ id: number, nickname: string|null, console: 'x'|'p'|null,
 *   full_nickname: string|null, is_active: boolean }} Profile
 * @typedef {{ tank_id: number, name: string, nation: string, tank_type: string,
 *   tier: number, is_premium: boolean, img: string|null }} Tank
 * @typedef {{ tank: Tank|null, expires_at: string, created_at: string,
 *   is_completed: boolean }} ActivationChallenge
 * @typedef {{ event_id: number, event: string, tank: Tank, damage: number,
 *   damage_date: string|null }} ProfileScore
 */

/** @returns {Promise<Profile>} */
export const getMe = () => request('profiles/me/')

/** Zwraca trwającą aktywację albo null (backend odpowiada 404). */
export async function getActivation() {
  try {
    return await request('profiles/me/activation/')
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

/** @param {{ nickname: string, console: 'x'|'p' }} payload */
export const startActivation = (payload) =>
  request('profiles/me/activation/start/', { method: 'POST', body: payload })

/** @returns {Promise<Profile>} */
export const verifyActivation = () => request('profiles/me/activation/verify/', { method: 'POST' })

/** @returns {Promise<ProfileScore[]>} max 20 najlepszych wyników */
export const getTopScores = (profileId) => request(`profiles/${profileId}/top-scores/`)
