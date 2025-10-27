export function formatNumber(value: number | string, locale = 'en-IN') {
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(Number(num))) return String(value)
  return new Intl.NumberFormat(locale).format(Number(num))
}

export default formatNumber
