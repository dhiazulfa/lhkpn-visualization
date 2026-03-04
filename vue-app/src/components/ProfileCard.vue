<template>
  <div class="profile-card" v-if="data">
    <div class="profile-avatar">
      <div class="avatar-ring">
        <div class="avatar-inner">
          <span class="avatar-icon">👨‍💼</span>
        </div>
      </div>
      <div class="profile-badge-jabatan">{{ data.jabatan }}</div>
    </div>
    <div class="profile-info">
      <h2 class="profile-name">{{ data.name }}</h2>
      <p class="profile-lembaga">{{ data.lembaga }}</p>
      <p class="profile-unit-kerja" v-if="data.unit_kerja">🏢 {{ data.unit_kerja }}</p>
      <div class="profile-meta">
        <div class="meta-item">
          <span class="meta-icon">📅</span>
          <span>Laporan terakhir: <strong>{{ data.tanggal_lapor }}</strong></span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">📋</span>
          <span>Jenis: <strong>{{ data.jenis_laporan }}</strong></span>
        </div>
      </div>
      <div class="profile-total-harta">
        <p class="total-label">Total Harta (Terbaru)</p>
        <p class="total-value">{{ data.total_harta }}</p>
        <p class="total-note">*Setelah dikurangi hutang</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ data: Object })
</script>
