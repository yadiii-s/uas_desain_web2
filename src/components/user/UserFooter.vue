<script setup>
import { RouterLink } from 'vue-router'
import { Coffee } from 'lucide-vue-next'

const tahun = new Date().getFullYear()
</script>

<template>
  <footer class="mt-12 border-t border-gray-100 bg-gray-50">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div class="flex items-center gap-2">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white"
            >
              <Coffee class="h-4 w-4" />
            </span>
            <span class="font-bold text-gray-800">Kenangan Senja</span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-gray-500">
            Pesan menu favoritmu dan reservasi meja tanpa antre. Cukup pilih, isi nomor meja, dan
            pesananmu langsung masuk ke dapur kami.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-800">Navigasi</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-500">
            <li><RouterLink to="/" class="hover:text-primary-700">Beranda</RouterLink></li>
            <li><RouterLink to="/menu" class="hover:text-primary-700">Menu</RouterLink></li>
            <li>
              <RouterLink to="/keranjang" class="hover:text-primary-700">Keranjang</RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-800">Jam Buka</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-500">
            <li>Senin – Jumat: 08.00 – 22.00</li>
            <li>Sabtu – Minggu: 09.00 – 23.00</li>
            <li>Jl. Melati No. 12, Makassar</li>
          </ul>
        </div>
      </div>

      <p class="mt-8 border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
        © {{ tahun }} Kenangan Senja. Dibuat untuk praktikum Vue 3.
      </p>
    </div>
  </footer>
</template>
