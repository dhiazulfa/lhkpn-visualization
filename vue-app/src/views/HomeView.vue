<template>
  <!-- LOADING -->
  <div v-if="loading" class="loading-screen">
    <div class="spinner"></div>
    <p class="loading-text">Lagi ngambil data harta pejabat... 📂</p>
  </div>

  <div v-else>
    <!-- ===== HERO ===== -->
    <header class="hero hero--light">
      <!-- decorative blobs -->
      <div class="hero-blob hero-blob-1"></div>
      <div class="hero-blob hero-blob-2"></div>
      <div class="hero-blob hero-blob-3"></div>

      <div class="container hero-split">
        <!-- LEFT: text -->
        <div class="hero-left">
          <div class="hero-badge hero-badge--dark">
            <span class="badge-dot badge-dot--lime"></span>
            Data Resmi LHKPN · KPK RI ·
          </div>
          <h1 class="hero-title hero-title--dark">
            Yuk, Ngintip<br/>
            <span class="text-gradient-dark">Harta Pejabat</span><br/>
            Wonogiri! 👀
          </h1>
          <p class="hero-subtitle hero-subtitle--dark">
            Visualisasi Data LHKPN ini dibuat sebagai
            <strong>transparansi publik!</strong>
            Pilih pejabat, lihat detail hartanya.
          </p>
          <div class="hero-chips hero-chips--left">
            <div class="chip chip-ink">✅ Data Resmi KPK</div>
            <div class="chip chip-ink">📊 Visualisasi Interaktif</div>
            <div class="chip chip-lime">⚡ {{ officials.length }} Pejabat</div>
          </div>
        </div>

        <!-- RIGHT: illustration -->
        <div class="hero-right">
          <div class="hero-img-wrap">
            <img
              src="https://marketplace.canva.com/aYHy8/MAGSiFaYHy8/1/tl/canva-society-meeting-isolated-cartoon-vector-illustrations.-MAGSiFaYHy8.png"
              alt="Society Meeting Illustration"
              class="hero-illustration"
              @error="handleImgError"
              ref="heroImg"
            />
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="hero-stats-bar hero-stats-bar--light">
        <div class="container">
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hs-value hs-value--dark">{{ officials.length }}</span>
              <span class="hs-label hs-label--dark">Pejabat</span>
            </div>
            <div class="hero-stat-divider hero-stat-divider--dark"></div>
            <div class="hero-stat">
              <span class="hs-value hs-value--dark">{{ totalLaporan }}</span>
              <span class="hs-label hs-label--dark">Total Laporan</span>
            </div>
            <div class="hero-stat-divider hero-stat-divider--dark"></div>
            <div class="hero-stat">
              <span class="hs-value hs-value--dark">{{ yearRange }}</span>
              <span class="hs-label hs-label--dark">Rentang Tahun</span>
            </div>
            <div class="hero-stat-divider hero-stat-divider--dark"></div>
            <div class="hero-stat">
              <span class="hs-value hs-value--dark">{{ formatRp(totalHartaAll) }}</span>
              <span class="hs-label hs-label--dark">Total Harta Tercatat</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ===== FILTER & SEARCH ===== -->
    <section class="section container" id="officials">
      <div class="search-bar-wrapper">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Cari nama pejabat..."
            id="search-official"
          />
          <button v-if="searchQuery" @click="searchQuery=''" class="search-clear">✕</button>
        </div>
        <div class="filter-select-wrap">
          <span class="filter-select-icon">🏛️</span>
          <select v-model="activeFilter" class="filter-select" id="filter-lembaga">
            <option value="Semua">Semua Lembaga</option>
            <option v-for="f in lembagaOptions" :key="f" :value="f">{{ f }}</option>
          </select>
          <span class="filter-select-arrow">▾</span>
        </div>
      </div>

      <!-- Results count -->
      <div class="results-info">
        <span>Menampilkan <strong>{{ pagedOfficials.length }}</strong> dari {{ filteredOfficials.length }} pejabat</span>
      </div>

      <!-- Grid pejabat -->
      <div v-if="filteredOfficials.length > 0" class="officials-grid">
        <RouterLink
          v-for="(official, i) in pagedOfficials"
          :key="official.groupKey"
          :to="'/official/' + encodeURIComponent(official.groupKey)"
          class="official-card"
        >
          <!-- Rank badge -->
          <div class="card-rank">#{{ (currentPage - 1) * PAGE_SIZE + i + 1 }}</div>

          <!-- Header card -->
          <div class="card-header">
            <div class="card-avatar">
              <span class="card-avatar-icon">{{ getJabatanIcon(official.latestJabatan) }}</span>
            </div>
            <div class="card-jabatan-badge" :class="getJabatanClass(official.latestJabatan)">
              {{ official.latestJabatan }}
            </div>
          </div>

          <!-- Info utama -->
          <div class="card-body">
            <h3 class="card-name">{{ official.name }}</h3>
            <p class="card-unit-kerja" v-if="official.latestUnitKerja">🏢 {{ official.latestUnitKerja }}</p>
            <p class="card-lembaga">{{ official.latestLembaga }}</p>
          </div>

          <!-- Harta total -->
          <div class="card-harta">
            <p class="card-harta-label">Total Harta (Terbaru)</p>
            <p class="card-harta-value">{{ official.latestHarta }}</p>
            <p class="card-harta-date">Per {{ official.latestTanggal }}</p>
          </div>

          <!-- Stats bawah -->
          <div class="card-footer">
            <div class="card-stat">
              <span class="cf-icon">📋</span>
              <span>{{ official.totalLaporan }}x laporan</span>
            </div>
            <div class="card-stat">
              <span class="cf-icon">📅</span>
              <span>Sejak {{ official.firstYear }}</span>
            </div>
            <div class="card-arrow">→</div>
          </div>
        </RouterLink>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-search">
        <p class="empty-search-icon">🔍</p>
        <p class="empty-search-text">Nggak ketemu pejabat dengan nama "<strong>{{ searchQuery }}</strong>"</p>
        <button @click="searchQuery = ''; activeFilter = 'Semua'" class="btn-reset">Reset Pencarian</button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn page-btn--nav"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >← Prev</button>

        <template v-for="p in pageNumbers" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">…</span>
          <button
            v-else
            class="page-btn"
            :class="{ 'page-btn--active': p === currentPage }"
            @click="goToPage(p)"
          >{{ p }}</button>
        </template>

        <button
          class="page-btn page-btn--nav"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >Next →</button>
      </div>
    </section>

    <!-- ===== INFO BANNER / DISCLAIMER ===== -->
    <section class="section container">
      <div class="info-banner">
        <div class="info-banner-icon">⚠️</div>
        <div class="info-banner-text">
          <p class="info-banner-title">Disclaimer</p>
          <p class="info-banner-desc">
            Data yang ditampilkan di situs ini bersumber dari
            <a href="https://elhkpn.kpk.go.id" target="_blank" class="link-blue">elhkpn.kpk.go.id</a>
            (sistem e-LHKPN milik KPK RI).
            <strong>Data di sini mungkin tidak selengkap atau tidak se-mutakhir situs resmi KPK.</strong>
            Situs ini tidak berafiliasi dengan KPK RI maupun instansi pemerintah lainnya.
            Seluruh informasi disajikan untuk kepentingan <strong>edukasi &amp; transparansi publik</strong>,
            dan tidak dimaksudkan sebagai tuduhan, opini, atau penilaian hukum terhadap pihak mana pun.
            Pengelola situs tidak bertanggung jawab atas kekeliruan atau penyalahgunaan informasi di situs ini.
          </p>
        </div>
      </div>
    </section>

    <!-- ===== MODAL DISCLAIMER (first visit) ===== -->
    <Transition name="modal">
      <div v-if="showDisclaimer" class="modal-overlay" @click.self="closeDisclaimer">
        <div class="modal-box">
          <div class="modal-header">
            <span class="modal-icon">⚠️</span>
            <h2 class="modal-title">Sebelum Lanjut, Baca Dulu Ya!</h2>
          </div>
          <div class="modal-body">
            <p>
              Data yang ditampilkan di situs ini bersumber dari
              <a href="https://elhkpn.kpk.go.id" target="_blank" class="link-blue">elhkpn.kpk.go.id</a>
              (sistem e-LHKPN milik Komisi Pemberantasan Korupsi Republik Indonesia).
            </p>
            <ul>
              <li>📋 <strong>Data mungkin tidak selengkap</strong> atau tidak se-mutakhir situs resmi KPK.</li>
              <li>🏛️ Situs ini <strong>tidak berafiliasi</strong> dengan KPK RI, Pemkab Wonogiri, maupun instansi pemerintah lainnya.</li>
              <li>📚 Informasi disajikan semata-mata untuk kepentingan <strong>edukasi &amp; transparansi publik</strong>.</li>
              <li>⚖️ <strong>Tidak dimaksudkan</strong> sebagai tuduhan, opini, atau penilaian hukum terhadap pihak mana pun.</li>
            </ul>
            <p class="modal-note">Untuk data resmi dan terlengkap, kunjungi langsung <a href="https://elhkpn.kpk.go.id" target="_blank" class="link-blue">elhkpn.kpk.go.id</a>.</p>
          </div>
          <div class="modal-footer-btn">
            <button class="modal-btn" @click="closeDisclaimer">✅ Saya Mengerti, Lanjutkan</button>
          </div>
        </div>
      </div>
    </Transition>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import { formatRupiah, parseTotal, clusterByTanah } from '../utils/lhkpn.js'

