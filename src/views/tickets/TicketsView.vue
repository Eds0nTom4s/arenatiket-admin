<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Consulta de Bilhetes</h1>
      <p class="mt-1 text-sm text-gray-600">
        Consulte informações de bilhetes por ID ou código QR.
      </p>
    </div>
    
    <!-- Search Form -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Buscar Bilhete</h3>
      
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Search by ID -->
        <div>
          <BaseInput
            v-model="searchForm.id"
            type="number"
            label="ID do Bilhete"
            placeholder="Digite o ID do bilhete"
            :error-message="errors.id"
          />
          <div class="mt-2">
            <BaseButton
              @click="searchById"
              text="Buscar por ID"
              :loading="loading"
              size="sm"
              :disabled="!searchForm.id"
            />
          </div>
        </div>
        
        <!-- Search by QR -->
        <div>
          <BaseInput
            v-model="searchForm.qrCode"
            type="text"
            label="Código QR"
            placeholder="Digite ou escaneie o código QR"
            :error-message="errors.qrCode"
          />
          <div class="mt-2 flex space-x-2">
            <BaseButton
              @click="searchByQR"
              text="Buscar por QR"
              :loading="loading"
              size="sm"
              :disabled="!searchForm.qrCode"
            />
            <BaseButton
              @click="openQRScanner"
              text="Escanear QR"
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ticket Information -->
    <div v-if="currentTicket" class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Informações do Bilhete</h3>
      
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Ticket Details -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">ID do Bilhete</label>
            <p class="mt-1 text-sm text-gray-900">{{ currentTicket.id }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <span
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              :class="getStatusClass(currentTicket.status)"
            >
              {{ currentTicket.status }}
            </span>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Código QR</label>
            <p class="mt-1 text-sm text-gray-900 font-mono">{{ currentTicket.codigoQR }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Comprador</label>
            <p class="mt-1 text-sm text-gray-900">{{ currentTicket.nomeComprador }}</p>
            <p class="text-sm text-gray-500">{{ currentTicket.emailComprador }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Data da Compra</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDate(currentTicket.dataCompra) }}</p>
          </div>
          
          <div v-if="currentTicket.dataValidacao">
            <label class="block text-sm font-medium text-gray-700">Data de Validação</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDate(currentTicket.dataValidacao) }}</p>
          </div>
        </div>
        
        <!-- Event Details -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Evento</label>
            <p class="mt-1 text-lg font-medium text-gray-900">{{ currentTicket.evento.nome }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Data do Evento</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatEventDate(currentTicket.evento.dataEvento) }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Local</label>
            <p class="mt-1 text-sm text-gray-900">{{ currentTicket.evento.local }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Categoria do Bilhete</label>
            <p class="mt-1 text-sm text-gray-900">{{ currentTicket.categoriaBilhete.nome }}</p>
            <p class="mt-1 text-lg font-semibold text-primary-600">
              € {{ currentTicket.categoriaBilhete.preco.toFixed(2) }}
            </p>
          </div>
          
          <div v-if="currentTicket.categoriaBilhete.setor">
            <label class="block text-sm font-medium text-gray-700">Localização</label>
            <div class="mt-1 text-sm text-gray-900">
              <p>Setor: {{ currentTicket.categoriaBilhete.setor }}</p>
              <p v-if="currentTicket.categoriaBilhete.fila">
                Fila: {{ currentTicket.categoriaBilhete.fila }}
              </p>
              <p v-if="currentTicket.categoriaBilhete.assento">
                Assento: {{ currentTicket.categoriaBilhete.assento }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- No Results -->
    <div v-else-if="searchAttempted && !loading" class="card text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 9a3 3 0 010-6h1.4l2.6 2.6L8.6 3H12v7l-4 4v1h8v-1l-4-4V3h3.4l2.6 2.6L20.6 3H22a3 3 0 010 6"/>
      </svg>
      <h3 class="text-sm font-medium text-gray-900 mb-1">Bilhete não encontrado</h3>
      <p class="text-sm text-gray-500">Verifique o ID ou código QR e tente novamente.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useTicketsStore } from '@/stores/tickets'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const ticketsStore = useTicketsStore()
const { currentTicket, loading } = storeToRefs(ticketsStore)

const searchAttempted = ref(false)

// Form data
const searchForm = reactive({
  id: '',
  qrCode: ''
})

// Form errors
const errors = reactive({
  id: '',
  qrCode: ''
})

// Methods
const clearErrors = () => {
  errors.id = ''
  errors.qrCode = ''
}

const searchById = async () => {
  if (!searchForm.id) {
    errors.id = 'Digite o ID do bilhete'
    return
  }

  try {
    clearErrors()
    searchAttempted.value = true
    await ticketsStore.fetchTicket(Number(searchForm.id))
    searchForm.qrCode = '' // Clear other field
  } catch (error) {
    console.error('Error searching ticket by ID:', error)
    errors.id = 'Bilhete não encontrado'
  }
}

const searchByQR = async () => {
  if (!searchForm.qrCode) {
    errors.qrCode = 'Digite o código QR'
    return
  }

  try {
    clearErrors()
    searchAttempted.value = true
    await ticketsStore.fetchTicketByQR(searchForm.qrCode)
    searchForm.id = '' // Clear other field
  } catch (error) {
    console.error('Error searching ticket by QR:', error)
    errors.qrCode = 'Bilhete não encontrado'
  }
}

const openQRScanner = () => {
  // This would open a QR scanner modal
  // For now, just show a placeholder message
  alert('Scanner QR será implementado em breve. Por enquanto, digite o código manualmente.')
}

const formatDate = (dateString: string) => {
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

const formatEventDate = (dateString: string) => {
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

const getStatusClass = (status: string) => {
  const classes = {
    ATIVO: 'bg-green-100 text-green-800',
    USADO: 'bg-blue-100 text-blue-800',
    CANCELADO: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}
</script>