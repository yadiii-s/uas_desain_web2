<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, SearchX, Plus } from 'lucide-vue-next'
import UserSidebar from '../../components/user/UserSidebar.vue'
import { getProduk, formatRupiah } from '../../services/api.js'
import { useCart } from '../../composables/useCart.js'

const { addItem } = useCart()

const produkList = ref([])
const loading = ref(true)
const error = ref('')
const keyword = ref('')
const kategoriAktif = ref('Semua')
const notifikasi = ref('')

let timerNotifikasi = null

const FOTO_CADANGAN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle">Tanpa Foto</text></svg>',
  )

function fotoAman(e) {
  e.target.src = FOTO_CADANGAN
}

const kategoriList = computed(() => {
  const unik = [...new Set(produkList.value.map((p) => p.kategori).filter(Boolean))]
  return ['Semua', ...unik.sort()]
})

const produkTersaring = computed(() => {
  const cari = keyword.value.trim().toLowerCase()
  return produkList.value.filter((p) => {
    const cocokKategori = kategoriAktif.value === 'Semua' || p.kategori === kategoriAktif.value
    const cocokNama =
      !cari ||
      String(p.nama_produk || '')
        .toLowerCase()
        .includes(cari)
    return cocokKategori && cocokNama
  })
})

function tambahKeKeranjang(produk) {
  addItem(produk, 1)
  notifikasi.value = `${produk.nama_produk} ditambahkan ke keranjang`
  clearTimeout(timerNotifikasi)
  timerNotifikasi = setTimeout(() => (notifikasi.value = ''), 2500)
}

async function muatProduk() {
  loading.value = true
  error.value = ''
  try {
    produkList.value = await getProduk()
  } catch (e) {
    error.value = 'Gagal memuat data menu. Periksa koneksi lalu coba lagi.'
  } finally {
    loading.value = false
  }
}

onMounted(muatProduk)
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Menu Kami</h1>
    <p class="mt-1 text-sm text-gray-500">Pilih menu, lalu tambahkan ke keranjang.</p>

    <!-- Search -->
    <div class="relative mt-6">
      <Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        v-model="keyword"
        type="search"
        placeholder="Cari nama menu..."
        class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
    </div>

    <div class="mt-6 flex flex-col gap-6 lg:flex-row">
      <UserSidebar v-model="kategoriAktif" :kategori-list="kategoriList" />

      <div class="flex-1">
        <!-- Loading -->
        <div v-if="loading" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="n in 6" :key="n" class="animate-pulse rounded-2xl border border-gray-100 p-4">
            <div class="h-40 rounded-xl bg-gray-100"></div>
            <div class="mt-4 h-4 w-2/3 rounded bg-gray-100"></div>
            <div class="mt-2 h-4 w-1/3 rounded bg-gray-100"></div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="rounded-xl bg-red-50 p-5 text-sm text-red-700">
          <p>{{ error }}</p>
          <button
            type="button"
            class="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            @click="muatProduk"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Kosong -->
        <div
          v-else-if="produkTersaring.length === 0"
          class="rounded-2xl border border-dashed border-gray-200 py-16 text-center"
        >
          <SearchX class="mx-auto h-12 w-12 text-gray-300" :stroke-width="1.4" />
          <p class="mt-3 font-semibold text-gray-700">Menu tidak ditemukan</p>
          <p class="mt-1 text-sm text-gray-500">
            Coba kata kunci lain atau pilih kategori "Semua".
          </p>
        </div>

        <!-- Grid produk -->
        <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="produk in produkTersaring"
            :key="produk.id"
            class="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
          >
            <img
              :src="produk.foto"
              :alt="produk.nama_produk"
              class="h-44 w-full bg-gray-50 object-cover"
              @error="fotoAman"
            />
            <div class="flex flex-1 flex-col p-4">
              <span class="text-xs font-medium uppercase tracking-wide text-primary-600">
                {{ produk.kategori }}
              </span>
              <h3 class="mt-1 font-semibold text-gray-900">{{ produk.nama_produk }}</h3>
              <p class="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">{{ produk.deskripsi }}</p>
              <div class="mt-4 flex items-center justify-between gap-2">
                <span class="font-bold text-primary-700">{{ formatRupiah(produk.harga) }}</span>
                <button
                  type="button"
                  class="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
                  @click="tambahKeKeranjang(produk)"
                >
                  <Plus class="h-4 w-4" />
                  Keranjang
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="notifikasi"
      class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      {{ notifikasi }}
    </div>
  </div>
</template>
