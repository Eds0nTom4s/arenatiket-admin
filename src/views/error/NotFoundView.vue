<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">🔍</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Página não encontrada</h2>
        <p class="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>
      
      <div class="space-y-4">
        <BaseButton
          @click="$router.push('/')"
          text="Voltar ao Dashboard"
          full-width
        />
        <BaseButton
          @click="$router.go(-1)"
          text="Página Anterior"
          variant="outline"
          full-width
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
</script>