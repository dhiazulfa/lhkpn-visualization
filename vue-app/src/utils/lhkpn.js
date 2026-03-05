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
 * Buat "fingerprint" dari satu record berdasarkan:
 * - Semua deskripsi tanah_bangunan (yang bukan 'Total')
 * - Semua deskripsi transportasi (yang bukan 'Total')
 *
 * @param {Object} record - satu record LHKPN
 * @returns {{ tanah: Set<string>, transportasi: Set<string> }}
 */
function buildFingerprint(record) {
  const tanah = new Set(
    (record.tanah_bangunan || [])
      .map(t => t.description)
      .filter(d => d && d !== 'Total')
  )
  const transportasi = new Set(
    (record.transportasi || [])
      .map(t => t.description)
      .filter(d => d && d !== 'Total')
  )
  return { tanah, transportasi }
}

/**
 * Cek apakah dua fingerprint kemungkinan milik orang yang sama.
 * Kriteria (salah satu harus terpenuhi):
 *   1. Berbagi ≥1 deskripsi tanah/bangunan yang persis sama, ATAU
 *   2. Berbagi ≥2 deskripsi transportasi yang persis sama
 *      (minimal 2 agar tidak false-positive dari kendaraan umum seperti Honda Vario)
 *
 * @param {{ tanah: Set, transportasi: Set }} fpA
 * @param {{ tanah: Set, transportasi: Set }} fpB
 * @returns {boolean}
 */
function isSamePerson(fpA, fpB) {
  // Kriteria 1: ada tanah yang sama
  for (const d of fpA.tanah) {
    if (fpB.tanah.has(d)) return true
  }

  // Kriteria 2: ada ≥2 kendaraan yang sama
  let sharedVehicles = 0
  for (const d of fpA.transportasi) {
    if (fpB.transportasi.has(d)) {
      sharedVehicles++
      if (sharedVehicles >= 2) return true
    }
  }

  return false
}

/**
 * Cluster records berdasarkan fingerprint gabungan (tanah + transportasi).
 *
 * Algoritma:
 *   - Sort records dari terlama ke terbaru (kronologis)
 *   - Tiap record dibandingkan dengan semua cluster yang ada
 *   - Jika ada overlap (sesuai kriteria isSamePerson), gabungkan ke cluster tersebut
 *     dan perbarui fingerprint cluster
 *   - Jika tidak ada, buat cluster baru
 *   - Record tanpa tanah maupun transportasi → gabung ke cluster terakhir
 *
 * @param {Array} records - array record LHKPN untuk satu nama
 * @returns {Array<Array>} - array of clusters, tiap cluster = array records (sorted old→new)
 */
export function clusterByTanah(records) {
  // Sort oldest first agar clustering berjalan kronologis
  const sorted = [...records].sort((a, b) => parseTanggal(a.tanggal_lapor) - parseTanggal(b.tanggal_lapor))

  // Tiap cluster menyimpan: fingerprint gabungan (union semua records) + records-nya
  const clusters = [] // [{ tanah: Set<string>, transportasi: Set<string>, records: [] }]

  sorted.forEach(record => {
    const fp = buildFingerprint(record)
    const hasAssets = fp.tanah.size > 0 || fp.transportasi.size > 0

    if (!hasAssets) {
      // Tidak punya aset sama sekali → gabung ke cluster terakhir
      if (clusters.length > 0) {
        clusters[clusters.length - 1].records.push(record)
      } else {
        clusters.push({ tanah: new Set(), transportasi: new Set(), records: [record] })
      }
      return
    }

    // Cari cluster yang match
    const matchIdx = clusters.findIndex(c => isSamePerson(c, fp))

    if (matchIdx >= 0) {
      // Orang yang sama — tambahkan record dan perbarui fingerprint cluster (union)
      clusters[matchIdx].records.push(record)
      fp.tanah.forEach(d => clusters[matchIdx].tanah.add(d))
      fp.transportasi.forEach(d => clusters[matchIdx].transportasi.add(d))
    } else {
      // Orang baru — buat cluster baru
      clusters.push({ tanah: fp.tanah, transportasi: fp.transportasi, records: [record] })
    }
  })

  return clusters.map(c => c.records)
}
