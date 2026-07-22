import { reactive, computed } from 'vue'
import { toNumber } from '../services/api.js'

const STORAGE_KEY = 'reservasi-cafe-cart'

const items = reactive(muatDariStorage())

function muatDariStorage() {
  try {
    const mentah = localStorage.getItem(STORAGE_KEY)
    const data = mentah ? JSON.parse(mentah) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function simpanKeStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    }
}

export function useCart() {
  function addItem(produk, qty = 1) {
    const jumlah = Math.max(1, Number(qty) || 1)
    const existing = items.find((i) => i.produkId === produk.id)

    if (existing) {
      existing.jumlah += jumlah
    } else {
      items.push({
        produkId: produk.id,
        namaProduk: produk.nama_produk,
        hargaSatuan: toNumber(produk.harga),
        foto: produk.foto,
        kategori: produk.kategori,
        jumlah,
        catatan: '',
      })
    }
    simpanKeStorage()
  }

  function removeItem(produkId) {
    const idx = items.findIndex((i) => i.produkId === produkId)
    if (idx !== -1) items.splice(idx, 1)
    simpanKeStorage()
  }

  function updateQty(produkId, jumlah) {
    const item = items.find((i) => i.produkId === produkId)
    if (!item) return
    const baru = Number(jumlah) || 0
    if (baru < 1) {
      removeItem(produkId)
      return
    }
    item.jumlah = baru
    simpanKeStorage()
  }

  function updateCatatan(produkId, catatan) {
    const item = items.find((i) => i.produkId === produkId)
    if (!item) return
    item.catatan = catatan
    simpanKeStorage()
  }

  function clearCart() {
    items.splice(0, items.length)
    simpanKeStorage()
  }

  const totalItems = computed(() => items.reduce((acc, i) => acc + i.jumlah, 0))
  const totalHarga = computed(() => items.reduce((acc, i) => acc + i.hargaSatuan * i.jumlah, 0))

  return {
    items,
    addItem,
    removeItem,
    updateQty,
    updateCatatan,
    clearCart,
    totalItems,
    totalHarga,
  }
}
