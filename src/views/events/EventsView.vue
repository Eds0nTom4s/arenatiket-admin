<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestão de Eventos</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gerencie eventos e suas configurações.
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0" v-if="authStore.isAdmin">
        <BaseButton
          @click="openCreateModal"
          text="Novo Evento"
        />
      </div>
    </div>
    
    <!-- Filters -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div class="flex-1 max-w-md">
          <BaseInput
            v-model="filters.search"
            type="text"
            placeholder="Buscar eventos..."
          />
        </div>
        
        <div class="flex items-center space-x-4">
          <BaseInput
            v-model="filters.status"
            type="select"
            placeholder="Todos os status"
            :options="statusOptions"
            @change="applyFilters"
          />
          
          <BaseButton
            @click="clearFilters"
            text="Limpar"
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    </div>
    
    <!-- Events Table -->
    <BaseTable
      title="Lista de Eventos"
      :columns="columns"
      :data="events"
      :loading="loading"
      :pagination="pagination"
      :show-actions="false"
      :show-edit="false"
      :show-delete="false"
      empty-title="Nenhum evento encontrado"
      empty-message="Não há eventos cadastrados no sistema."
      @page-change="changePage"
    >
      <!-- Custom cell for status -->
      <template #cell(status)="{ item }">
        <span
          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
          :class="getStatusClass(item.status || 'ATIVO')"
        >
          {{ item.status || 'ATIVO' }}
        </span>
      </template>
      
      <!-- Custom cell for categoria -->
      <template #cell(categoria)="{ item }">
        <span class="text-sm text-gray-900">
          {{ item.categoria || 'OUTROS' }}
        </span>
      </template>
      
      <!-- Custom cell for event date -->
      <template #cell(dataEvento)="{ item }">
        <span class="text-sm text-gray-900">
          {{ formatEventDate(item.dataHora || item.dataEvento) }}
        </span>
      </template>
      
      <!-- Custom cell for capacity -->
      <template #cell(capacidade)="{ item }">
        <div class="text-sm">
          <div class="text-gray-900">{{ item.bilhetesVendidos || 0 }}/{{ item.capacidadeTotal || 100 }}</div>
          <div class="text-gray-500">{{ getOccupancyPercentage(item) }}%</div>
        </div>
      </template>
      
      <!-- Custom actions -->
      <template #cell(acoes)="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <BaseButton
            @click="viewEvent(item)"
            text="Ver"
            variant="outline"
            size="xs"
          />
          <BaseButton
            v-if="authStore.isAdmin"
            @click="openEditModal(item)"
            text="Editar"
            variant="ghost"
            size="xs"
          />
        </div>
      </template>
    </BaseTable>
    
    <!-- Create/Edit Event Modal -->
    <BaseModal
      v-model="showModal"
      :title="modalTitle"
      size="lg"
      :show-footer="true"
      :show-confirm="true"
      :confirm-text="isEditing ? 'Atualizar' : 'Criar'"
      :confirm-disabled="formLoading"
      @confirm="submitForm"
      @close="closeModal"
    >
      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Name -->
          <div class="sm:col-span-2">
            <BaseInput
              v-model="form.nome"
              type="text"
              label="Nome do Evento"
              placeholder="Digite o nome do evento"
              required
              :error-message="errors.nome"
            />
          </div>
          
          <!-- Description -->
          <div class="sm:col-span-2">
            <BaseInput
              v-model="form.descricao"
              type="textarea"
              label="Descrição"
              placeholder="Descreva o evento"
              :rows="3"
              :error-message="errors.descricao"
            />
          </div>
          
          <!-- Event Date and Time (Brazilian Format) -->
          <div class="sm:col-span-2">
            <BaseInput
              v-model="form.dataHora"
              type="datetime-brazilian"
              label="Data e Hora do Evento"
              required
              :error-message="errors.dataHora"
            />
            <p class="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              ℹ️ Selecione a data e hora em campos separados para maior precisão
            </p>
          </div>
          
          <!-- Location -->
          <BaseInput
            v-model="form.local"
            type="text"
            label="Local"
            placeholder="Local do evento"
            required
            :error-message="errors.local"
          />
          
          <!-- Category -->
          <BaseInput
            v-model="form.categoria"
            type="select"
            label="Categoria"
            placeholder="Selecione a categoria"
            required
            :options="categoryOptions"
            :error-message="errors.categoria"
          />
          
          <!-- Capacity -->
          <BaseInput
            v-model="form.capacidadeTotal"
            type="number"
            label="Capacidade Total"
            placeholder="Número de lugares"
            required
            :min="1"
            :error-message="errors.capacidadeTotal"
          />
          
          <!-- Image URL -->
          <div class="sm:col-span-2">
            <BaseInput
              v-model="form.imagemUrl"
              type="text"
              label="URL da Imagem"
              placeholder="https://exemplo.com/imagem.jpg"
              :error-message="errors.imagemUrl"
            />
          </div>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useEventsStore } from '@/stores/events'
