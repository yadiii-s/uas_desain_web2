<script setup>
import { RouterView } from 'vue-router'
import UserNavbar from './UserNavbar.vue'
import UserFooter from './UserFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <UserNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <UserFooter />
  </div>
</template>
