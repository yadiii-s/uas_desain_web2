<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Package, Receipt, Clock, Wallet, RefreshCw, ArrowRight } from 'lucide-vue-next'
import {
  getProduk,
  getDetailPesanan,
  kelompokkanPesanan,
  formatRupiah,
  formatTanggal,
} from '../../services/api.js'

const produkList = ref([])
const detailList = ref([])
const loading = ref(true)
const error = ref('')

const pesananList = computed(() => kelompokkanPesanan(detailList.value))

const totalPendapatan = computed(() =>
  pesananList.value
    .filter((p) => p.status !== 'Dibatalkan')
    .reduce((acc, p) => acc + p.totalHarga, 0),
)

const jumlahMenunggu = computed(
  () => pesananList.value.filter((p) => p.status === 'Menunggu').length,
)

const pesananTerbaru = computed(() => pesananList.value.slice(0, 5))

const statistik = computed(() => [
  {
    label: 'Total Produk',
    nilai: produkList.value.length,
    ikon: Package,
    warna: 'bg-blue-50 text-blue-700',
    to: '/admin/produk',
  },
  {
    label: 'Total Pesanan',
    nilai: pesananList.value.length,
    ikon: Receipt,
    warna: 'bg-primary-50 text-primary-700',
    to: '/admin/pesanan',
  },
  {
    label: 'Pesanan Menunggu',
    nilai: jumlahMenunggu.value,
    ikon: Clock,
    warna: 'bg-amber-50 text-amber-700',
    to: '/admin/pesanan',
  },
  {
    label: 'Nilai Pesanan',
    nilai: formatRupiah(totalPendapatan.value),
    ikon: Wallet,
    warna: 'bg-purple-50 text-purple-700',
    to: '/admin/pesanan',
  },
])

const warnaStatus = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Diproses: 'bg-blue-100 text-blue-700',
  Selesai: 'bg-primary-100 text-primary-700',
  Dibatalkan: 'bg-red-100 text-red-700',
}

async function muatData() {
  loading.value = true
  error.value = ''
  try {
    const [produk, detail] = await Promise.all([
      getProduk(),
      // Resource kosong bisa membalas 404 di MockAPI — anggap saja belum ada pesanan.
      getDetailPesanan().catch(() => []),
    ])
    produkList.value = produk
    detailList.value = detail
  } catch (e) {
    error.value = 'Gagal memuat data dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(muatData)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">Ringkasan</h1>
        <p class="mt-1 text-sm text-gray-500">Pantau produk dan pesanan yang masuk.</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        @click="muatData"
      >
        <RefreshCw class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
        Refresh
      </button>
    </div>

    <p v-if="error" class="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>

    <!-- Kartu statistik -->
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="loading">
        <div
          v-for="n in 4"
          :key="n"
          class="h-28 animate-pulse rounded-2xl border border-gray-100 bg-white"
        ></div>
      </template>
      <template v-else>
        <RouterLink
          v-for="stat in statistik"
          :key="stat.label"
          :to="stat.to"
          class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl" :class="stat.warna">
              <component :is="stat.ikon" class="h-5 w-5" />
            </span>
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase tracking-wide text-gray-400">
                {{ stat.label }}
              </p>
              <p class="mt-0.5 truncate text-xl font-bold text-gray-900">{{ stat.nilai }}</p>
            </div>
          </div>
        </RouterLink>
      </template>
    </div>

    <!-- Pesanan terbaru -->
    <section class="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 class="font-semibold text-gray-900">Pesanan Terbaru</h2>
        <RouterLink
          to="/admin/pesanan"
          class="flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          Lihat semua
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </div>

      <div v-if="loading" class="space-y-3 p-5">
        <div v-for="n in 3" :key="n" class="h-12 animate-pulse rounded-lg bg-gray-100"></div>
      </div>

      <p v-else-if="pesananTerbaru.length === 0" class="p-8 text-center text-sm text-gray-500">
        Belum ada pesanan masuk.
      </p>

      <ul v-else class="divide-y divide-gray-100">
        <li v-for="pesanan in pesananTerbaru" :key="pesanan.idPesanan">
          <RouterLink
            :to="`/admin/pesanan/${pesanan.idPesanan}`"
            class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-gray-50"
          >
            <div class="min-w-0">
              <p class="truncate font-medium text-gray-900">{{ pesanan.namaPemesan }}</p>
              <p class="mt-0.5 text-xs text-gray-500">
                Meja {{ pesanan.noMeja }} · {{ formatTanggal(pesanan.tanggal) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-gray-700">
                {{ formatRupiah(pesanan.totalHarga) }}
              </span>
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="warnaStatus[pesanan.status] || 'bg-gray-100 text-gray-600'"
              >
                {{ pesanan.status }}
              </span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
