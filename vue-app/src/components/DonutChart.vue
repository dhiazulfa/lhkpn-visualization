<template>
  <div class="donut-wrapper">
    <div class="donut-chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <div class="donut-legend">
      <div class="donut-legend-item" v-for="(item, i) in legendItems" :key="i">
        <div class="donut-legend-dot" :style="{ background: item.color }"></div>
        <div class="donut-legend-text">
          <p class="donut-legend-label">{{ item.label }}</p>
          <p class="donut-legend-value">{{ item.formatted }}</p>
          <div class="donut-legend-bar">
            <div class="donut-legend-bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js'
import { formatRupiah, sumAssets } from '../utils/lhkpn.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({ data: Object })

const COLORS = ['#96d32e', '#ff6b47', '#f5a623', '#9b5cf5', '#4bb3fd']
const LABELS = ['Tanah & Bangunan', 'Kendaraan', 'Kas', 'Harta Bergerak', 'Surat Berharga']

const values = computed(() => [
  sumAssets(props.data?.tanah_bangunan),
  sumAssets(props.data?.transportasi),
  sumAssets(props.data?.kas),
  sumAssets(props.data?.bergerak_lainnya),
  sumAssets(props.data?.surat_berharga),
])

const total = computed(() => values.value.reduce((a, b) => a + b, 0))

const legendItems = computed(() =>
  LABELS.map((label, i) => ({
    label,
    color: COLORS[i],
    value: values.value[i],
    formatted: formatRupiah(values.value[i]),
    pct: total.value > 0 ? Math.round((values.value[i] / total.value) * 100) : 0,
  })).filter(item => item.value > 0)
)

const chartData = computed(() => {
  const filtered = legendItems.value
  return {
    labels: filtered.map(i => i.label),
    datasets: [{
      data: filtered.map(i => i.value),
      backgroundColor: filtered.map(i => i.color + 'cc'),
      borderColor: filtered.map(i => i.color),
      borderWidth: 2,
      hoverOffset: 12,
    }]
  }
})

const chartOptions = {
  responsive: true,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1410',
      borderColor: 'rgba(185,247,81,0.3)',
      borderWidth: 1,
      titleColor: '#857568',
      bodyColor: '#f7f4ef',
      padding: 14,
      cornerRadius: 12,
      callbacks: {
        label: (ctx) => {
          const val = ctx.parsed
          const pct = total.value > 0 ? Math.round((val / total.value) * 100) : 0
          return `${ctx.label}: ${formatRupiah(val)} (${pct}%)`
        }
      }
    }
  }
}
</script>
