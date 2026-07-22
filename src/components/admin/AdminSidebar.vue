<script setup>
import { RouterLink } from 'vue-router'
import { Coffee, LayoutDashboard, Package, Receipt, ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  terbuka: { type: Boolean, default: false },
})
const emit = defineEmits(['tutup'])

const menu = [
  { nama: 'Dashboard', to: '/admin/dashboard', ikon: LayoutDashboard },
  { nama: 'Produk', to: '/admin/produk', ikon: Package },
  { nama: 'Pesanan', to: '/admin/pesanan', ikon: Receipt },
]
</script>

<template>
  <!-- Overlay gelap saat sidebar off-canvas terbuka di mobile -->
  <div
    v-if="props.terbuka"
    class="fixed inset-0 z-30 bg-black/40 lg:hidden"
    @click="emit('tutup')"
  ></div>

  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 text-gray-300 transition-transform duration-200 lg:translate-x-0"
    :class="props.terbuka ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-16 items-center gap-2 border-b border-gray-800 px-5">
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
        <Coffee class="h-4 w-4" />
      </span>
      <span class="font-bold text-white">Admin Panel</span>
    </div>

    <nav class="space-y-1 p-4">
      <RouterLink
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-gray-800 hover:text-white"
        active-class="bg-primary-600 text-white hover:bg-primary-600"
        @click="emit('tutup')"
      >
        <component :is="item.ikon" class="h-5 w-5" />
        {{ item.nama }}
      </RouterLink>
    </nav>

    <div class="absolute inset-x-0 bottom-0 border-t border-gray-800 p-4">
      <RouterLink
        to="/"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
      >
        <ArrowLeft class="h-4 w-4" />
        Kembali ke sisi customer
      </RouterLink>
    </div>
  </aside>
</template>
