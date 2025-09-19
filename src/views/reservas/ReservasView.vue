<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestão de Reservas</h1>
          <p class="text-gray-600 mt-1">Gerencie reservas de bilhetes</p>
        </div>
        <BaseButton @click="showCreateModal = true" variant="primary">
          <i class="fas fa-plus mr-2"></i>
          Nova Reserva
        </BaseButton>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BaseInput
          v-model="filters.search"
          label="Buscar"
          placeholder="Nome do cliente..."
          icon="fas fa-search"
        />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Evento</label>
          <select
            v-model="filters.eventoId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os eventos</option>
            <option v-for="evento in eventos" :key="evento.id" :value="evento.id">
              {{ evento.nome }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="ATIVA">Ativa</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="CONVERTIDA">Convertida</option>
            <option value="EXPIRADA">Expirada</option>
          </select>
        </div>
        <div class="flex items-end">
          <BaseButton @click="loadReservas" variant="secondary" class="mr-2">
            <i class="fas fa-search mr-2"></i>
            Buscar
          </BaseButton>
          <BaseButton @click="clearFilters" variant="outline">
            <i class="fas fa-times mr-2"></i>
            Limpar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="bg-white rounded-lg shadow-sm">
      <BaseTable
        :columns="columns"
        :data="filteredReservas"
        :loading="reservasStore.loading"
        empty-message="Nenhuma reserva encontrada"
      >
        <template #cell(evento)="{ row }">
          <div class="text-sm">
            <div class="font-medium">{{ row.evento.nome }}</div>
            <div class="text-gray-500">{{ formatDate(row.evento.dataEvento) }}</div>
          </div>
        </template>
        
        <template #cell(lote)="{ row }">
          <div class="text-sm">
            <div class="font-medium">{{ row.lote.nome }}</div>
            <div class="text-gray-500">{{ formatCurrency(row.lote.preco) }}</div>
          </div>
        </template>
        
        <template #cell(cliente)="{ row }">
          <div class="text-sm">
            <div class="font-medium">{{ row.nomeCliente }}</div>
            <div class="text-gray-500">{{ row.emailCliente }}</div>
          </div>
        </template>
        
        <template #cell(detalhes)="{ row }">
          <div class="text-sm">
            <div>Qtd: <span class="font-medium">{{ row.quantidade }}</span></div>
            <div>Total: <span class="font-medium">{{ formatCurrency(row.valorTotal) }}</span></div>
          </div>
        </template>
        
        <template #cell(status)="{ row }">
          <span 
            :class="{
              'bg-green-100 text-green-800': row.status === 'ATIVA',
              'bg-red-100 text-red-800': row.status === 'CANCELADA',
              'bg-blue-100 text-blue-800': row.status === 'CONVERTIDA',
              'bg-gray-100 text-gray-800': row.status === 'EXPIRADA'
            }"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ getStatusLabel(row.status) }}
          </span>
        </template>
        
        <template #cell(datas)="{ row }">
          <div class="text-sm">
            <div>Reserva: {{ formatDate(row.dataReserva) }}</div>
            <div class="text-gray-500">Expira: {{ formatDate(row.dataExpiracao) }}</div>
            <div v-if="row.dataCancelamento" class="text-red-500">
              Cancelada: {{ formatDate(row.dataCancelamento) }}
            </div>
            <div v-if="row.dataConversao" class="text-blue-500">
              Convertida: {{ formatDate(row.dataConversao) }}
            </div>
          </div>
        </template>
        
        <template #cell(acoes)="{ row }">
          <div class="flex items-center space-x-2">
            <BaseButton
              v-if="row.status === 'ATIVA'"
              @click="convertReserva(row)"
              variant="ghost"
              size="sm"
              title="Converter em Pedido"
              class="text-blue-600 hover:text-blue-700"
            >
              <i class="fas fa-exchange-alt"></i>
            </BaseButton>
            <BaseButton
              v-if="row.status === 'ATIVA'"
              @click="cancelReserva(row)"
              variant="ghost"
              size="sm"
              title="Cancelar"
              class="text-red-600 hover:text-red-700"
            >
              <i class="fas fa-times"></i>
            </BaseButton>
            <BaseButton
              @click="viewReserva(row)"
              variant="ghost"
              size="sm"
              title="Ver Detalhes"
            >
              <i class="fas fa-eye"></i>
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Criar Reserva -->
    <BaseModal
      :show="showCreateModal"
      title="Nova Reserva"
      size="lg"
      @close="closeCreateModal"
    >
      <form @submit.prevent="saveReserva" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Evento *</label>
            <select
              v-model="reservaForm.eventoId"
              @change="loadLotesForEvent"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione um evento</option>
              <option v-for="evento in eventos" :key="evento.id" :value="evento.id">
                {{ evento.nome }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Lote *</label>
            <select
              v-model="reservaForm.loteId"
              @change="updateValorTotal"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione um lote</option>
              <option v-for="lote in lotesDisponiveis" :key="lote.id" :value="lote.id">
                {{ lote.nome }} - {{ formatCurrency(lote.preco) }} ({{ lote.quantidadeDisponivel }} disponíveis)
              </option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model="reservaForm.nomeCliente"
            label="Nome do Cliente"
            placeholder="Nome completo"
            required
            maxlength="200"
            :error="errors.nomeCliente"
          />
          
          <BaseInput
            v-model="reservaForm.emailCliente"
            label="E-mail do Cliente"
            type="email"
            placeholder="email@exemplo.com"
            required
            :error="errors.emailCliente"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model="reservaForm.telefoneCliente"
            label="Telefone"
            placeholder="+351 912 345 678"
            maxlength="20"
          />
          
          <BaseInput
            v-model.number="reservaForm.quantidade"
            label="Quantidade"
            type="number"
            min="1"
            :max="selectedLote?.quantidadeDisponivel || 999"
            required
            @input="updateValorTotal"
            :error="errors.quantidade"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
          <textarea
            v-model="reservaForm.observacoes"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Observações adicionais (opcional)"
            maxlength="1000"
          ></textarea>
        </div>
        
        <div v-if="valorTotal > 0" class="bg-gray-50 p-4 rounded-lg">
          <div class="text-lg font-semibold text-gray-900">
            Valor Total: {{ formatCurrency(valorTotal) }}
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <BaseButton type="button" @click="closeCreateModal" variant="outline">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="reservasStore.loading">
            Criar Reserva
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Modal Detalhes da Reserva -->
    <BaseModal
      :show="showDetailsModal"
      title="Detalhes da Reserva"
      size="md"
      @close="showDetailsModal = false"
    >
      <div v-if="selectedReserva" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">ID da Reserva</label>
            <p class="text-gray-900">{{ selectedReserva.id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Status</label>
            <p>
              <span 
                :class="{
                  'bg-green-100 text-green-800': selectedReserva.status === 'ATIVA',
                  'bg-red-100 text-red-800': selectedReserva.status === 'CANCELADA',
                  'bg-blue-100 text-blue-800': selectedReserva.status === 'CONVERTIDA',
                  'bg-gray-100 text-gray-800': selectedReserva.status === 'EXPIRADA'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ getStatusLabel(selectedReserva.status) }}
              </span>
            </p>
          </div>
        </div>
        
        <div>
          <label class="text-sm font-medium text-gray-700">Evento</label>
          <p class="text-gray-900">{{ selectedReserva.evento.nome }}</p>
          <p class="text-sm text-gray-500">{{ formatDate(selectedReserva.evento.dataEvento) }}</p>
        </div>
        
        <div>
          <label class="text-sm font-medium text-gray-700">Lote</label>
          <p class="text-gray-900">{{ selectedReserva.lote.nome }}</p>
          <p class="text-sm text-gray-500">{{ formatCurrency(selectedReserva.lote.preco) }} cada</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Quantidade</label>
            <p class="text-gray-900">{{ selectedReserva.quantidade }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Valor Total</label>
            <p class="text-gray-900 font-semibold">{{ formatCurrency(selectedReserva.valorTotal) }}</p>
          </div>
        </div>
        
        <div>
          <label class="text-sm font-medium text-gray-700">Cliente</label>
          <p class="text-gray-900">{{ selectedReserva.nomeCliente }}</p>
          <p class="text-sm text-gray-500">{{ selectedReserva.emailCliente }}</p>
          <p v-if="selectedReserva.telefoneCliente" class="text-sm text-gray-500">{{ selectedReserva.telefoneCliente }}</p>
        </div>
        
        <div v-if="selectedReserva.observacoes">
          <label class="text-sm font-medium text-gray-700">Observações</label>
          <p class="text-gray-900">{{ selectedReserva.observacoes }}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Data da Reserva</label>
            <p class="text-gray-900">{{ formatDate(selectedReserva.dataReserva) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Data de Expiração</label>
            <p class="text-gray-900">{{ formatDate(selectedReserva.dataExpiracao) }}</p>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Modal Confirmação Cancelamento -->
    <BaseModal
      :show="showCancelModal"
      title="Confirmar Cancelamento"
      size="sm"
      @close="showCancelModal = false"
    >
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <i class="fas fa-times text-red-600"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Cancelar Reserva
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          Tem certeza que deseja cancelar a reserva de "{{ reservaToCancel?.nomeCliente }}"?
        </p>
        <div class="flex justify-center space-x-3">
          <BaseButton @click="showCancelModal = false" variant="outline">
            Não
          </BaseButton>
          <BaseButton @click="confirmCancel" variant="danger" :loading="reservasStore.loading">
            Sim, Cancelar
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Modal Confirmação Conversão -->
    <BaseModal
      :show="showConvertModal"
      title="Confirmar Conversão"
      size="sm"
      @close="showConvertModal = false"
    >
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <i class="fas fa-exchange-alt text-blue-600"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Converter em Pedido
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          Tem certeza que deseja converter esta reserva em um pedido?
          Esta ação irá gerar os bilhetes correspondentes.
        </p>
        <div class="flex justify-center space-x-3">
          <BaseButton @click="showConvertModal = false" variant="outline">
            Cancelar
          </BaseButton>
          <BaseButton @click="confirmConvert" variant="primary" :loading="reservasStore.loading">
            Converter
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useReservasStore } from '@/stores/reservas'
import { useEventsStore } from '@/stores/events'
import { useLotesStore } from '@/stores/lotes'
import type { Reserva, CreateReservaRequest, Event, Lote } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const reservasStore = useReservasStore()
const eventsStore = useEventsStore()
const lotesStore = useLotesStore()

const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const showCancelModal = ref(false)
const showConvertModal = ref(false)

const selectedReserva = ref<Reserva | null>(null)
const reservaToCancel = ref<Reserva | null>(null)
const reservaToConvert = ref<Reserva | null>(null)

const eventos = ref<Event[]>([])
const lotesDisponiveis = ref<Lote[]>([])
const selectedLote = ref<Lote | null>(null)
const valorTotal = ref(0)

const reservaForm = reactive<CreateReservaRequest>({
  eventoId: 0,
  loteId: 0,
  quantidade: 1,
  nomeCliente: '',
  emailCliente: '',
  telefoneCliente: '',
  observacoes: ''
})

const errors = ref<Record<string, string>>({})
const filters = reactive({
  search: '',
  eventoId: '',
  status: ''
})

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'evento', label: 'Evento', sortable: true },
  { key: 'lote', label: 'Lote' },
  { key: 'cliente', label: 'Cliente', sortable: true },
  { key: 'detalhes', label: 'Detalhes' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'datas', label: 'Datas' },
  { key: 'acoes', label: 'Ações', align: 'right' }
]

const filteredReservas = computed(() => {
  let result = reservasStore.reservas
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(reserva => 
      reserva.nomeCliente.toLowerCase().includes(search) ||
      reserva.emailCliente.toLowerCase().includes(search) ||
      reserva.evento.nome.toLowerCase().includes(search)
    )
  }
  
  if (filters.eventoId) {
    result = result.filter(reserva => reserva.evento.id === parseInt(filters.eventoId))
  }
  
  if (filters.status) {
    result = result.filter(reserva => reserva.status === filters.status)
  }
  
  return result
})

