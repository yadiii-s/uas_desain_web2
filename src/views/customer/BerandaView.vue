<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Coffee, Croissant, CakeSlice, CupSoda, ArrowRight } from 'lucide-vue-next'
import { getProduk, formatRupiah } from '../../services/api.js'

const unggulan = ref([])
const loading = ref(true)
const error = ref('')

const FOTO_CADANGAN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle">Tanpa Foto</text></svg>',
  )

function fotoAman(e) {
  e.target.src = FOTO_CADANGAN
}

onMounted(async () => {
  try {
    const data = await getProduk()
    unggulan.value = data.slice(0, 6)
  } catch (e) {
    error.value = 'Gagal memuat produk unggulan. Coba muat ulang halaman.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <!-- Hero -->
  <section class="bg-gradient-to-br from-primary-50 to-white">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
      <div class="flex flex-col justify-center">
        <span
          class="w-fit rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700"
        >
          Reservasi tanpa antre
        </span>
        <h1 class="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Kopi hangat,
          <span class="text-primary-600">meja sudah siap</span>
          sebelum kamu tiba.
        </h1>
        <p class="mt-4 max-w-lg text-base leading-relaxed text-gray-600">
          Pilih menu favoritmu, masukkan ke keranjang, lalu isi nama dan nomor meja. Pesananmu
          langsung tercatat di dapur Kenangan Senja.
        </p>
        <div class="mt-7 flex flex-wrap gap-3">
          <RouterLink
            to="/menu"
            class="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Lihat Menu
          </RouterLink>
          <RouterLink
            to="/keranjang"
            class="rounded-xl border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Cek Keranjang
          </RouterLink>
        </div>
      </div>

      <div class="hidden items-center justify-center lg:flex">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex h-40 w-40 items-center justify-center rounded-2xl bg-primary-600">
            <Coffee class="h-16 w-16 text-white" :stroke-width="1.2" />
          </div>
          <div class="mt-8 flex h-40 w-40 items-center justify-center rounded-2xl bg-primary-100">
            <Croissant class="h-16 w-16 text-primary-700" :stroke-width="1.2" />
          </div>
          <div class="flex h-40 w-40 items-center justify-center rounded-2xl bg-primary-100">
            <CakeSlice class="h-16 w-16 text-primary-700" :stroke-width="1.2" />
          </div>
          <div class="mt-8 flex h-40 w-40 items-center justify-center rounded-2xl bg-primary-600">
            <CupSoda class="h-16 w-16 text-white" :stroke-width="1.2" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Produk unggulan -->
  <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Menu Unggulan</h2>
        <p class="mt-1 text-sm text-gray-500">Yang paling sering dipesan pelanggan kami.</p>
      </div>
      <RouterLink
        to="/menu"
        class="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
      >
        Lihat semua
        <ArrowRight class="h-4 w-4" />
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="animate-pulse rounded-2xl border border-gray-100 p-4">
        <div class="h-40 rounded-xl bg-gray-100"></div>
        <div class="mt-4 h-4 w-2/3 rounded bg-gray-100"></div>
        <div class="mt-2 h-4 w-1/3 rounded bg-gray-100"></div>
      </div>
    </div>

    <!-- Error -->
    <p v-else-if="error" class="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>

    <!-- Data -->
    <div v-else class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="produk in unggulan"
        :key="produk.id"
        to="/menu"
        class="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <img
          :src="produk.foto"
          :alt="produk.nama_produk"
          class="h-44 w-full bg-gray-50 object-cover"
          @error="fotoAman"
        />
        <div class="p-4">
          <span class="text-xs font-medium uppercase tracking-wide text-primary-600">
            {{ produk.kategori }}
          </span>
          <h3 class="mt-1 truncate font-semibold text-gray-900">{{ produk.nama_produk }}</h3>
          <p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ produk.deskripsi }}</p>
          <p class="mt-3 font-bold text-primary-700">{{ formatRupiah(produk.harga) }}</p>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
