<template>
  <div class="chart-wrapper">
    <Line :data="chartData" :options="chartOptions" />
  </div>
  <div class="chart-legend-custom">
    <div class="legend-item">
      <div class="legend-dot legend-dot--harta"></div>
      <span>Total Harta Bersih</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot legend-dot--hutang"></div>
      <span>Total Hutang</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { parseTotal, sumAssets } from '../utils/lhkpn.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({ data: Array })

const chartData = computed(() => ({
  labels: props.data.map(d => {
    const parts = d.tanggal_lapor.split(' ')
    return parts[2] + '\n' + (parts[1]?.slice(0,3) || '')
  }),
  datasets: [
    {
      label: 'Total Harta',
      data: props.data.map(d => parseTotal(d.total_harta)),
      borderColor: '#96d32e',
      backgroundColor: 'rgba(150,211,46,0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#96d32e',
      pointBorderColor: '#1a1410',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 9,
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Total Hutang',
      data: props.data.map(d => sumAssets(d.hutang)),
      borderColor: '#ff6b47',
      backgroundColor: 'rgba(255,107,71,0.06)',
      borderWidth: 2,
      borderDash: [6, 4],
      pointBackgroundColor: '#ff6b47',
      pointBorderColor: '#1a1410',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: { mode: 'index', intersect: false },
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
          const val = ctx.parsed.y
          if (val === null) return `${ctx.dataset.label}: Data tidak tersedia`
          return `${ctx.dataset.label}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(26,20,16,0.05)' },
      ticks: { color: '#857568', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
    },
    y: {
      grid: { color: 'rgba(26,20,16,0.05)' },
      ticks: {
        color: '#857568',
        font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
        maxTicksLimit: 6,
        callback: (v) => {
          const abs = Math.abs(v)
          if (abs >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + ' M'
          if (abs >= 1_000_000)     return (v / 1_000_000).toFixed(0) + ' jt'
          if (abs >= 1_000)         return (v / 1_000).toFixed(0) + ' rb'
          return v === 0 ? '0' : v
        }
      }
    }
  }
}
</script>
