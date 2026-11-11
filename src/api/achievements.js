import { request } from './client'

/**
 * @typedef {{ id: number, name: string, description: string, group: string,
 *   image: string }} Achievement
 */

/** @returns {Promise<Achievement[]>} wszystkie emblematy (bez paginacji) */
export const getAchievements = () => request('achievements/', { auth: false })
