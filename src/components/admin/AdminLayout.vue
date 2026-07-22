<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AdminSidebar from './AdminSidebar.vue'
import AdminNavbar from './AdminNavbar.vue'

const sidebarTerbuka = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminSidebar :terbuka="sidebarTerbuka" @tutup="sidebarTerbuka = false" />

    <div class="lg:pl-64">
      <AdminNavbar @toggle-sidebar="sidebarTerbuka = !sidebarTerbuka" />
      <main class="p-4 sm:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
