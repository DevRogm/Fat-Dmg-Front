import { request } from './client'

/**
 * @typedef {{ id: number, title: string, author: string, description: string,
 *   start_date: string, end_date: string, tank_type: string, tank_tier: number,
 *   is_finished: boolean, participants_count?: number,
 *   top3?: LeaderboardRow[], my_result?: LeaderboardRow|null }} Event
 * (participants_count, top3 i my_result zwracają events/ i events/{id}/)
 * @typedef {{ place: number|null, profile_id: number, nickname: string, best_damage: number|null,
 *   best_tank: import('./profiles').Tank|null, best_damage_date: string|null }} LeaderboardRow
 */

/**
 * Backend dopuszcza tylko jeden niezakończony event – zwracamy go albo null.
 * @returns {Promise<Event|null>}
 */
export async function getCurrentEvent() {
  const page = await request('events/', { params: { is_finished: false } })
  return page.results[0] ?? null
}

/** @returns {Promise<LeaderboardRow[]>} pełna tabela (bez paginacji) */
export const getLeaderboard = (eventId) => request(`events/${eventId}/leaderboard/`)

export const joinEvent = (eventId) => request(`events/${eventId}/join/`, { method: 'POST' })

/**
 * Lista eventów (paginowana po 20), od najnowszych.
 * @param {{ is_finished?: boolean, tank_tier?: number, tank_type?: string, page?: number }} [params]
 * @returns {Promise<{ count: number, next: string|null, previous: string|null, results: Event[] }>}
 */
export const getEvents = (params) => request('events/', { params })

/** Tylko admin. Backend nie pozwala utworzyć eventu, gdy jakiś jest niezakończony. */
export const createEvent = (payload) => request('events/', { method: 'POST', body: payload })

/** Pojedynczy event (z top3 i my_result jak na liście). */
export const getEvent = (eventId) => request(`events/${eventId}/`)

/**
 * Ostatnie bitwy w evencie: moje i innych graczy (łącznie, nie po kilka od każdego).
 * @typedef {{ profile_id: number, nickname: string, tank: import('./profiles').Tank, damage: number,
 *   damage_date: string|null }} Battle
 * @param {number|string} eventId
 * @param {number} [limit] ile bitew w każdej liście (backend: domyślnie 5, max 20)
 * @returns {Promise<{ mine: Battle[], others: Battle[] }>}
 */
export const getRecentBattles = (eventId, limit) =>
  request(`events/${eventId}/recent-battles/`, { params: { limit } })
