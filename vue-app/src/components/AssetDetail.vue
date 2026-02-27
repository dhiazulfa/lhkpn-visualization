<template>
  <div v-if="data">
    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Tanah & Bangunan -->
    <div class="tab-content" v-if="activeTab === 'tanah'">
      <template v-if="data.tanah_bangunan.length > 0">
        <div class="asset-list">
          <div class="asset-item" v-for="(a, i) in data.tanah_bangunan" :key="i">
            <div class="asset-rank">{{ i+1 }}</div>
            <div class="asset-desc">
              <p class="asset-description-text">{{ formatDesc(a.description) }}</p>
              <p class="asset-tag">🏡 Properti</p>
            </div>
            <div class="asset-value">{{ formatRp(parseVal(a.value)) }}</div>
          </div>
          <div class="asset-total">
            <span>Total Tanah & Bangunan</span>
            <span>{{ formatRp(sumAssets(data.tanah_bangunan)) }}</span>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">😴 Kosong bro, nggak ada data tanah & bangunan di laporan ini.</div>
    </div>

    <!-- Transportasi -->
    <div class="tab-content" v-if="activeTab === 'transportasi'">
      <template v-if="data.transportasi.length > 0">
        <div class="asset-list">
          <div class="asset-item" v-for="(a, i) in data.transportasi" :key="i">
            <div class="asset-rank">{{ i+1 }}</div>
            <div class="asset-desc">
              <p class="asset-description-text">{{ formatVehicle(a.description) }}</p>
              <p class="asset-tag">🚗 Kendaraan</p>
            </div>
            <div class="asset-value">{{ formatRp(parseVal(a.value)) }}</div>
          </div>
          <div class="asset-total">
            <span>Total Kendaraan</span>
            <span>{{ formatRp(sumAssets(data.transportasi)) }}</span>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">😴 Nggak ada kendaraan tercatat.</div>
    </div>

    <!-- Kas -->
    <div class="tab-content" v-if="activeTab === 'kas'">
      <template v-if="sumAssets(data.kas) > 0">
        <div class="single-value-display">
          <div class="svg-icon">💳</div>
          <div class="single-value-info">
            <p class="single-value-label">Kas & Setara Kas</p>
            <p class="single-value-amount">{{ formatRp(sumAssets(data.kas)) }}</p>
            <p class="single-value-desc">Uang tunai, tabungan, dan deposito</p>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">😴 Nggak ada catatan kas di laporan ini.</div>
    </div>

    <!-- Harta Bergerak -->
    <div class="tab-content" v-if="activeTab === 'bergerak'">
      <template v-if="sumAssets(data.bergerak_lainnya) > 0">
        <div class="single-value-display">
          <div class="svg-icon">📦</div>
          <div class="single-value-info">
            <p class="single-value-label">Harta Bergerak Lainnya</p>
            <p class="single-value-amount">{{ formatRp(sumAssets(data.bergerak_lainnya)) }}</p>
            <p class="single-value-desc">Logam mulia, barang seni, dan sejenisnya</p>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">😴 Nggak ada harta bergerak lainnya tercatat.</div>
    </div>

    <!-- Hutang -->
    <div class="tab-content" v-if="activeTab === 'hutang'">
      <template v-if="sumAssets(data.hutang) > 0">
        <div class="single-value-display single-value-display--red">
          <div class="svg-icon">📉</div>
          <div class="single-value-info">
            <p class="single-value-label">Total Hutang / Kewajiban</p>
            <p class="single-value-amount single-value-amount--red">{{ formatRp(sumAssets(data.hutang)) }}</p>
            <p class="single-value-desc">Hutang bank, KPR, atau kewajiban lainnya</p>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">✅ Bersih! Nggak ada hutang tercatat di laporan ini.</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatRupiah, sumAssets } from '../utils/lhkpn.js'

const props = defineProps({ data: Object })

const activeTab = ref('tanah')

const tabs = [
  { key: 'tanah',       icon: '🏠', label: 'Tanah & Bangunan' },
  { key: 'transportasi',icon: '🚗', label: 'Kendaraan' },
  { key: 'kas',         icon: '💰', label: 'Kas' },
  { key: 'bergerak',    icon: '📦', label: 'Harta Lainnya' },
  { key: 'hutang',      icon: '📉', label: 'Hutang' },
]

const formatRp  = (v) => formatRupiah(v)
const parseVal  = (v) => parseInt(String(v).replace(/\./g, '')) || 0
const formatDesc = (desc) => {
  // Bikin lebih readable
  return desc.replace(', HASIL SENDIRI', ' (Hasil Sendiri)')
             .replace(', WARISAN', ' (Warisan)')
             .replace(', HIBAH', ' (Hibah)')
}
const formatVehicle = (desc) => {
  // "MOTOR, HONDA VARIO Tahun 2014, HASIL SENDIRI" → "Honda Vario (2014)"
  const parts = desc.split(',')
  if (parts.length >= 2) {
    const brand = parts[1].trim()
    const yearMatch = brand.match(/Tahun (\d{4})/)
    const year = yearMatch ? yearMatch[1] : ''
    const name = brand.replace(/Tahun \d{4}/, '').trim()
    const origin = parts[2] ? parts[2].trim().replace('HASIL SENDIRI', 'Hasil Sendiri').replace('WARISAN', 'Warisan') : ''
    return `${parts[0].trim()} — ${name}${year ? ' (' + year + ')' : ''}${origin ? ' · ' + origin : ''}`
  }
  return desc
}
</script>
