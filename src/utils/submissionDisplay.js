import { normalizeSelectOptions } from './formVisibility.js'

/**
 * Human-readable value for a single form field (read-only), aligned with StepForm review.
 */
export function getSingleFieldDisplayValue(field, rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return 'Not provided'
  }

  if (field.type === 'checkbox') {
    return rawValue ? 'Yes' : 'No'
  }

  if (field.type === 'select' || field.type === 'radioGroup') {
    const normalized = normalizeSelectOptions(field.options ?? [])
    const match = normalized.find((opt) => String(opt.value) === String(rawValue))
    return match?.label ?? String(rawValue)
  }

  return String(rawValue)
}
