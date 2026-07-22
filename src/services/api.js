import axios from 'axios'

const BASE_URL = 'https://6a607129b1933e9d25fd417b.mockapi.io/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})


export async function getProduk() {
  const { data } = await api.get('/Produk')
  return data
}

export async function getProdukById(id) {
  const { data } = await api.get(`/Produk/${id}`)
  return data
}

export async function createProduk(payload) {
  const { data } = await api.post('/Produk', payload)
  return data
}

export async function updateProduk(id, payload) {
  const { data } = await api.put(`/Produk/${id}`, payload)
  return data
}

export async function deleteProduk(id) {
  const { data } = await api.delete(`/Produk/${id}`)
  return data
}


export async function getDetailPesanan() {
  const { data } = await api.get('/DetailPesanan')
  return Array.isArray(data) ? data : []
}

export async function getDetailPesananById(id) {
  const { data } = await api.get(`/DetailPesanan/${id}`)
  return data
}

export async function createDetailPesanan(payload) {
  const { data } = await api.post('/DetailPesanan', payload)
  return data
}

export async function updateDetailPesanan(id, payload) {
  const { data } = await api.put(`/DetailPesanan/${id}`, payload)
  return data
}

export async function deleteDetailPesanan(id) {
  const { data } = await api.delete(`/DetailPesanan/${id}`)
  return data
}

export function toNumber(nilai) {
  const angka = Number(String(nilai ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(angka) ? angka : 0
}

export function formatRupiah(nilai) {
  return 'Rp ' + toNumber(nilai).toLocaleString('id-ID')
}

export function kelompokkanPesanan(detailList) {
  const peta = new Map()

  for (const d of detailList) {
    if (!peta.has(d.idPesanan)) {
      peta.set(d.idPesanan, {
        idPesanan: d.idPesanan,
        namaPemesan: d.namaPemesan,
        noMeja: d.noMeja,
        tanggal: d.tanggal,
        status: d.status,
        catatan: d.catatan,
        items: [],
        totalItem: 0,
        totalHarga: 0,
      })
    }
    const pesanan = peta.get(d.idPesanan)
    pesanan.items.push(d)
    pesanan.totalItem += toNumber(d.jumlah)
    pesanan.totalHarga += toNumber(d.subtotal)
  }

  return [...peta.values()].sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)))
}

export function formatTanggal(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default api
