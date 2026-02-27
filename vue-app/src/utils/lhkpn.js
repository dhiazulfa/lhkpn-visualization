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

/**
 * Helper: parse tanggal lapor ke Date object
 */
function parseTanggal(d) {
  const parts = d.split(' ')
  const months = {
    Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
    Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11
  }
  return new Date(parts[2], months[parts[1]], parseInt(parts[0]))
}

/**
 * Cluster records berdasarkan kesamaan deskripsi tanah_bangunan.
 * Records yang berbagi minimal 1 deskripsi tanah dianggap milik orang yang sama.
 * Records tanpa tanah dikelompokkan dengan cluster terakhir yang ada.
 *
 * Berlaku untuk semua nama, tidak hanya SRIYONO.
 *
 * @param {Array} records - array record LHKPN untuk satu nama
 * @returns {Array<Array>} - array of clusters, tiap cluster = array records (sorted old→new)
 */
export function clusterByTanah(records) {
  // Sort oldest first agar clustering berjalan kronologis
  const sorted = [...records].sort((a, b) => parseTanggal(a.tanggal_lapor) - parseTanggal(b.tanggal_lapor))

  const clusters = [] // [{ descs: Set<string>, records: [] }]

  sorted.forEach(record => {
    const tanahDescs = (record.tanah_bangunan || [])
      .map(t => t.description)
      .filter(d => d && d !== 'Total')

    if (tanahDescs.length === 0) {
      // Tidak punya tanah — gabungkan ke cluster terakhir, atau buat baru jika belum ada
      if (clusters.length > 0) {
        clusters[clusters.length - 1].records.push(record)
      } else {
        clusters.push({ descs: new Set(), records: [record] })
      }
      return
    }

    // Cari cluster yang punya overlap deskripsi tanah
    const matchIdx = clusters.findIndex(c => tanahDescs.some(d => c.descs.has(d)))

    if (matchIdx >= 0) {
      // Orang yang sama — tambahkan ke cluster dan update deskripsi
      clusters[matchIdx].records.push(record)
      tanahDescs.forEach(d => clusters[matchIdx].descs.add(d))
    } else {
      // Orang baru — buat cluster baru
      clusters.push({ descs: new Set(tanahDescs), records: [record] })
    }
  })

  return clusters.map(c => c.records)
}
