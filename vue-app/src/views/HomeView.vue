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
            Data Resmi LHKPN · KPK RI · Wonogiri
          </div>
          <h1 class="hero-title hero-title--dark">
            Yuk, Ngintip<br/>
            <span class="text-gradient-dark">Harta Pejabat</span><br/>
            Wonogiri! 👀
          </h1>
          <p class="hero-subtitle hero-subtitle--dark">
            Data LHKPN bukan buat sombong, tapi buat
            <strong>transparansi publik!</strong>
            Pilih pejabat, lihat detail hartanya.
          </p>
          <div class="hero-chips hero-chips--left">
            <div class="chip chip-ink">✅ Data Resmi KPK</div>
            <div class="chip chip-ink">📊 Visualisasi Interaktif</div>
            <div class="chip chip-lime">⚡ {{ officials.length }} Pejabat</div>
          </div>
          <a href="#officials" class="hero-cta-btn">
            Lihat Semua Pejabat →
          </a>
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
        <div class="filter-chips">
          <button
            v-for="f in jabatanFilters"
            :key="f"
            class="filter-chip"
            :class="{ 'filter-chip--active': activeFilter === f }"
            @click="activeFilter = activeFilter === f ? 'Semua' : f"
          >
            {{ f }}
          </button>
        </div>
      </div>

      <!-- Results count -->
      <div class="results-info" v-if="filteredOfficials.length !== officials.length">
        <span>Menampilkan <strong>{{ filteredOfficials.length }}</strong> dari {{ officials.length }} pejabat</span>
      </div>

      <!-- Grid pejabat -->
      <div v-if="filteredOfficials.length > 0" class="officials-grid">
        <RouterLink
          v-for="(official, i) in filteredOfficials"
          :key="official.name"
          :to="'/official/' + encodeURIComponent(official.name)"
          class="official-card"
        >
          <!-- Rank badge -->
          <div class="card-rank">#{{ i + 1 }}</div>

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
    </section>

    <!-- ===== INFO BANNER ===== -->
    <section class="section container">
      <div class="info-banner">
        <div class="info-banner-icon">⚠️</div>
        <div class="info-banner-text">
          <p class="info-banner-title">Ini bukan situs resmi pemerintah</p>
          <p class="info-banner-desc">
            Data diambil dari <a href="https://elhkpn.kpk.go.id" target="_blank" class="link-blue">elhkpn.kpk.go.id</a>
            dan ditampilkan untuk kepentingan <strong>edukasi & transparansi publik</strong>.
            Buat ngecek langsung, kunjungi situs KPK ya!
          </p>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import { formatRupiah, parseTotal } from '../utils/lhkpn.js'

const router = useRouter()
const lhkpnData = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('Semua')
const heroImg = ref(null)

const handleImgError = () => {
  if (heroImg.value) heroImg.value.src = '/hero-illustration.png'
}

onMounted(async () => {
  try {
    const res = await fetch('/lhkpn_results.json')
    lhkpnData.value = await res.json()
  } catch (e) {
    console.error('Gagal load data:', e)
  } finally {
    loading.value = false
  }
})

// Grup data per nama pejabat
const officials = computed(() => {
  const groups = {}
  lhkpnData.value.forEach(item => {
    if (!groups[item.name]) groups[item.name] = []
    groups[item.name].push(item)
  })

  return Object.entries(groups).map(([name, records]) => {
    // Sort records by date, newest last
    const sorted = [...records].sort((a, b) => {
      const parseDate = (d) => {
        const parts = d.split(' ')
        const months = { Januari:0,Februari:1,Maret:2,April:3,Mei:4,Juni:5,
          Juli:6,Agustus:7,September:8,Oktober:9,November:10,Desember:11 }
        return new Date(parts[2], months[parts[1]], parseInt(parts[0]))
      }
      return parseDate(a.tanggal_lapor) - parseDate(b.tanggal_lapor)
    })
    const latest = sorted[sorted.length - 1]
    const firstYear = sorted[0].tanggal_lapor.split(' ')[2]

    return {
      name,
      records: sorted,
      totalLaporan: records.length,
      latestJabatan: latest.jabatan,
      latestLembaga: latest.lembaga,
      latestHarta: latest.total_harta,
      latestTanggal: latest.tanggal_lapor,
      latestHartaNum: parseTotal(latest.total_harta),
      firstYear,
    }
  }).sort((a, b) => b.latestHartaNum - a.latestHartaNum) // sort by richest
})

const jabatanFilters = computed(() => {
  const all = ['Semua', ...new Set(officials.value.map(o => o.latestJabatan))]
  return all
})

const filteredOfficials = computed(() => {
  return officials.value.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchFilter = activeFilter.value === 'Semua' || o.latestJabatan === activeFilter.value
    return matchSearch && matchFilter
  })
})

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
