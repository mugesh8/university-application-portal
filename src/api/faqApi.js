import { apiUrl } from '../config/baseUrl.js'

export async function fetchPublishedFaqs() {
  const response = await fetch(apiUrl('/api/v1/faqs/public'))
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Failed to load FAQs.')
  }

  return Array.isArray(payload.data) ? payload.data : []
}

