<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Package, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
import {
  getProduk,
  createProduk,
  updateProduk,
  deleteProduk,
  formatRupiah,
} from '../../services/api.js'

const produkList = ref([])
const loading = ref(true)
const error = ref('')
const keyword = ref('')

const modalTerbuka = ref(false)
const modeEdit = ref(false)
const idTerpilih = ref(null)
const submitting = ref(false)
const errorForm = ref('')
const notifikasi = ref('')

let timerNotifikasi = null

const form = reactive({
  nama_produk: '',
  harga: '',
  kategori: '',
  deskripsi: '',
  foto: '',
})

const errors = reactive({ nama_produk: '', harga: '', kategori: '' })

const KATEGORI_SARAN = ['Kopi', 'Non-Kopi', 'Makanan', 'Snack']

const FOTO_CADANGAN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3f4f6"/><text x="50%" y="54%" font-family="sans-serif" font-size="11" fill="#9ca3af" text-anchor="middle">no img</text></svg>',
  )

function fotoAman(e) {
  e.target.src = FOTO_CADANGAN
}

const produkTersaring = computed(() => {
  const cari = keyword.value.trim().toLowerCase()
  if (!cari) return produkList.value
  return produkList.value.filter(
    (p) =>
      String(p.nama_produk || '')
        .toLowerCase()
        .includes(cari) ||
      String(p.kategori || '')
        .toLowerCase()
        .includes(cari),
  )
})

function tampilkanNotifikasi(pesan) {
  notifikasi.value = pesan
  clearTimeout(timerNotifikasi)
  timerNotifikasi = setTimeout(() => (notifikasi.value = ''), 2500)
}

