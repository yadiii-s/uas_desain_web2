<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Coffee, ShoppingCart, Menu, X } from 'lucide-vue-next'
import { useCart } from '../../composables/useCart.js'

const { totalItems } = useCart()
const menuTerbuka = ref(false)

const navigasi = [
  { nama: 'Beranda', to: '/' },
  { nama: 'Menu', to: '/menu' },
  { nama: 'Keranjang', to: '/keranjang' },
]
</script>

<template>
  <header class="sticky top-0 z-40 bg-white shadow-sm">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2" @click="menuTerbuka = false">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white"
        >
          <Coffee class="h-5 w-5" />
        </span>
        <span class="text-base font-bold text-gray-800 sm:text-lg">Kenangan Senja</span>
      </RouterLink>

      <!-- Menu desktop -->
      <div class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="item in navigasi"
          :key="item.to"
          :to="item.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-primary-50 hover:text-primary-700"
          active-class="bg-primary-50 text-primary-700"
        >
          {{ item.nama }}
        </RouterLink>
      </div>

      <div class="flex items-center gap-2">
        <!-- Ikon keranjang + badge -->
        <RouterLink
          to="/keranjang"
          class="relative rounded-lg p-2 text-gray-600 transition hover:bg-primary-50 hover:text-primary-700"
          aria-label="Keranjang"
          @click="menuTerbuka = false"
        >
          <ShoppingCart class="h-6 w-6" />
          <span
            v-if="totalItems > 0"
            class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white"
          >
            {{ totalItems }}
          </span>
        </RouterLink>

        <!-- Hamburger mobile -->
        <button
          type="button"
          class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
          aria-label="Buka menu"
          @click="menuTerbuka = !menuTerbuka"
        >
          <Menu v-if="!menuTerbuka" class="h-6 w-6" />
          <X v-else class="h-6 w-6" />
        </button>
      </div>
    </nav>

    <!-- Dropdown mobile -->
    <div v-if="menuTerbuka" class="border-t border-gray-100 bg-white md:hidden">
      <div class="space-y-1 px-4 py-3">
        <RouterLink
          v-for="item in navigasi"
          :key="item.to"
          :to="item.to"
          class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-700"
          active-class="bg-primary-50 text-primary-700"
          @click="menuTerbuka = false"
        >
          {{ item.nama }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>
