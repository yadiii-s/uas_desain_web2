<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Receipt, RefreshCw } from 'lucide-vue-next'
import {
  getDetailPesanan,
  kelompokkanPesanan,
  formatRupiah,
  formatTanggal,
} from '../../services/api.js'

const router = useRouter()

const detailList = ref([])
const loading = ref(true)
const error = ref('')
const keyword = ref('')
const filterStatus = ref('Semua')

const DAFTAR_STATUS = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Dibatalkan']

const warnaStatus = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Diproses: 'bg-blue-100 text-blue-700',
  Selesai: 'bg-primary-100 text-primary-700',
  Dibatalkan: 'bg-red-100 text-red-700',
}

const semuaPesanan = computed(() => kelompokkanPesanan(detailList.value))

const pesananTersaring = computed(() => {
  const cari = keyword.value.trim().toLowerCase()
  return semuaPesanan.value.filter((p) => {
    const cocokStatus = filterStatus.value === 'Semua' || p.status === filterStatus.value
    const cocokCari =
      !cari ||
      String(p.namaPemesan || '')
        .toLowerCase()
        .includes(cari) ||
      String(p.noMeja || '')
        .toLowerCase()
        .includes(cari) ||
      String(p.idPesanan || '')
        .toLowerCase()
        .includes(cari)
    return cocokStatus && cocokCari
  })
})

function jumlahPerStatus(status) {
  if (status === 'Semua') return semuaPesanan.value.length
  return semuaPesanan.value.filter((p) => p.status === status).length
}

function bukaDetail(idPesanan) {
  router.push(`/admin/pesanan/${idPesanan}`)
}

async function muatPesanan() {
  loading.value = true
  error.value = ''
  try {
    detailList.value = await getDetailPesanan()
  } catch (e) {
    // MockAPI membalas 404 kalau resource masih kosong — perlakukan sebagai "belum ada pesanan".
    if (e?.response?.status === 404) {
      detailList.value = []
    } else {
      error.value = 'Gagal memuat data pesanan.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(muatPesanan)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">Daftar Pesanan</h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ semuaPesanan.length }} transaksi masuk. Klik satu baris untuk melihat detail.
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        @click="muatPesanan"
      >
        <RefreshCw class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
        Refresh
      </button>
    </div>

    <!-- Filter -->
    <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        v-model="keyword"
        type="search"
        placeholder="Cari nama pemesan, no. meja, atau kode pesanan..."
        class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 sm:max-w-sm"
      />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in DAFTAR_STATUS"
          :key="status"
          type="button"
          class="rounded-full px-3 py-1.5 text-xs font-semibold transition"
          :class="
            filterStatus === status
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
          "
          @click="filterStatus = status"
        >
          {{ status }} ({{ jumlahPerStatus(status) }})
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>

    <!-- Loading -->
    <div v-if="loading" class="mt-5 space-y-3">
      <div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-xl bg-white"></div>
    </div>

    <!-- Kosong -->
    <div
      v-else-if="pesananTersaring.length === 0"
      class="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center"
    >
      <Receipt class="mx-auto h-12 w-12 text-gray-300" :stroke-width="1.4" />
      <p class="mt-3 font-semibold text-gray-700">Belum ada pesanan</p>
      <p class="mt-1 text-sm text-gray-500">
        Pesanan dari halaman customer akan muncul otomatis di sini.
      </p>
    </div>

    <template v-else>
      <!-- Tabel: desktop -->
      <div
        class="mt-5 hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-5 py-3">Kode</th>
              <th class="px-5 py-3">Pemesan</th>
              <th class="px-5 py-3">Meja</th>
              <th class="px-5 py-3">Item</th>
              <th class="px-5 py-3">Total</th>
              <th class="px-5 py-3">Tanggal</th>
              <th class="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="pesanan in pesananTersaring"
              :key="pesanan.idPesanan"
              class="cursor-pointer transition hover:bg-gray-50"
              @click="bukaDetail(pesanan.idPesanan)"
            >
              <td class="px-5 py-3 font-mono text-xs text-gray-500">{{ pesanan.idPesanan }}</td>
              <td class="px-5 py-3 font-medium text-gray-900">{{ pesanan.namaPemesan }}</td>
              <td class="px-5 py-3 text-gray-600">{{ pesanan.noMeja }}</td>
              <td class="px-5 py-3 text-gray-600">{{ pesanan.totalItem }}</td>
              <td class="px-5 py-3 font-semibold text-gray-700">
                {{ formatRupiah(pesanan.totalHarga) }}
              </td>
              <td class="px-5 py-3 text-gray-500">{{ formatTanggal(pesanan.tanggal) }}</td>
              <td class="px-5 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="warnaStatus[pesanan.status] || 'bg-gray-100 text-gray-600'"
                >
                  {{ pesanan.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card list: mobile -->
      <div class="mt-5 space-y-3 md:hidden">
        <article
          v-for="pesanan in pesananTersaring"
          :key="pesanan.idPesanan"
          class="cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition active:bg-gray-50"
          @click="bukaDetail(pesanan.idPesanan)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="truncate font-semibold text-gray-900">{{ pesanan.namaPemesan }}</h3>
              <p class="mt-0.5 text-xs text-gray-500">Meja {{ pesanan.noMeja }}</p>
            </div>
            <span
              class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="warnaStatus[pesanan.status] || 'bg-gray-100 text-gray-600'"
            >
              {{ pesanan.status }}
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ pesanan.totalItem }} item</span>
            <span class="font-semibold text-gray-700">{{ formatRupiah(pesanan.totalHarga) }}</span>
          </div>
          <p class="mt-2 text-xs text-gray-400">{{ formatTanggal(pesanan.tanggal) }}</p>
        </article>
      </div>
    </template>
  </div>
</template>
