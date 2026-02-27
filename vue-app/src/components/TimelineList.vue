<template>
  <div class="timeline-container">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="timeline-item"
      :class="{ 'timeline-item--active': selectedIndex === index }"
      @click="$emit('select', index)"
    >
      <div class="timeline-dot">
        <span>{{ getIcon(item.jabatan) }}</span>
      </div>
      <div class="timeline-content">
        <div class="timeline-top">
          <div>
            <p class="timeline-date">{{ item.tanggal_lapor }}</p>
            <p class="timeline-jabatan">{{ item.jabatan }}</p>
            <p class="timeline-lembaga">{{ item.lembaga }}</p>
          </div>
          <div class="timeline-harta-badge" :class="getTrendClass(item, index)">
            <span>{{ getTrendIcon(item, index) }}</span>
            <span>{{ item.total_harta }}</span>
          </div>
        </div>
        <div class="timeline-jenis-badge">{{ item.jenis_laporan }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { parseTotal } from '../utils/lhkpn.js'

const props = defineProps({
  data: Array,
  selectedIndex: Number
})
defineEmits(['select'])

const getIcon = (jabatan) => {
  if (jabatan?.includes('BUPATI') && !jabatan.includes('WAKIL')) return '🏆'
  if (jabatan?.includes('WAKIL BUPATI')) return '🥈'
  if (jabatan?.includes('KETUA')) return '🏛️'
  if (jabatan?.includes('ANGGOTA')) return '📋'
  return '👤'
}

const getTrendValue = (item) => parseTotal(item.total_harta)

const getTrendClass = (item, index) => {
  if (index === 0) return 'trend-same'
  const prev = getTrendValue(props.data[index - 1])
  const curr = getTrendValue(item)
  if (curr > prev) return 'trend-up'
  if (curr < prev) return 'trend-down'
  return 'trend-same'
}

const getTrendIcon = (item, index) => {
  if (index === 0) return '📊'
  const prev = getTrendValue(props.data[index - 1])
  const curr = getTrendValue(item)
  if (curr > prev) return '📈'
  if (curr < prev) return '📉'
  return '➡️'
}
</script>
