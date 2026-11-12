import { request } from './client'

/**
 * @typedef {{ id: number, video_id: string, url: string, title: string, author: string, description: string, added_at: string, thumbnail: string }} YoutubeVideo
 */

/**
 * Opublikowane filmy YouTube, od ostatnio dodanego (paginacja po 12).
 * @returns {Promise<{ count: number, results: YoutubeVideo[] }>}
 */
export const getVideos = (page = 1) => request('youtube/', { params: { page }, auth: false })