const loadReservas = async () => {
  await reservasStore.fetchReservas()
}

const loadEventos = async () => {
  try {
    const response = await eventsStore.fetchEvents()
    if (Array.isArray(response)) {
      eventos.value = response
    } else {
      eventos.value = response.content
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
  }
}

const loadLotesForEvent = async () => {
  if (!reservaForm.eventoId) {
    lotesDisponiveis.value = []
    return
  }
  
  try {
    lotesDisponiveis.value = await lotesStore.fetchLotesByEvent(reservaForm.eventoId)
    reservaForm.loteId = 0
    selectedLote.value = null
    valorTotal.value = 0
  } catch (error) {
    console.error('Erro ao carregar lotes:', error)
  }
}

const updateValorTotal = () => {
  if (reservaForm.loteId && reservaForm.quantidade) {
    selectedLote.value = lotesDisponiveis.value.find(lote => lote.id === reservaForm.loteId) || null
    if (selectedLote.value) {
      valorTotal.value = selectedLote.value.preco * reservaForm.quantidade
    }
  } else {
    valorTotal.value = 0
  }
}

const clearFilters = () => {
  filters.search = ''
  filters.eventoId = ''
  filters.status = ''
  loadReservas()
}

const resetForm = () => {
  reservaForm.eventoId = 0
  reservaForm.loteId = 0
  reservaForm.quantidade = 1
  reservaForm.nomeCliente = ''
  reservaForm.emailCliente = ''
  reservaForm.telefoneCliente = ''
  reservaForm.observacoes = ''
  lotesDisponiveis.value = []
  selectedLote.value = null
  valorTotal.value = 0
  errors.value = {}
}

const closeCreateModal = () => {
  showCreateModal.value = false
  resetForm()
}

const viewReserva = (reserva: Reserva) => {
  selectedReserva.value = reserva
  showDetailsModal.value = true
}

const cancelReserva = (reserva: Reserva) => {
  reservaToCancel.value = reserva
  showCancelModal.value = true
}

const convertReserva = (reserva: Reserva) => {
  reservaToConvert.value = reserva
  showConvertModal.value = true
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!reservaForm.nomeCliente.trim()) {
    errors.value.nomeCliente = 'Nome é obrigatório'
  }
  
  if (!reservaForm.emailCliente.trim()) {
    errors.value.emailCliente = 'E-mail é obrigatório'
  }
  
  if (reservaForm.quantidade <= 0) {
    errors.value.quantidade = 'Quantidade deve ser maior que zero'
  }
  
  if (selectedLote.value && reservaForm.quantidade > selectedLote.value.quantidadeDisponivel) {
    errors.value.quantidade = 'Quantidade maior que o disponível'
  }
  
  return Object.keys(errors.value).length === 0
}

const saveReserva = async () => {
  if (!validateForm()) return
  
  try {
    await reservasStore.createReserva(reservaForm)
    closeCreateModal()
  } catch (error) {
    console.error('Erro ao criar reserva:', error)
  }
}

const confirmCancel = async () => {
  if (!reservaToCancel.value) return
  
  try {
    await reservasStore.cancelReserva(reservaToCancel.value.id)
    showCancelModal.value = false
    reservaToCancel.value = null
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error)
  }
}

const confirmConvert = async () => {
  if (!reservaToConvert.value) return
  
  try {
    await reservasStore.convertReserva(reservaToConvert.value.id)
    showConvertModal.value = false
    reservaToConvert.value = null
  } catch (error) {
    console.error('Erro ao converter reserva:', error)
  }
}

const getStatusLabel = (status: string) => {
  const labels = {
    'ATIVA': 'Ativa',
    'CANCELADA': 'Cancelada',
    'CONVERTIDA': 'Convertida',
    'EXPIRADA': 'Expirada'
  }
  return labels[status] || status
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value).replace('AOA', 'Kz')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([
    loadReservas(),
    loadEventos()
  ])
})
</script>