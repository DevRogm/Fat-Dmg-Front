const dateTimeFormat = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })
const numberFormat = new Intl.NumberFormat('pl-PL')

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const TANK_TYPES = {
  heavyTank: 'Ciężki',
  mediumTank: 'Średni',
  lightTank: 'Lekki',
  'AT-SPG': 'Niszczyciel czołgów',
  SPG: 'Artyleria',
  unknown: 'Nieznany',
}

const NATIONS = {
  usa: 'USA',
  ussr: 'ZSRR',
  germany: 'Niemcy',
  uk: 'Wielka Brytania',
  france: 'Francja',
  china: 'Chiny',
  japan: 'Japonia',
  czech: 'Czechosłowacja',
  sweden: 'Szwecja',
  poland: 'Polska',
  italy: 'Włochy',
  switzerland: 'Szwajcaria',
  merc: 'Najemnicy',
  unknown: 'Nieznany',
}

/** @param {string|null|undefined} iso */
export const formatDateTime = (iso) => (iso ? dateTimeFormat.format(new Date(iso)) : '—')

/** @param {number|null|undefined} value */
export const formatNumber = (value) => (value == null ? '—' : numberFormat.format(value))

/** 1..10 -> I..X */
export const formatTier = (tier) => ROMAN[tier - 1] ?? String(tier)

export const formatConsole = (code) => ({ x: 'Xbox', p: 'PlayStation' })[code] ?? '—'

export const formatNation = (nation) => NATIONS[nation] ?? nation

export const formatTankType = (type) => TANK_TYPES[type] ?? type

/** Milisekundy -> "2 d 03:04:05" albo "03:04:05" */
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const hms = [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
  return days > 0 ? `${days} d ${hms}` : hms
}
