<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900">Validação de Bilhetes</h1>
      <p class="mt-1 text-sm text-gray-600">
        Escaneie ou digite o código QR para validar bilhetes.
      </p>
    </div>
    
    <!-- QR Scanner Section -->
    <div class="card">
      <div class="text-center">
        <div class="mx-auto w-32 h-32 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
          <svg class="w-16 h-16 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="5" height="5"/>
            <rect x="16" y="3" width="5" height="5"/>
            <rect x="3" y="16" width="5" height="5"/>
            <path d="M21 16h-3a2 2 0 00-2 2v3"/>
            <path d="M21 21v.01"/>
            <path d="M12 7v3a2 2 0 002 2h3"/>
            <path d="M3 12h.01"/>
            <path d="M12 3h.01"/>
            <path d="M12 16v.01"/>
            <path d="M16 12h1"/>
            <path d="M21 12v.01"/>
            <path d="M12 21v-1"/>
          </svg>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-4">Scanner QR</h3>
        
        <!-- Manual QR Input -->
        <div class="max-w-md mx-auto mb-6">
          <BaseInput
            v-model="qrCode"
            type="text"
            placeholder="Digite ou escaneie o código QR"
            :error-message="error"
          />
          <div class="mt-4 space-x-4">
            <BaseButton
              @click="validateTicket"
              text="Validar Bilhete"
              :loading="loading"
              :disabled="!qrCode.trim()"
            />
            <BaseButton
              @click="openScanner"
              text="Abrir Scanner"
              variant="outline"
            />
          </div>
        </div>
        
        <!-- Clear Button -->
        <BaseButton
          v-if="validationResult || error"
          @click="clearValidation"
          text="Nova Validação"
          variant="ghost"
          size="sm"
        />
      </div>
    </div>
    
    <!-- Validation Result - Success -->
    <div v-if="validationResult?.valido" class="card border-green-200 bg-green-50">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
        
        <h3 class="text-xl font-semibold text-green-900 mb-2">✅ Bilhete Válido</h3>
        <p class="text-green-700 mb-6">Entrada liberada!</p>
        
        <!-- Ticket Details -->
        <div class="bg-white rounded-lg p-6 text-left">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Comprador</label>
              <p class="mt-1 text-sm text-gray-900 font-medium">{{ validationResult.nomeComprador }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Evento</label>
              <p class="mt-1 text-sm text-gray-900">{{ validationResult.evento?.nome }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Data do Evento</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatEventDate(validationResult.evento?.dataEvento) }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Local</label>
              <p class="mt-1 text-sm text-gray-900">{{ validationResult.evento?.local }}</p>
            </div>
            
            <div v-if="validationResult.categoria">
              <label class="block text-sm font-medium text-gray-700">Categoria</label>
              <p class="mt-1 text-sm text-gray-900">{{ validationResult.categoria }}</p>
            </div>
            
            <div v-if="validationResult.assento">
              <label class="block text-sm font-medium text-gray-700">Assento</label>
              <p class="mt-1 text-sm text-gray-900">{{ validationResult.assento }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Validado em</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(validationResult.dataValidacao) }}</p>
            </div>
            
            <div v-if="validationResult.validadoPor">
              <label class="block text-sm font-medium text-gray-700">Validado por</label>
              <p class="mt-1 text-sm text-gray-900">{{ validationResult.validadoPor }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Validation Result - Error -->
    <div v-else-if="validationResult && !validationResult.valido" class="card border-red-200 bg-red-50">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6"/>
            <path d="M9 9l6 6"/>
          </svg>
        </div>
        
        <h3 class="text-xl font-semibold text-red-900 mb-2">❌ Bilhete Inválido</h3>
        <p class="text-red-700 mb-4">Entrada negada!</p>
        
        <!-- Error Details -->
        <div class="bg-white rounded-lg p-6 text-left">
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Motivo</label>
              <p class="mt-1 text-sm text-red-600 font-medium">{{ getErrorMessage(validationResult.motivo) }}</p>
            </div>
            
            <div v-if="validationResult.dataValidacaoAnterior">
              <label class="block text-sm font-medium text-gray-700">Validado anteriormente em</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(validationResult.dataValidacaoAnterior) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Validation History -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Últimas Validações</h3>
      <div class="text-center py-8 text-gray-500">
        <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <p class="text-sm">Histórico de validações será implementado em breve.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTicketsStore } from '@/stores/tickets'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const ticketsStore = useTicketsStore()
const { validationResult, loading } = storeToRefs(ticketsStore)

const qrCode = ref('')
const error = ref('')

// Methods
const validateTicket = async () => {
  if (!qrCode.value.trim()) {
    error.value = 'Digite o código QR'
    return
  }

  try {
    error.value = ''
    await ticketsStore.validateTicket(qrCode.value.trim())
  } catch (err) {
    console.error('Error validating ticket:', err)
    error.value = 'Erro ao validar bilhete. Tente novamente.'
  }
}

const openScanner = () => {
  // This would open a QR code scanner
  // For now, just show a placeholder
  alert('Scanner de câmera será implementado em breve. Por enquanto, digite o código QR manualmente.')
}

const clearValidation = () => {
  qrCode.value = ''
  error.value = ''
  ticketsStore.clearValidation()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // 24-hour format
  })
}

const formatEventDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // 24-hour format
  })
}

const getErrorMessage = (motivo?: string) => {
  const messages = {
    'BILHETE_JA_USADO': 'Bilhete já foi utilizado anteriormente',
    'BILHETE_CANCELADO': 'Bilhete foi cancelado',
    'BILHETE_EXPIRADO': 'Bilhete expirado',
    'EVENTO_CANCELADO': 'Evento foi cancelado',
    'QR_INVALIDO': 'Código QR inválido'
  }
  return messages[motivo as keyof typeof messages] || motivo || 'Bilhete inválido'
}
</script>