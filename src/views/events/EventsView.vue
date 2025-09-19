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
          {{ formatEventDate(item.dataEvento) }}
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
            <p class="mt-1 text-xs text-gray-500">
              {{ form.nome.length }}/200 caracteres
            </p>
          </div>
          
          <!-- Description -->
          <div class="sm:col-span-2">
            <BaseInput
              v-model="form.descricao"
              type="textarea"
              label="Descrição (Opcional)"
              placeholder="Descreva o evento"
              :rows="3"
              :error-message="errors.descricao"
            />
            <p class="mt-1 text-xs text-gray-500">
              {{ form.descricao.length }}/1000 caracteres
            </p>
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
            
            <!-- Fallback: Simple text input for manual entry -->
            <details class="mt-2">
              <summary class="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                🛠️ Entrada manual (DD/MM/AAAA HH:MM)
              </summary>
              <div class="mt-2">
                <input
                  v-model="form.dataHora"
                  type="text"
                  placeholder="Ex: 25/12/2024 15:30"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Formato: DD/MM/AAAA HH:MM (Ex: 25/12/2024 15:30)
                </p>
              </div>
            </details>
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
          <p class="mt-1 text-xs text-gray-500">
            {{ form.local.length }}/300 caracteres
          </p>
          
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
          <p class="mt-1 text-xs text-gray-500">
            Categoria selecionada: <strong>{{ form.categoria || 'Nenhuma' }}</strong>
          </p>
          
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useEventsStore } from '@/stores/events'
import type { Event, CreateEventRequest } from '@/types'
import { validateEvent, convertBrazilianToISO, VALID_CATEGORIES } from '@/utils/validation'
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

const categoryOptions = VALID_CATEGORIES.map(cat => ({
  value: cat,
  label: cat === 'FUTEBOL' ? 'Futebol' :
         cat === 'BASQUETEBOL' ? 'Basquetebol' :
         cat === 'VOLEIBOL' ? 'Voleibol' :
         cat === 'MUSICA' ? 'Música' :
         cat === 'TEATRO' ? 'Teatro' :
         cat === 'DESPORTO' ? 'Desporto' :
         'Outros'
}))

// Computed
const modalTitle = computed(() => {
  return isEditing.value ? 'Editar Evento' : 'Novo Evento'
})

// Watch categoria changes (apenas para debug se necessário)
watch(() => form.categoria, (newCategoria) => {
  if (newCategoria) {
    console.log('✅ Categoria selecionada:', newCategoria)
  }
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
  if (!dateString) return ''
  
  // Always expect ISO format from API
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    console.warn('Invalid date format:', dateString)
    return dateString // Return original if invalid
  }
  
  // Always return Brazilian format: dd/MM/yyyy HH:mm
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
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
  
  // Convert from ISO format to Brazilian format for editing
  if (event.dataEvento) {
    const date = new Date(event.dataEvento)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      form.dataHora = `${day}/${month}/${year} ${hours}:${minutes}`
    } else {
      form.dataHora = ''
    }
  } else {
    form.dataHora = ''
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
  
  // Debug: Check form.dataHora before validation
  console.log('🔍 validateForm - form.dataHora:', form.dataHora)
  console.log('🔍 validateForm - form object:', JSON.stringify(form, null, 2))
  
  // Use centralized validation
  const validation = validateEvent(form)
  
  if (!validation.isValid) {
    console.log('❌ validateForm - Validation failed:', validation.errors)
    Object.assign(errors, validation.errors)
  } else {
    console.log('✅ validateForm - Validation passed')
  }
  
  return validation.isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  try {
    formLoading.value = true

    // Debug: Log form data before conversion
    console.log('🔍 DEBUG - Form dataHora before conversion:', form.dataHora)
    console.log('🔍 DEBUG - Type of form.dataHora:', typeof form.dataHora)
    console.log('🔍 DEBUG - Full form object:', JSON.stringify(form, null, 2))

    // Check if dataHora is empty or invalid
    if (!form.dataHora || form.dataHora.trim() === '') {
      console.error('❌ ERROR - form.dataHora is empty!')
      errors.dataHora = 'Data e hora são obrigatórias'
      return
    }

    // Convert Brazilian format to ISO 8601 format using centralized function
    let isoDate: string
    try {
      isoDate = convertBrazilianToISO(form.dataHora)
      console.log('✅ DEBUG - ISO date after conversion:', isoDate)
    } catch (conversionError) {
      console.error('❌ ERROR - Date conversion failed:', conversionError)
      errors.dataHora = 'Erro na conversão da data. Verifique o formato.'
      return
    }

    // Send data in the format expected by backend (following the provided example exactly)
    const eventData = {
      nome: form.nome,
      dataHora: isoDate, // Backend expects dataHora, not dataEvento!
      local: form.local,
      categoria: form.categoria,
      ativo: form.ativo
    }
    
    // Only include descricao if it's not empty
    if (form.descricao && form.descricao.trim() !== '') {
      eventData.descricao = form.descricao
    }
    
    console.log('✅ Form data before submission:', form)
    console.log('✅ Event data being sent to API (dataHora format):', eventData)
    console.log('✅ Selected categoria:', form.categoria)
    console.log('✅ dataHora ISO format:', eventData.dataHora)
    console.log('🚀 Final payload being sent to backend:', JSON.stringify(eventData, null, 2))

    if (isEditing.value) {
      const currentEvent = eventsStore.currentEvent
      if (currentEvent) {
        await eventsStore.updateEvent(currentEvent.id, eventData)
      }
    } else {
      const createdEvent = await eventsStore.createEvent(eventData as CreateEventRequest)
      console.log('✅ Event created successfully:', createdEvent)
      console.log('✅ Created event categoria:', createdEvent?.categoria)
    }

    closeModal()
    
    // Reload events to ensure consistency
    try {
      await loadEvents()
    } catch (reloadError) {
      console.warn('Warning: Could not reload events after creation/update:', reloadError)
    }
  } catch (error: any) {
    console.error('❌ Error submitting form:', error)
    console.error('❌ Error response data:', error.response?.data)
    console.error('❌ Full error object:', JSON.stringify(error, null, 2))
    
    // Show specific validation errors to user
    if (error.response?.status === 400 && error.response?.data?.dados) {
      const validationErrors = error.response.data.dados
      console.log('🔍 Validation errors from backend:', validationErrors)
      
      // Map backend validation errors to form fields
      Object.keys(validationErrors).forEach(field => {
        if (field in errors) {
          errors[field as keyof typeof errors] = validationErrors[field]
        }
      })
      
      // Show generic error if no specific field errors
      if (Object.keys(validationErrors).length === 0) {
        errors.nome = 'Erro de validação no servidor. Verifique os dados.'
      }
    } else {
      // Generic error handling
      errors.nome = error.response?.data?.mensagem || 'Erro ao criar evento. Tente novamente.'
    }
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