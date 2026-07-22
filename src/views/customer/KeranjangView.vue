<script setup>
import { RouterLink } from 'vue-router'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-vue-next'
import { useCart } from '../../composables/useCart.js'
import { formatRupiah } from '../../services/api.js'

const { items, removeItem, updateQty, clearCart, totalItems, totalHarga } = useCart()

const FOTO_CADANGAN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="52%" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">Tanpa Foto</text></svg>',
  )

function fotoAman(e) {
  e.target.src = FOTO_CADANGAN
}

function kosongkan() {
  if (confirm('Kosongkan seluruh keranjang?')) clearCart()
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Keranjang</h1>
    <p class="mt-1 text-sm text-gray-500">
      {{ totalItems }} item siap dipesan. Periksa dulu sebelum lanjut checkout.
    </p>

    <!-- Keranjang kosong -->
    <div
      v-if="items.length === 0"
      class="mt-8 rounded-2xl border border-dashed border-gray-200 py-16 text-center"
    >
      <ShoppingCart class="mx-auto h-14 w-14 text-gray-300" :stroke-width="1.2" />
      <p class="mt-4 font-semibold text-gray-700">Keranjang masih kosong</p>
      <p class="mt-1 text-sm text-gray-500">Yuk pilih menu favoritmu dulu.</p>
      <RouterLink
        to="/menu"
        class="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        Lihat Menu
      </RouterLink>
    </div>

    <div v-else class="mt-8 grid gap-6 lg:grid-cols-3">
      <!-- Daftar item -->
      <div class="space-y-4 lg:col-span-2">
        <article
          v-for="item in items"
          :key="item.produkId"
          class="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <img
            :src="item.foto"
            :alt="item.namaProduk"
            class="h-20 w-20 shrink-0 rounded-xl bg-gray-50 object-cover sm:h-24 sm:w-24"
            @error="fotoAman"
          />

          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate font-semibold text-gray-900">{{ item.namaProduk }}</h3>
                <p class="mt-0.5 text-xs text-gray-500">{{ item.kategori }}</p>
                <p class="mt-1 text-sm text-gray-600">
                  {{ formatRupiah(item.hargaSatuan) }} / item
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Hapus item"
                @click="removeItem(item.produkId)"
              >
                <Trash2 class="h-5 w-5" />
              </button>
            </div>

            <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center rounded-lg border border-gray-200">
                <button
                  type="button"
                  class="px-3 py-2 text-gray-600 transition hover:bg-gray-50"
                  aria-label="Kurangi"
                  @click="updateQty(item.produkId, item.jumlah - 1)"
                >
                  <Minus class="h-4 w-4" />
                </button>
                <span class="w-10 text-center text-sm font-semibold">{{ item.jumlah }}</span>
                <button
                  type="button"
                  class="px-3 py-2 text-gray-600 transition hover:bg-gray-50"
                  aria-label="Tambah"
                  @click="updateQty(item.produkId, item.jumlah + 1)"
                >
                  <Plus class="h-4 w-4" />
                </button>
              </div>
              <span class="font-bold text-primary-700">
                {{ formatRupiah(item.hargaSatuan * item.jumlah) }}
              </span>
            </div>
          </div>
        </article>

        <button
          type="button"
          class="text-sm font-medium text-gray-500 transition hover:text-red-600"
          @click="kosongkan"
        >
          Kosongkan keranjang
        </button>
      </div>

      <!-- Ringkasan -->
      <aside class="lg:col-span-1">
        <div class="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 class="font-semibold text-gray-900">Ringkasan</h2>
          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <dt>Jumlah item</dt>
              <dd>{{ totalItems }}</dd>
            </div>
            <div class="flex justify-between text-gray-600">
              <dt>Jenis menu</dt>
              <dd>{{ items.length }}</dd>
            </div>
          </dl>
          <div class="mt-4 flex justify-between border-t border-gray-100 pt-4">
            <span class="font-semibold text-gray-900">Total</span>
            <span class="text-lg font-bold text-primary-700">{{ formatRupiah(totalHarga) }}</span>
          </div>

          <RouterLink
            to="/checkout"
            class="mt-5 block rounded-xl bg-primary-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Lanjut ke Checkout
          </RouterLink>
          <RouterLink
            to="/menu"
            class="mt-2 block rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Tambah Menu Lain
          </RouterLink>
        </div>
      </aside>
    </div>
  </div>
</template>