import type { Event, CreateEventRequest } from '@/types'
import BaseTable from '@/components/base/BaseTable.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const eventsStore = useEventsStore()
const { events, loading, pagination } = storeToRefs(eventsStore)

// Modal states
const showModal = ref(false)
const isEditing = ref(false)
const formLoading = ref(false)

// Form data
const form = reactive({
  nome: '',
  descricao: '',
  dataHora: '',
  local: '',
  categoria: '',
  capacidadeTotal: 0,
  imagemUrl: '',
  ativo: true
})

// Form errors
const errors = reactive({
  nome: '',
  descricao: '',
  dataHora: '',
  local: '',
  categoria: '',
  capacidadeTotal: '',
  imagemUrl: ''
})

// Filters
const filters = reactive({
  search: '',
  status: '',
  page: 0,
  size: 20
})

// Table columns
const columns = [
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'dataEvento', label: 'Data/Hora', sortable: true },
  { key: 'local', label: 'Local' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'status', label: 'Status' },
  { key: 'capacidade', label: 'Ocupação' },
  { key: 'acoes', label: 'Ações' }
]

// Options
const statusOptions = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' },
  { value: 'ESGOTADO', label: 'Esgotado' }
]

const categoryOptions = [
  { value: 'FUTEBOL', label: 'Futebol' },
  { value: 'MUSICA', label: 'Música' },
  { value: 'TEATRO', label: 'Teatro' },
  { value: 'CONFERENCIA', label: 'Conferência' },
  { value: 'OUTROS', label: 'Outros' }
]

// Computed
const modalTitle = computed(() => {
  return isEditing.value ? 'Editar Evento' : 'Novo Evento'
})

// Methods
const loadEvents = async () => {
  try {
    await eventsStore.fetchEvents({
      page: filters.page,
      size: filters.size,
      ...(filters.status && { status: filters.status })
    })
  } catch (error) {
    console.error('Error loading events:', error)
  }
}

const applyFilters = () => {
  filters.page = 0
  loadEvents()
}

const clearFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.page = 0
  loadEvents()
}

const changePage = (page: number) => {
  filters.page = page
  loadEvents()
}

