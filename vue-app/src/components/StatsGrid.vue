<template>
  <div class="stats-grid" v-if="data">
    <div class="stat-card stat-card--tanah">
      <div class="stat-icon">🏠</div>
      <div class="stat-info">
        <p class="stat-label">Tanah & Bangunan</p>
        <p class="stat-value">{{ formatRp(sumItems(data.tanah_bangunan)) }}</p>
        <p class="stat-count">{{ data.tanah_bangunan.length }} aset</p>
      </div>
    </div>
    <div class="stat-card stat-card--transportasi">
      <div class="stat-icon">🚗</div>
      <div class="stat-info">
        <p class="stat-label">Kendaraan</p>
        <p class="stat-value">{{ formatRp(sumItems(data.transportasi)) }}</p>
        <p class="stat-count">{{ data.transportasi.length }} unit</p>
      </div>
    </div>
    <div class="stat-card stat-card--kas">
      <div class="stat-icon">💰</div>
      <div class="stat-info">
        <p class="stat-label">Kas & Setara Kas</p>
        <p class="stat-value">{{ formatRp(sumItems(data.kas)) }}</p>
        <p class="stat-count">Di rekening</p>
      </div>
    </div>
    <div class="stat-card stat-card--bergerak">
      <div class="stat-icon">📦</div>
      <div class="stat-info">
        <p class="stat-label">Harta Bergerak</p>
        <p class="stat-value">{{ formatRp(sumItems(data.bergerak_lainnya)) }}</p>
        <p class="stat-count">Aset bergerak lainnya</p>
      </div>
    </div>
    <div class="stat-card stat-card--hutang">
      <div class="stat-icon">📉</div>
      <div class="stat-info">
        <p class="stat-label">Total Hutang</p>
        <p class="stat-value">{{ formatRp(sumItems(data.hutang)) }}</p>
        <p class="stat-count">Kewajiban</p>
      </div>
    </div>
    <div class="stat-card stat-card--laporan">
      <div class="stat-icon">📜</div>
      <div class="stat-info">
        <p class="stat-label">Total Laporan</p>
        <p class="stat-value">{{ totalLaporan }}x</p>
        <p class="stat-count">Sejak 2003</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRupiah, sumAssets } from '../utils/lhkpn.js'

const props = defineProps({ data: Object, totalLaporan: Number })

const formatRp = (v) => formatRupiah(v)
const sumItems = (items) => sumAssets(items)
</script>
