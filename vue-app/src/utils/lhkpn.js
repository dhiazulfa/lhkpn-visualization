/**
 * Utility functions untuk olah data LHKPN
 */

/**
 * Format angka ke format Rupiah yang readable
 * e.g. 1500000000 → "Rp 1,5 M" atau "Rp 150 jt"
 */
export function formatRupiah(value) {
  if (!value && value !== 0) return 'Rp 0'
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) {
    return 'Rp ' + (value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' M'
  }
  if (abs >= 1_000_000) {
    return 'Rp ' + (value / 1_000_000).toFixed(0) + ' jt'
  }
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(value)
}

/**
 * Parse total harta dari string "Rp.1.950.348.502" → number
 */
export function parseTotal(str) {
  if (!str) return 0
  const cleaned = str.replace('Rp.', '').replace('Rp', '').replace(/\./g, '').replace(/-/g, '-').trim()
  return parseInt(cleaned) || 0
}

/**
 * Sum semua items dalam array asset
 * Tiap item punya { description, value } dimana value bisa "1.000.000" (dot-separated)
 */
export function sumAssets(items) {
  if (!items || !items.length) return 0
  return items.reduce((total, item) => {
    const val = parseInt(String(item.value).replace(/\./g, '')) || 0
    return total + val
  }, 0)
}
