import { request } from './client'

/**
 * @typedef {{ id: number, nickname: string|null, console: 'x'|'p'|null,
 *   full_nickname: string|null, is_active: boolean, is_staff?: boolean }} Profile
 * (is_staff zwraca tylko profiles/me/ – publiczna lista profili go nie ma)
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

/**
 * Szukanie zarejestrowanych, aktywnych graczy po fragmencie nicku (bez końcówki -x/-p).
 * @returns {Promise<{ count: number, results: Profile[] }>} pierwsza strona (20 wyników)
 */
export const searchProfiles = (query) =>
  request('profiles/', { params: { search: query, is_active: true } })

/**
 * @typedef {{ event_id: number, event: string, is_finished: boolean, start_date: string,
 *   end_date: string, tank_type: string, tank_tier: number, place: number|null,
 *   participants_count: number, best_damage: number|null, best_tank: Tank|null,
 *   best_damage_date: string|null }} ProfileEventResult
 * @typedef {{ events_played: number, wins: number, podiums: number, best_place: number|null,
 *   battles_count: number, average_damage: number|null,
 *   best_result: ProfileEventResult|null }} ProfileStatsSummary
 */

/**
 * Statystyki gracza z eventów FatDmg.
 * @returns {Promise<{ profile: Profile, summary: ProfileStatsSummary, events: ProfileEventResult[] }>}
 */
export const getProfileStats = (profileId) => request(`profiles/${profileId}/stats/`)
