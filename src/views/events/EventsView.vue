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
      :show-edit="authStore.isAdmin"
      :show-delete="false"
      empty-title="Nenhum evento encontrado"
      empty-message="Não há eventos cadastrados no sistema."
      @edit="openEditModal"
      @page-change="changePage"
    >
      <!-- Custom cell for status -->
      <template #cell(status)="{ value }">
        <span
          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
          :class="getStatusClass(value)"
        >
          {{ value }}
        </span>
      </template>
      
      <!-- Custom cell for event date -->
      <template #cell(dataEvento)="{ value }">
        <span class="text-sm text-gray-900">
          {{ formatEventDate(value) }}
        </span>
      </template>
      
      <!-- Custom cell for capacity -->
      <template #cell(capacidade)="{ item }">
        <div class="text-sm">
          <div class="text-gray-900">{{ item.bilhetesVendidos }}/{{ item.capacidadeTotal }}</div>
          <div class="text-gray-500">{{ getOccupancyPercentage(item) }}%</div>
        </div>
      </template>
      
      <!-- Custom actions -->
      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
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
          
          <!-- Event Date -->
          <BaseInput
            v-model="form.dataEvento"
            type="datetime-local"
            label="Data e Hora"
            required
            :error-message="errors.dataEvento"
          />
          
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
  dataEvento: '',
  local: '',
  categoria: '',
  capacidadeTotal: 0,
  imagemUrl: ''
})

// Form errors
const errors = reactive({
  nome: '',
  descricao: '',
  dataEvento: '',
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
  { key: 'capacidade', label: 'Ocupação' }
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
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  if (event.capacidadeTotal === 0) return 0
  return Math.round((event.bilhetesVendidos / event.capacidadeTotal) * 100)
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
  form.dataEvento = event.dataEvento.substring(0, 16) // Format for datetime-local
  form.local = event.local
  form.categoria = event.categoria
  form.capacidadeTotal = event.capacidadeTotal
  form.imagemUrl = event.imagemUrl || ''
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
  form.dataEvento = ''
  form.local = ''
  form.categoria = ''
  form.capacidadeTotal = 0
  form.imagemUrl = ''
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

  if (!form.dataEvento) {
    errors.dataEvento = 'Data e hora são obrigatórias'
    isValid = false
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

    const eventData = {
      ...form,
      dataEvento: new Date(form.dataEvento).toISOString()
    }

    if (isEditing.value) {
      const currentEvent = eventsStore.currentEvent
      if (currentEvent) {
        await eventsStore.updateEvent(currentEvent.id, eventData)
      }
    } else {
      await eventsStore.createEvent(eventData as CreateEventRequest)
    }

    closeModal()
    await loadEvents()
  } catch (error: any) {
    console.error('Error submitting form:', error)
  } finally {
    formLoading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadEvents()
})
</script>