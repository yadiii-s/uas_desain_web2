<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, UserRound } from 'lucide-vue-next'

const emit = defineEmits(['toggle-sidebar'])
const route = useRoute()

const judul = computed(() => {
  const petaJudul = {
    'admin-dashboard': 'Dashboard',
    'admin-produk': 'Kelola Produk',
    'admin-pesanan': 'Daftar Pesanan',
    'admin-pesanan-detail': 'Detail Pesanan',
  }
  return petaJudul[route.name] || 'Admin'
})
</script>

<template>
  <header class="sticky top-0 z-20 flex h-16 items-center gap-3 bg-white px-4 shadow-sm sm:px-6">
    <button
      type="button"
      class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
      aria-label="Buka sidebar"
      @click="emit('toggle-sidebar')"
    >
      <Menu class="h-6 w-6" />
    </button>

    <h1 class="text-base font-semibold text-gray-800 sm:text-lg">{{ judul }}</h1>

    <div class="ml-auto flex items-center gap-2">
      <span class="hidden text-sm text-gray-500 sm:block">Halo, Admin</span>
      <span
        class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700"
      >
        <UserRound class="h-5 w-5" />
      </span>
    </div>
  </header>
</template>