const PAGE_SIZE = 9

const router = useRouter()
const lhkpnData = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('Semua')
const currentPage = ref(1)
const heroImg = ref(null)
const showDisclaimer = ref(false)

const handleImgError = () => {
  if (heroImg.value) heroImg.value.src = '/hero-illustration.png'
}

const closeDisclaimer = () => {
  showDisclaimer.value = false
  localStorage.setItem('lhkpn_disclaimer_shown', '1')
}

onMounted(async () => {
  // Tampilkan disclaimer modal hanya pada kunjungan pertama
  if (!localStorage.getItem('lhkpn_disclaimer_shown')) {
    showDisclaimer.value = true
  }
  try {
    const res = await fetch('/lhkpn_results.json')
    lhkpnData.value = await res.json()
  } catch (e) {
    console.error('Gagal load data:', e)
  } finally {
    loading.value = false
  }
})

// Grup data per orang unik — dibedakan berdasarkan nama + kesamaan tanah_bangunan
const officials = computed(() => {
  const nameGroups = {}
  lhkpnData.value.forEach(item => {
    if (!nameGroups[item.name]) nameGroups[item.name] = []
    nameGroups[item.name].push(item)
  })

  const result = []

  Object.entries(nameGroups).forEach(([name, records]) => {
    const clusters = clusterByTanah(records)

    clusters.forEach((clusterRecords, idx) => {
      const groupKey = clusters.length > 1 ? `${name}||${idx}` : name
      const latest = clusterRecords[clusterRecords.length - 1]
      const firstYear = clusterRecords[0].tanggal_lapor.split(' ')[2]

      result.push({
        groupKey,
        name,
        records: clusterRecords,
        totalLaporan: clusterRecords.length,
        latestJabatan: latest.jabatan,
        latestLembaga: latest.lembaga,
        latestUnitKerja: latest.unit_kerja || '',
        latestHarta: latest.total_harta,
        latestTanggal: latest.tanggal_lapor,
        latestHartaNum: parseTotal(latest.total_harta),
        firstYear,
      })
    })
  })

  return result.sort((a, b) => b.latestHartaNum - a.latestHartaNum)
})

