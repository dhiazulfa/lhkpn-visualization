# 💼 LHKPN Wonogiri — Visualisasi Harta Pejabat

> Visualisasi interaktif data Laporan Harta Kekayaan Penyelenggara Negara (LHKPN) Kabupaten Wonogiri, bersumber dari [elhkpn.kpk.go.id](https://elhkpn.kpk.go.id).

[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff?logo=vite)](https://vitejs.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-ff6384?logo=chart.js)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📸 Tampilan

| Halaman Utama | Detail Pejabat |
|---|---|
| Daftar pejabat dengan kartu interaktif, pencarian, dan filter jabatan | Riwayat harta, grafik pertumbuhan, dan breakdown aset per kategori |

---

## ✨ Fitur

- 🔍 **Pencarian & Filter** — Cari pejabat berdasarkan nama; filter berdasarkan jabatan
- 📊 **Visualisasi Grafik** — Grafik pertumbuhan harta dari waktu ke waktu menggunakan Chart.js
- 🗂️ **Detail Aset** — Breakdown aset: tanah & bangunan, transportasi, surat berharga, kas, dll.
- 📋 **Riwayat Laporan** — Tampilkan semua laporan LHKPN yang pernah dibuat seorang pejabat
- 📄 **Pagination** — Menampilkan 9 pejabat per halaman dengan navigasi halaman yang rapi
- 🧩 **Clustering Cerdas** — Algoritma fingerprinting untuk menggabungkan laporan dari orang yang sama meski ada variasi entri data
- ⚠️ **Disclaimer** — Modal disclaimer pada kunjungan pertama dan banner informasi di halaman utama
- 📱 **Responsif** — Tampil optimal di desktop maupun ponsel

---

## 🛠️ Tech Stack

| Teknologi | Versi | Peran |
|---|---|---|
| [Vue 3](https://vuejs.org/) | ^3.5 | Framework UI utama (Composition API) |
| [Vite](https://vitejs.dev/) | ^7.3 | Build tool & dev server |
| [Vue Router](https://router.vuejs.org/) | ^4.6 | Routing SPA |
| [Chart.js](https://www.chartjs.org/) | ^4.5 | Visualisasi grafik |
| [vue-chartjs](https://vue-chartjs.org/) | ^5.3 | Wrapper Chart.js untuk Vue |
| Vanilla CSS | — | Styling kustom (light mode Gen Z aesthetic) |

---

## 📂 Struktur Project

```
lhkpn-visualization/
├── vue-app/                  # Aplikasi Vue utama
│   ├── public/
│   │   └── lhkpn_results.json   # Data LHKPN (sumber data)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppFooter.vue     # Footer aplikasi
│   │   │   ├── AssetDetail.vue   # Komponen detail aset (tanah, kendaraan, dll.)
│   │   │   ├── DonutChart.vue    # Grafik donut komposisi harta
│   │   │   ├── HartaChart.vue    # Grafik garis pertumbuhan harta
│   │   │   ├── ProfileCard.vue   # Kartu profil pejabat
│   │   │   ├── StatsGrid.vue     # Grid statistik ringkasan
│   │   │   └── TimelineList.vue  # Timeline riwayat laporan
│   │   ├── views/
│   │   │   ├── HomeView.vue      # Halaman utama (daftar pejabat)
│   │   │   └── OfficialView.vue  # Halaman detail satu pejabat
│   │   ├── utils/
│   │   │   └── lhkpn.js          # Fungsi utilitas (format rupiah, clustering, dll.)
│   │   ├── router/
│   │   │   └── index.js          # Definisi routing
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css             # Stylesheet global
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── index.html                # Versi statis (legacy)
├── lhkpn_results.json        # Data LHKPN (legacy)
└── package.json              # Script root (proxy ke vue-app)
```

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm (sudah termasuk bersama Node.js)

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/dhiazulfa/lhkpn-visualization.git
cd lhkpn-visualization

# 2. Install dependensi
cd vue-app
npm install

# 3. Jalankan development server
npm run dev
```

Atau dari direktori root:

```bash
npm run dev
```

Buka browser dan akses `http://localhost:5173`.

### Build untuk Produksi

```bash
# Dari root
npm run build

# Preview hasil build
npm run preview
```

---

## 📊 Format Data

Data disimpan di `vue-app/public/lhkpn_results.json` sebagai array of objects dengan struktur berikut:

```json
{
  "name": "NAMA PEJABAT",
  "jabatan": "BUPATI",
  "lembaga": "PEMERINTAH KABUPATEN WONOGIRI",
  "unit_kerja": "...",
  "tanggal_lapor": "1 Januari 2023",
  "total_harta": "Rp.1.950.348.502",
  "tanah_bangunan": [
    { "description": "Tanah - Wonogiri", "value": "500.000.000" }
  ],
  "transportasi": [
    { "description": "Mobil Toyota Avanza 2019", "value": "150.000.000" }
  ],
  "surat_berharga": [...],
  "kas_setara_kas": [...],
  "harta_lainnya": [...]
}
```

---

## 🧠 Algoritma Clustering

Satu orang bisa memiliki beberapa entri data (laporan dari tahun berbeda) dan terkadang nama yang persis sama bisa dimiliki oleh dua orang yang berbeda. Untuk menangani ini, aplikasi menggunakan algoritma **fingerprinting berbasis aset**:

- Setiap record diberi *fingerprint* berdasarkan deskripsi **tanah/bangunan** dan **transportasi** yang dimiliki.
- Dua record dianggap milik **orang yang sama** jika:
  1. Berbagi ≥ 1 deskripsi tanah/bangunan yang persis sama, **ATAU**
  2. Berbagi ≥ 2 deskripsi kendaraan yang persis sama (minimal 2 untuk menghindari false-positive dari kendaraan umum seperti "Honda Vario").
- Record diproses secara kronologis dan di-*cluster* secara iteratif.

Lihat implementasi lengkap di [`src/utils/lhkpn.js`](vue-app/src/utils/lhkpn.js).

---

## ⚠️ Disclaimer

Data yang ditampilkan di situs ini bersumber dari [elhkpn.kpk.go.id](https://elhkpn.kpk.go.id) (sistem e-LHKPN milik KPK RI).

- **Data mungkin tidak selengkap** atau tidak se-mutakhir situs resmi KPK.
- Situs ini **tidak berafiliasi** dengan KPK RI, Pemkab Wonogiri, maupun instansi pemerintah lainnya.
- Informasi disajikan semata-mata untuk kepentingan **edukasi & transparansi publik**.
- **Tidak dimaksudkan** sebagai tuduhan, opini, atau penilaian hukum terhadap pihak mana pun.

Untuk data resmi dan terlengkap, kunjungi langsung [elhkpn.kpk.go.id](https://elhkpn.kpk.go.id).

---

## 🤝 Kontribusi

Pull request sangat disambut! Untuk perubahan besar, harap buka *issue* terlebih dahulu untuk mendiskusikan apa yang ingin diubah.

---

## 📄 Lisensi

[MIT](LICENSE) © 2026 [key8ice](https://github.com/dhiazulfa)
