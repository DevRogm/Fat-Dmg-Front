/**
 * Zwraca bezpieczną ścieżkę wewnętrzną z ?redirect= albo null.
 * Odrzuca adresy zewnętrzne (np. //evil.com, https://...) i pętle na login/rejestrację.
 */
export function getSafeRedirect(value) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  if (value.startsWith('/login') || value.startsWith('/register')) return null
  return value
}
