<template>
  <div class="space-y-6">
    <div class="card text-center py-12">
      <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Detalhes do Evento</h2>
      <p class="text-gray-600">Esta funcionalidade será implementada em breve.</p>
      <div class="mt-6">
        <BaseButton
          @click="$router.push('/eventos')"
          text="Voltar aos Eventos"
          variant="outline"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
</script>