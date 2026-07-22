<script setup>
import { ref, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { CircleCheckBig, ShoppingCart } from 'lucide-vue-next'
import { createDetailPesanan, formatRupiah } from '../../services/api.js'
import { useCart } from '../../composables/useCart.js'

const router = useRouter()
const { items, clearCart, totalItems, totalHarga } = useCart()

const form = reactive({
  namaPemesan: '',
  noMeja: '',
  catatan: '',
})

const errors = reactive({ namaPemesan: '', noMeja: '' })
const submitting = ref(false)
const errorSubmit = ref('')
const sukses = ref(false)
const idPesananSukses = ref('')

function validasi() {
  errors.namaPemesan = form.namaPemesan.trim() ? '' : 'Nama pemesan wajib diisi'
  errors.noMeja = form.noMeja.trim() ? '' : 'Nomor meja wajib diisi'
  return !errors.namaPemesan && !errors.noMeja
}

async function submitPesanan() {
  errorSubmit.value = ''
  if (!validasi() || items.length === 0) return

  submitting.value = true
  const idPesanan = String(Date.now())
  const tanggal = new Date().toISOString()

  try {
    // Satu baris DetailPesanan per item — disatukan oleh idPesanan yang sama.
    // POST dikirim berurutan (bukan Promise.all): MockAPI memberi id yang sama
    // untuk request yang masuk bersamaan, dan id kembar bikin update status gagal.
    for (const item of items) {
      await createDetailPesanan({
        idPesanan,
        namaPemesan: form.namaPemesan.trim(),
        noMeja: form.noMeja.trim(),
        produkId: item.produkId,
        namaProduk: item.namaProduk,
        hargaSatuan: item.hargaSatuan,
        jumlah: item.jumlah,
        subtotal: item.hargaSatuan * item.jumlah,
        catatan: form.catatan.trim(),
        status: 'Menunggu',
        tanggal,
      })
    }

    idPesananSukses.value = idPesanan
    sukses.value = true
    clearCart()
    setTimeout(() => router.push('/menu'), 3500)
  } catch (e) {
    // Keranjang sengaja tidak dikosongkan supaya pesanan bisa dikirim ulang.
    errorSubmit.value =
      'Pesanan gagal dikirim. Pastikan koneksi stabil dan resource DetailPesanan sudah dibuat di MockAPI, lalu coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <!-- Halaman sukses -->
    <div
      v-if="sukses"
      class="rounded-2xl border border-primary-100 bg-primary-50 py-16 text-center"
    >
      <CircleCheckBig class="mx-auto h-14 w-14 text-primary-600" :stroke-width="1.4" />
      <h1 class="mt-4 text-2xl font-bold text-gray-900">Reservasi Berhasil!</h1>
      <p class="mt-2 text-sm text-gray-600">
        Pesanan atas nama <strong>{{ form.namaPemesan }}</strong> untuk meja
        <strong>{{ form.noMeja }}</strong> sudah kami terima.
      </p>
      <p class="mt-1 text-sm text-gray-500">
        Kode pesanan: <span class="font-mono font-semibold">{{ idPesananSukses }}</span>
      </p>
      <p class="mt-4 text-xs text-gray-400">Mengalihkan ke halaman menu...</p>
      <RouterLink
        to="/menu"
        class="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        Kembali ke Menu
      </RouterLink>
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>
      <p class="mt-1 text-sm text-gray-500">Isi data pemesan untuk menyelesaikan reservasi.</p>

      <!-- Keranjang kosong -->
      <div
        v-if="items.length === 0"
        class="mt-8 rounded-2xl border border-dashed border-gray-200 py-16 text-center"
      >
        <ShoppingCart class="mx-auto h-14 w-14 text-gray-300" :stroke-width="1.2" />
        <p class="mt-4 font-semibold text-gray-700">Tidak ada item untuk di-checkout</p>
        <RouterLink
          to="/menu"
          class="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Pilih Menu
        </RouterLink>
      </div>

      <form v-else class="mt-8 grid gap-6 lg:grid-cols-3" @submit.prevent="submitPesanan">
        <!-- Form data pemesan -->
        <div class="space-y-4 lg:col-span-2">
          <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 class="font-semibold text-gray-900">Data Pemesan</h2>

            <div class="mt-4 space-y-4">
              <div>
                <label for="nama" class="block text-sm font-medium text-gray-700">
                  Nama Pemesan <span class="text-red-500">*</span>
                </label>
                <input
                  id="nama"
                  v-model="form.namaPemesan"
                  type="text"
                  placeholder="Contoh: Ahmad Fauzi"
                  class="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :class="
                    errors.namaPemesan
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                  "
                />
                <p v-if="errors.namaPemesan" class="mt-1 text-xs text-red-600">
                  {{ errors.namaPemesan }}
                </p>
              </div>

              <div>
                <label for="meja" class="block text-sm font-medium text-gray-700">
                  Nomor Meja <span class="text-red-500">*</span>
                </label>
                <input
                  id="meja"
                  v-model="form.noMeja"
                  type="text"
                  placeholder="Contoh: 12"
                  class="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :class="
                    errors.noMeja
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                  "
                />
                <p v-if="errors.noMeja" class="mt-1 text-xs text-red-600">{{ errors.noMeja }}</p>
              </div>

              <div>
                <label for="catatan" class="block text-sm font-medium text-gray-700">
                  Catatan <span class="text-gray-400">(opsional)</span>
                </label>
                <textarea
                  id="catatan"
                  v-model="form.catatan"
                  rows="3"
                  placeholder="Contoh: es sedikit, gula setengah"
                  class="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                ></textarea>
              </div>
            </div>
          </div>

          <p v-if="errorSubmit" class="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {{ errorSubmit }}
          </p>
        </div>

        <!-- Ringkasan pesanan -->
        <aside class="lg:col-span-1">
          <div class="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 class="font-semibold text-gray-900">Ringkasan Pesanan</h2>

            <ul class="mt-4 space-y-3">
              <li
                v-for="item in items"
                :key="item.produkId"
                class="flex justify-between gap-3 text-sm"
              >
                <span class="min-w-0 text-gray-600">
                  <span class="block truncate font-medium text-gray-800">{{
                    item.namaProduk
                  }}</span>
                  <span class="text-xs text-gray-400">
                    {{ item.jumlah }} × {{ formatRupiah(item.hargaSatuan) }}
                  </span>
                </span>
                <span class="shrink-0 font-semibold text-gray-700">
                  {{ formatRupiah(item.hargaSatuan * item.jumlah) }}
                </span>
              </li>
            </ul>

            <div class="mt-4 flex justify-between border-t border-gray-100 pt-4">
              <span class="font-semibold text-gray-900">Total ({{ totalItems }} item)</span>
              <span class="text-lg font-bold text-primary-700">{{ formatRupiah(totalHarga) }}</span>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="mt-5 w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {{ submitting ? 'Mengirim pesanan...' : 'Kirim Pesanan' }}
            </button>
            <RouterLink
              to="/keranjang"
              class="mt-2 block rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Kembali ke Keranjang
            </RouterLink>
          </div>
        </aside>
      </form>
    </template>
  </div>
</template>