async function muatProduk() {
  loading.value = true
  error.value = ''
  try {
    produkList.value = await getProduk()
  } catch (e) {
    error.value = 'Gagal memuat data produk.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.nama_produk = ''
  form.harga = ''
  form.kategori = ''
  form.deskripsi = ''
  form.foto = ''
  errors.nama_produk = ''
  errors.harga = ''
  errors.kategori = ''
  errorForm.value = ''
}

function bukaTambah() {
  resetForm()
  modeEdit.value = false
  idTerpilih.value = null
  modalTerbuka.value = true
}

function bukaEdit(produk) {
  resetForm()
  modeEdit.value = true
  idTerpilih.value = produk.id
  form.nama_produk = produk.nama_produk ?? ''
  form.harga = produk.harga ?? ''
  form.kategori = produk.kategori ?? ''
  form.deskripsi = produk.deskripsi ?? ''
  form.foto = produk.foto ?? ''
  modalTerbuka.value = true
}

function tutupModal() {
  if (submitting.value) return
  modalTerbuka.value = false
}

function validasi() {
  errors.nama_produk = form.nama_produk.trim() ? '' : 'Nama produk wajib diisi'
  errors.kategori = form.kategori.trim() ? '' : 'Kategori wajib diisi'
  const hargaAngka = Number(form.harga)
  if (String(form.harga).trim() === '') errors.harga = 'Harga wajib diisi'
  else if (!Number.isFinite(hargaAngka) || hargaAngka < 0)
    errors.harga = 'Harga harus angka positif'
  else errors.harga = ''
  return !errors.nama_produk && !errors.kategori && !errors.harga
}

async function simpanProduk() {
  errorForm.value = ''
  if (!validasi()) return

  submitting.value = true
  const payload = {
    nama_produk: form.nama_produk.trim(),
    harga: String(form.harga).trim(),
    kategori: form.kategori.trim(),
    deskripsi: form.deskripsi.trim(),
    foto: form.foto.trim(),
  }

  try {
    if (modeEdit.value) {
      await updateProduk(idTerpilih.value, payload)
      tampilkanNotifikasi('Produk berhasil diperbarui')
    } else {
      await createProduk(payload)
      tampilkanNotifikasi('Produk berhasil ditambahkan')
    }
    modalTerbuka.value = false
    await muatProduk()
  } catch (e) {
    errorForm.value = 'Gagal menyimpan produk. Periksa koneksi lalu coba lagi.'
  } finally {
    submitting.value = false
  }
}

async function hapusProduk(produk) {
  if (!confirm(`Hapus produk "${produk.nama_produk}"? Tindakan ini tidak bisa dibatalkan.`)) return
  try {
    await deleteProduk(produk.id)
    tampilkanNotifikasi('Produk berhasil dihapus')
    await muatProduk()
  } catch (e) {
    error.value = 'Gagal menghapus produk.'
  }
}

onMounted(muatProduk)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">Kelola Produk</h1>
        <p class="mt-1 text-sm text-gray-500">{{ produkList.length }} produk terdaftar.</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        @click="bukaTambah"
      >
        <Plus class="h-4 w-4" />
        Tambah Produk
      </button>
    </div>

    <!-- Search -->
    <input
      v-model="keyword"
      type="search"
      placeholder="Cari nama produk atau kategori..."
      class="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 sm:max-w-sm"
    />

    <p v-if="error" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>

    <!-- Loading -->
    <div v-if="loading" class="mt-5 space-y-3">
      <div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-xl bg-white"></div>
    </div>

    <!-- Kosong -->
    <div
      v-else-if="produkTersaring.length === 0"
      class="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center"
    >
      <Package class="mx-auto h-12 w-12 text-gray-300" :stroke-width="1.4" />
      <p class="mt-3 font-semibold text-gray-700">Belum ada produk</p>
      <p class="mt-1 text-sm text-gray-500">Tambahkan produk pertama lewat tombol di atas.</p>
    </div>

    <template v-else>
      <!-- Tabel: desktop -->
      <div
        class="mt-5 hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-5 py-3">Produk</th>
              <th class="px-5 py-3">Kategori</th>
              <th class="px-5 py-3">Harga</th>
              <th class="px-5 py-3">Deskripsi</th>
              <th class="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="produk in produkTersaring"
              :key="produk.id"
              class="transition hover:bg-gray-50"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <img
                    :src="produk.foto"
                    :alt="produk.nama_produk"
                    class="h-11 w-11 shrink-0 rounded-lg bg-gray-50 object-cover"
                    @error="fotoAman"
                  />
                  <span class="font-medium text-gray-900">{{ produk.nama_produk }}</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span
                  class="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                >
                  {{ produk.kategori }}
                </span>
              </td>
              <td class="px-5 py-3 font-semibold text-gray-700">
                {{ formatRupiah(produk.harga) }}
              </td>
              <td class="max-w-xs px-5 py-3">
                <p class="truncate text-gray-500">{{ produk.deskripsi }}</p>
              </td>
              <td class="px-5 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                    @click="bukaEdit(produk)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    @click="hapusProduk(produk)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card list: mobile -->
      <div class="mt-5 space-y-3 md:hidden">
        <article
          v-for="produk in produkTersaring"
          :key="produk.id"
          class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div class="flex gap-3">
            <img
              :src="produk.foto"
              :alt="produk.nama_produk"
              class="h-16 w-16 shrink-0 rounded-lg bg-gray-50 object-cover"
              @error="fotoAman"
            />
            <div class="min-w-0 flex-1">
              <h3 class="truncate font-semibold text-gray-900">{{ produk.nama_produk }}</h3>
              <span
                class="mt-1 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
              >
                {{ produk.kategori }}
              </span>
              <p class="mt-1 font-semibold text-gray-700">{{ formatRupiah(produk.harga) }}</p>
            </div>
          </div>
          <p class="mt-3 line-clamp-2 text-sm text-gray-500">{{ produk.deskripsi }}</p>
          <div class="mt-3 flex gap-2">
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
              @click="bukaEdit(produk)"
            >
              <Pencil class="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
              @click="hapusProduk(produk)"
            >
              <Trash2 class="h-3.5 w-3.5" />
              Hapus
            </button>
          </div>
        </article>
      </div>
    </template>

    <!-- Modal form tambah/edit -->
    <div
      v-if="modalTerbuka"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      @click.self="tutupModal"
    >
      <div
        class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:max-w-lg sm:rounded-2xl"
      >
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 class="font-semibold text-gray-900">
            {{ modeEdit ? 'Edit Produk' : 'Tambah Produk' }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
            aria-label="Tutup"
            @click="tutupModal"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-4 p-5" @submit.prevent="simpanProduk">
          <div>
            <label for="nama_produk" class="block text-sm font-medium text-gray-700">
              Nama Produk <span class="text-red-500">*</span>
            </label>
            <input
              id="nama_produk"
              v-model="form.nama_produk"
              type="text"
              placeholder="Contoh: Kopi Susu Gula Aren"
              class="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
              :class="
                errors.nama_produk
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
              "
            />
            <p v-if="errors.nama_produk" class="mt-1 text-xs text-red-600">
              {{ errors.nama_produk }}
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="harga" class="block text-sm font-medium text-gray-700">
                Harga <span class="text-red-500">*</span>
              </label>
              <input
                id="harga"
                v-model="form.harga"
                type="number"
                min="0"
                placeholder="25000"
                class="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                :class="
                  errors.harga
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                "
              />
              <p v-if="errors.harga" class="mt-1 text-xs text-red-600">{{ errors.harga }}</p>
            </div>

            <div>
              <label for="kategori" class="block text-sm font-medium text-gray-700">
                Kategori <span class="text-red-500">*</span>
              </label>
              <input
                id="kategori"
                v-model="form.kategori"
                list="daftar-kategori"
                type="text"
                placeholder="Kopi"
                class="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                :class="
                  errors.kategori
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                "
              />
              <datalist id="daftar-kategori">
                <option v-for="k in KATEGORI_SARAN" :key="k" :value="k"></option>
              </datalist>
              <p v-if="errors.kategori" class="mt-1 text-xs text-red-600">{{ errors.kategori }}</p>
            </div>
          </div>

          <div>
            <label for="deskripsi" class="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              id="deskripsi"
              v-model="form.deskripsi"
              rows="3"
              placeholder="Espresso dengan susu segar dan gula aren"
              class="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            ></textarea>
          </div>

          <div>
            <label for="foto" class="block text-sm font-medium text-gray-700">URL Foto</label>
            <input
              id="foto"
              v-model="form.foto"
              type="url"
              placeholder="https://..."
              class="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <img
              v-if="form.foto"
              :src="form.foto"
              alt="Preview foto"
              class="mt-2 h-24 w-24 rounded-lg bg-gray-50 object-cover"
              @error="fotoAman"
            />
          </div>

          <p v-if="errorForm" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {{ errorForm }}
          </p>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              @click="tutupModal"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="notifikasi"
      class="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      {{ notifikasi }}
    </div>
  </div>
</template>