const formatEventDate = (dateString: string) => {
  // Handle both ISO format and Brazilian format
  let date: Date;
  
  if (dateString.includes('T')) {
    // ISO format
    date = new Date(dateString);
  } else if (dateString.includes('/')) {
    // Brazilian format: dd/MM/yyyy HH:mm
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  } else {
    date = new Date(dateString);
  }
  
  // Always return Brazilian format: dd/MM/yyyy HH:mm
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const getStatusClass = (status: string) => {
  const classes = {
    ATIVO: 'bg-green-100 text-green-800',
    INATIVO: 'bg-gray-100 text-gray-800',
    ESGOTADO: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getOccupancyPercentage = (event: Event) => {
  if (!event.capacidadeTotal || event.capacidadeTotal === 0) return 0
  const vendidos = event.bilhetesVendidos || 0
  const capacidade = event.capacidadeTotal || 100
  return Math.round((vendidos / capacidade) * 100)
}

const viewEvent = (event: Event) => {
  router.push(`/eventos/${event.id}`)
}

// Modal functions
const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (event: Event) => {
  isEditing.value = true
  form.nome = event.nome
  form.descricao = event.descricao
  
  // Convert from ISO or existing format to Brazilian format
  if (event.dataEvento || event.dataHora) {
    const dateValue = event.dataHora || event.dataEvento || ''
    
    if (dateValue && dateValue.includes('T')) {
      // Convert from ISO format
      const date = new Date(dateValue)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      form.dataHora = `${day}/${month}/${year} ${hours}:${minutes}`
    } else if (dateValue) {
      // Already in Brazilian format
      form.dataHora = dateValue
    }
  }
  
  form.local = event.local
  form.categoria = event.categoria
  form.capacidadeTotal = event.capacidadeTotal
  form.imagemUrl = event.imagemUrl || ''
  form.ativo = event.ativo !== false // Default to true if undefined
  eventsStore.setCurrentEvent(event)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  eventsStore.setCurrentEvent(null)
}

const resetForm = () => {
  form.nome = ''
  form.descricao = ''
  form.dataHora = ''
  form.local = ''
  form.categoria = ''
  form.capacidadeTotal = 0
  form.imagemUrl = ''
  form.ativo = true
  clearAllErrors()
}

const clearAllErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

const validateForm = () => {
  clearAllErrors()
  let isValid = true

  if (!form.nome.trim()) {
    errors.nome = 'Nome é obrigatório'
    isValid = false
  }

  if (!form.dataHora) {
    errors.dataHora = 'Data e hora são obrigatórias'
    isValid = false
  } else {
    // Validate Brazilian date format (dd/MM/yyyy HH:mm)
    const brazilianDateRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/
    
    if (!brazilianDateRegex.test(form.dataHora)) {
      errors.dataHora = 'Formato inválido. Use: DD/MM/YYYY HH:MM'
      isValid = false
    } else {
      // Parse the Brazilian format and validate if it's a future date
      const [datePart, timePart] = form.dataHora.split(' ')
      const [day, month, year] = datePart.split('/')
      const [hours, minutes] = timePart.split(':')
      
      const selectedDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      )
      
      const now = new Date()
      
      if (isNaN(selectedDate.getTime())) {
        errors.dataHora = 'Data inválida'
        isValid = false
      } else if (selectedDate <= now) {
        errors.dataHora = 'A data deve ser no futuro'
        isValid = false
      }
    }
  }

  if (!form.local.trim()) {
    errors.local = 'Local é obrigatório'
    isValid = false
  }

  if (!form.categoria) {
    errors.categoria = 'Categoria é obrigatória'
    isValid = false
  }

  if (!form.capacidadeTotal || form.capacidadeTotal <= 0) {
    errors.capacidadeTotal = 'Capacidade deve ser maior que zero'
    isValid = false
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  try {
    formLoading.value = true

    // Send data in the format expected by backend
    const eventData = {
      nome: form.nome,
      descricao: form.descricao,
      dataHora: form.dataHora, // Brazilian format: dd/MM/yyyy HH:mm
      local: form.local,
      categoria: form.categoria,
      capacidadeTotal: form.capacidadeTotal,
      imagemUrl: form.imagemUrl,
      ativo: form.ativo
    }
    
    console.log('Form data before submission:', form)
    console.log('Event data being sent to API:', eventData)
    console.log('dataHora format:', eventData.dataHora)

    if (isEditing.value) {
      const currentEvent = eventsStore.currentEvent
      if (currentEvent) {
        await eventsStore.updateEvent(currentEvent.id, eventData)
      }
    } else {
      await eventsStore.createEvent(eventData as CreateEventRequest)
    }

    closeModal()
    
    // Reload events to ensure consistency
    try {
      await loadEvents()
    } catch (reloadError) {
      console.warn('Warning: Could not reload events after creation/update:', reloadError)
    }
  } catch (error: any) {
    console.error('Error submitting form:', error)
    console.error('Error response data:', error.response?.data)
  } finally {
    formLoading.value = false
  }
}

// Load data on mount
onMounted(async () => {
  try {
    await loadEvents()
  } catch (error) {
    console.error('Error loading events on mount:', error)
  }
})
</script>