const lembagaOptions = computed(() => {
  return [...new Set(officials.value.map(o => o.latestLembaga))].sort()
})

const filteredOfficials = computed(() => {
  return officials.value.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchFilter = activeFilter.value === 'Semua' || o.latestLembaga === activeFilter.value
    return matchSearch && matchFilter
  })
})

// Reset halaman ke 1 kalau filter/search berubah
watch([searchQuery, activeFilter], () => { currentPage.value = 1 })

const totalPages = computed(() => Math.ceil(filteredOfficials.value.length / PAGE_SIZE))

const pagedOfficials = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredOfficials.value.slice(start, start + PAGE_SIZE)
})

// Buat array nomor halaman dengan ellipsis kalau terlalu panjang
const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const goToPage = (p) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  // Scroll ke atas grid
  document.getElementById('officials')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const totalLaporan = computed(() => lhkpnData.value.length)

const yearRange = computed(() => {
  if (!officials.value.length) return '-'
  const years = officials.value.map(o => parseInt(o.firstYear))
  const minYear = Math.min(...years)
  return minYear + ' – Kini'
})

const totalHartaAll = computed(() => {
  return officials.value.reduce((sum, o) => sum + Math.max(0, o.latestHartaNum), 0)
})

const formatRp = (v) => formatRupiah(v)

const getJabatanIcon = (jabatan) => {
  if (!jabatan) return '👤'
  if (jabatan.includes('BUPATI') && !jabatan.includes('WAKIL')) return '🏆'
  if (jabatan.includes('WAKIL BUPATI')) return '🥈'
  if (jabatan.includes('KETUA')) return '🏛️'
  if (jabatan.includes('SEKDA') || jabatan.includes('SEKRETARIS')) return '📝'
  if (jabatan.includes('KEPALA')) return '📋'
  if (jabatan.includes('ANGGOTA')) return '👥'
  return '👤'
}

const getJabatanClass = (jabatan) => {
  if (!jabatan) return 'jabatan-default'
  if (jabatan.includes('BUPATI') && !jabatan.includes('WAKIL')) return 'jabatan-bupati'
  if (jabatan.includes('WAKIL')) return 'jabatan-wakil'
  if (jabatan.includes('KETUA')) return 'jabatan-ketua'
  return 'jabatan-default'
}
</script>
