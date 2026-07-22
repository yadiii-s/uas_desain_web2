import { createRouter, createWebHistory } from 'vue-router'

import UserLayout from '../components/user/UserLayout.vue'
import BerandaView from '../views/customer/BerandaView.vue'
import MenuView from '../views/customer/MenuView.vue'
import KeranjangView from '../views/customer/KeranjangView.vue'
import CheckoutView from '../views/customer/CheckoutView.vue'

import AdminLayout from '../components/admin/AdminLayout.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import ProdukView from '../views/admin/ProdukView.vue'
import PesananView from '../views/admin/PesananView.vue'
import PesananDetailView from '../views/admin/PesananDetailView.vue'

const routes = [
  {
    path: '/',
    component: UserLayout,
    children: [
      { path: '', name: 'beranda', component: BerandaView },
      { path: 'menu', name: 'menu', component: MenuView },
      { path: 'keranjang', name: 'keranjang', component: KeranjangView },
      { path: 'checkout', name: 'checkout', component: CheckoutView },
    ],
  },

  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: DashboardView },
      { path: 'produk', name: 'admin-produk', component: ProdukView },
      { path: 'pesanan', name: 'admin-pesanan', component: PesananView },
      {
        path: 'pesanan/:idPesanan',
        name: 'admin-pesanan-detail',
        component: PesananDetailView,
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
