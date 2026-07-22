<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, SearchX } from 'lucide-vue-next'
import {
  getDetailPesanan,
  updateDetailPesanan,
  formatRupiah,
  formatTanggal,
  toNumber,
} from '../../services/api.js'

const route = useRoute()
const idPesanan = String(route.params.idPesanan)

const items = ref([])
const loading = ref(true)
const error = ref('')
const menyimpan = ref(false)
const notifikasi = ref('')

const DAFTAR_STATUS = ['Menunggu', 'Diproses', 'Selesai', 'Dibatalkan']

const warnaStatus = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Diproses: 'bg-blue-100 text-blue-700',
  Selesai: 'bg-primary-100 text-primary-700',
  Dibatalkan: 'bg-red-100 text-red-700',
}

const info = computed(() => items.value[0] || null)
const totalItem = computed(() => items.value.reduce((acc, i) => acc + toNumber(i.jumlah), 0))
const totalHarga = computed(() => items.value.reduce((acc, i) => acc + toNumber(i.subtotal), 0))

async function muatDetail() {
  loading.value = true
  error.value = ''
  try {
    const semua = await getDetailPesanan()
    items.value = semua.filter((d) => String(d.idPesanan) === idPesanan)
  } catch (e) {
    if (e?.response?.status === 404) items.value = []
    else error.value = 'Gagal memuat detail pesanan.'
  } finally {
    loading.value = false
  }
}

/** Status disimpan per baris, jadi semua baris dengan idPesanan ini ikut diperbarui. */
async function ubahStatus(statusBaru) {
  if (!info.value || statusBaru === info.value.status || menyimpan.value) return

  menyimpan.value = true
  error.value = ''
  try {
    for (const item of items.value) {
      await updateDetailPesanan(item.id, { ...item, status: statusBaru })
    }
    items.value = items.value.map((item) => ({ ...item, status: statusBaru }))
    notifikasi.value = `Status pesanan diubah menjadi "${statusBaru}"`
    setTimeout(() => (notifikasi.value = ''), 2500)
  } catch (e) {
    error.value = 'Gagal mengubah status pesanan. Coba lagi.'
  } finally {
    menyimpan.value = false
  }
}

onMounted(muatDetail)
</script>

<template>
  <div>
    <RouterLink
      to="/admin/pesanan"
      class="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-primary-700"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali ke daftar pesanan
    </RouterLink>

    <!-- Loading -->
    <div v-if="loading" class="mt-5 space-y-3">
      <div class="h-28 animate-pulse rounded-2xl bg-white"></div>
      <div class="h-56 animate-pulse rounded-2xl bg-white"></div>
    </div>

    <template v-else>
      <p v-if="error" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>

      <!-- Tidak ditemukan -->
      <div
        v-if="!info"
        class="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center"
      >
        <SearchX class="mx-auto h-12 w-12 text-gray-300" :stroke-width="1.4" />
        <p class="mt-3 font-semibold text-gray-700">Pesanan tidak ditemukan</p>
        <p class="mt-1 text-sm text-gray-500">
          Kode <span class="font-mono">{{ idPesanan }}</span> tidak ada di data.
        </p>
      </div>

      <template v-else>
        <!-- Info pemesan -->
        <section class="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-400">Kode Pesanan</p>
              <p class="font-mono text-sm text-gray-600">{{ info.idPesanan }}</p>
              <h1 class="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
                {{ info.namaPemesan }}
              </h1>
              <p class="mt-1 text-sm text-gray-500">
                Meja {{ info.noMeja }} · {{ formatTanggal(info.tanggal) }}
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1.5 text-sm font-semibold"
              :class="warnaStatus[info.status] || 'bg-gray-100 text-gray-600'"
            >
              {{ info.status }}
            </span>
          </div>

          <p v-if="info.catatan" class="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            <span class="font-medium text-gray-700">Catatan:</span> {{ info.catatan }}
          </p>

          <!-- Ubah status -->
          <div class="mt-5 border-t border-gray-100 pt-4">
            <p class="text-sm font-medium text-gray-700">Ubah status pesanan</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="status in DAFTAR_STATUS"
                :key="status"
                type="button"
                :disabled="menyimpan"
                class="rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                :class="
                  info.status === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                "
                @click="ubahStatus(status)"
              >
                {{ status }}
              </button>
            </div>
            <p v-if="menyimpan" class="mt-3 text-xs text-gray-500">Menyimpan perubahan...</p>
          </div>
        </section>

        <!-- Daftar item -->
        <section class="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <h2 class="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">
            Item Pesanan ({{ items.length }} menu)
          </h2>

          <!-- Tabel: desktop -->
          <table class="hidden w-full text-left text-sm md:table">
            <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-5 py-3">Menu</th>
                <th class="px-5 py-3">Harga Satuan</th>
                <th class="px-5 py-3">Qty</th>
                <th class="px-5 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id">
                <td class="px-5 py-3 font-medium text-gray-900">{{ item.namaProduk }}</td>
                <td class="px-5 py-3 text-gray-600">{{ formatRupiah(item.hargaSatuan) }}</td>
                <td class="px-5 py-3 text-gray-600">{{ item.jumlah }}</td>
                <td class="px-5 py-3 text-right font-semibold text-gray-700">
                  {{ formatRupiah(item.subtotal) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="border-t border-gray-200 bg-gray-50">
              <tr>
                <td class="px-5 py-3 font-semibold text-gray-900" colspan="2">Total</td>
                <td class="px-5 py-3 font-semibold text-gray-700">{{ totalItem }}</td>
                <td class="px-5 py-3 text-right text-base font-bold text-primary-700">
                  {{ formatRupiah(totalHarga) }}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- Card list: mobile -->
          <div class="divide-y divide-gray-100 md:hidden">
            <div v-for="item in items" :key="item.id" class="flex justify-between gap-3 px-5 py-4">
              <div class="min-w-0">
                <p class="truncate font-medium text-gray-900">{{ item.namaProduk }}</p>
                <p class="mt-0.5 text-xs text-gray-500">
                  {{ item.jumlah }} × {{ formatRupiah(item.hargaSatuan) }}
                </p>
              </div>
              <span class="shrink-0 font-semibold text-gray-700">
                {{ formatRupiah(item.subtotal) }}
              </span>
            </div>
            <div class="flex justify-between bg-gray-50 px-5 py-4">
              <span class="font-semibold text-gray-900">Total ({{ totalItem }} item)</span>
              <span class="font-bold text-primary-700">{{ formatRupiah(totalHarga) }}</span>
            </div>
          </div>
        </section>
      </template>
    </template>

    <!-- Toast -->
    <div
      v-if="notifikasi"
      class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      {{ notifikasi }}
    </div>
  </div>
</template>
