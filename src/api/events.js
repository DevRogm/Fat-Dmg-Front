import { request } from './client'

/**
 * @typedef {{ id: number, title: string, author: string, description: string,
 *   start_date: string, end_date: string, tank_type: string, tank_tier: number,
 *   is_finished: boolean }} Event
 * @typedef {{ place: number|null, nickname: string, best_damage: number|null,
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
