import { request } from './client'

/**
 * @typedef {{ id: number, title: string, content: string, published_at: string }} NewsPost
 */

/**
 * Opublikowane newsy, od najświeższego (paginacja po 20).
 * @returns {Promise<{ count: number, results: NewsPost[] }>}
 */
export const getNews = (page = 1) => request('news/', { params: { page }, auth: false })
