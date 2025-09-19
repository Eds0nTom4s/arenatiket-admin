<template>
  <div id="app">
    <router-view />
    <ToastContainer />
    <DevLoginHelper />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/base/ToastContainer.vue'
import DevLoginHelper from '@/components/dev/DevLoginHelper.vue'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize auth state on app mount
  authStore.initializeAuth()
})
</script>

<style>
/* Global styles are imported via main.css */
</style>