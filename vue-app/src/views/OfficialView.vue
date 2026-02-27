<template>
  <div v-if="loading" class="loading-screen">
    <div class="spinner"></div>
    <p class="loading-text">Ngambil data dulu 📂</p>
  </div>

  <div v-else-if="!officialRecords.length" class="loading-screen">
    <p style="font-size:3rem">😕</p>
    <p class="loading-text">Pejabat "{{ decodedName }}" nggak ketemu di data.</p>
    <RouterLink to="/" class="btn-back">← Balik ke Beranda</RouterLink>
  </div>

  <div v-else>
    <!-- Navbar back -->
    <nav class="detail-nav">
      <div class="container detail-nav-inner">
        <RouterLink to="/" class="btn-back-nav">
          <span>←</span> Semua Pejabat
        </RouterLink>
        <div class="detail-nav-breadcrumb">
          <span>LHKPN Wonogiri</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ latestData?.name }}</span>
        </div>
      </div>
    </nav>

    <!-- Profile Card -->
    <section class="section container" id="profile">
      <ProfileCard :data="latestData" />
    </section>

    <!-- Snapshot -->
    <section class="section container" id="stats">
      <div class="section-header">
        <h2 class="section-title">Snapshot Kekayaan 📸</h2>
        <p class="section-sub">Data laporan terbaru</p>
      </div>
      <StatsGrid :data="latestData" :totalLaporan="officialRecords.length" />
    </section>

    <!-- Line Chart -->
    <section class="section container" id="timeline-chart">
      <div class="section-header">
        <h2 class="section-title">Perjalanan Harta dari Masa ke Masa 📈</h2>
        <p class="section-sub">Hartanya naik-turun, wusss</p>
      </div>
      <HartaChart :data="officialRecords" />
    </section>

    <!-- Timeline Karier -->
    <section class="section container" id="timeline">
      <div class="section-header">
        <h2 class="section-title">Karier🏛️</h2>
        <p class="section-sub">Klik laporan buat lihat detail hartanya per tahun</p>
      </div>
      <TimelineList
        :data="officialRecords"
        :selectedIndex="selectedIndex"
        @select="selectItem"
      />
    </section>

    <!-- Detail Aset -->
    <template v-if="selectedItem">
      <section class="section container" id="detail">
        <div class="section-header">
          <h2 class="section-title">Detail Aset Kekayaan 🔍</h2>
          <p class="section-sub">
            Laporan per <strong>{{ selectedItem.tanggal_lapor }}</strong> — ini nih isi dompetnya!
          </p>
        </div>
        <AssetDetail :key="selectedIndex" :data="selectedItem" />
      </section>

      <!-- Donut Chart -->
      <section class="section container" id="komposisi">
        <div class="section-header">
          <h2 class="section-title">Komposisi Harta 🥧</h2>
          <p class="section-sub">Hartanya paling banyak dari mana? Cus cek!</p>
        </div>
        <DonutChart :key="'donut-' + selectedIndex" :data="selectedItem" />
      </section>
    </template>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'
import StatsGrid from '../components/StatsGrid.vue'
import HartaChart from '../components/HartaChart.vue'
import TimelineList from '../components/TimelineList.vue'
import AssetDetail from '../components/AssetDetail.vue'
import DonutChart from '../components/DonutChart.vue'
import AppFooter from '../components/AppFooter.vue'
import { clusterByTanah } from '../utils/lhkpn.js'

const route = useRoute()
// groupKey format: "NAMA" (single cluster) atau "NAMA||idx" (multi cluster)
const decodedKey = computed(() => decodeURIComponent(route.params.name))
const decodedName = computed(() => decodedKey.value.split('||')[0])
const clusterIdx = computed(() => {
  const parts = decodedKey.value.split('||')
  return parts.length > 1 ? parseInt(parts[1]) : 0
})

const lhkpnData = ref([])
const loading = ref(true)
const selectedIndex = ref(0)

onMounted(async () => {
  try {
    const res = await fetch('/lhkpn_results.json')
    lhkpnData.value = await res.json()
  } catch (e) {
    console.error('Gagal load data:', e)
  } finally {
    loading.value = false
    await nextTick()
    // Default ke laporan terbaru
    selectedIndex.value = officialRecords.value.length > 0
      ? officialRecords.value.length - 1
      : 0
  }
})

// Filter dan cluster data berdasarkan groupKey dari URL
const officialRecords = computed(() => {
  const allForName = lhkpnData.value.filter(d => d.name === decodedName.value)
  const clusters = clusterByTanah(allForName)
  // Ambil cluster sesuai idx, fallback ke cluster pertama jika idx tidak ada
  return clusters[clusterIdx.value] || clusters[0] || []
})

const latestData = computed(() => {
  const recs = officialRecords.value
  return recs.length ? recs[recs.length - 1] : null
})

const selectedItem = computed(() => officialRecords.value[selectedIndex.value] || null)

const selectItem = (idx) => {
  selectedIndex.value = idx
  setTimeout(() => {
    document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
}
</script>
