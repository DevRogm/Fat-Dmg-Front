import { request } from './client'

export const MAX_REPORT_IMAGE_BYTES = 5 * 1024 * 1024
export const REPORT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * Wysyła zgłoszenie (multipart – zdjęcie jest opcjonalne).
 * @param {{ title: string, description: string, image?: File|null }} payload
 * @returns {Promise<{ id: number, title: string, description: string, image: string|null,
 *   status: string, created_at: string }>}
 */
export function createReport({ title, description, image }) {
  const form = new FormData()
  form.append('title', title)
  form.append('description', description)
  if (image) form.append('image', image)
  return request('reports/', { method: 'POST', body: form })
}
