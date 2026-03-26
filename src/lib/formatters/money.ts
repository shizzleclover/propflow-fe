export function formatMoneyNGN(value: number | null | undefined) {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '₦—'

  // en-NG yields ₦ and comma grouping as expected for NGN.
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(num)
}

