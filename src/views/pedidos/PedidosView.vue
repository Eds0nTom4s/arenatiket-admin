<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestão de Pedidos</h1>
          <p class="text-gray-600 mt-1">Acompanhe todos os pedidos do sistema</p>
        </div>
        <div class="flex space-x-2">
          <BaseButton @click="refreshOrders" variant="outline">
            <i class="fas fa-sync mr-2"></i>
            Atualizar
          </BaseButton>
          <BaseButton @click="exportOrders" variant="secondary">
            <i class="fas fa-download mr-2"></i>
            Exportar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <BaseInput
          v-model="filters.search"
          label="Buscar"
          placeholder="ID, nome, email..."
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
            <option value="PENDENTE">Pendente</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="REEMBOLSADO">Reembolsado</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Período</label>
          <select
            v-model="filters.periodo"
            @change="applyPeriodFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>
        <div class="flex items-end">
          <BaseButton @click="loadOrders" variant="secondary" class="mr-2">
            <i class="fas fa-search mr-2"></i>
            Buscar
          </BaseButton>
          <BaseButton @click="clearFilters" variant="outline">
            <i class="fas fa-times mr-2"></i>
            Limpar
          </BaseButton>
        </div>
      </div>
      
      <!-- Filtro de data personalizado -->
      <div v-if="filters.periodo === 'personalizado'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <BaseInput
          v-model="filters.dataInicio"
          label="Data Início"
          type="date"
        />
        <BaseInput
          v-model="filters.dataFim"
          label="Data Fim"
          type="date"
        />
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <i class="fas fa-shopping-cart"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total de Pedidos</dt>
              <dd class="text-lg font-medium text-gray-900">{{ stats.totalPedidos }}</dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
              <i class="fas fa-euro-sign"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
              <dd class="text-lg font-medium text-gray-900">{{ formatCurrency(stats.valorTotal) }}</dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
              <i class="fas fa-clock"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Pendentes</dt>
              <dd class="text-lg font-medium text-gray-900">{{ stats.pedidosPendentes }}</dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
              <i class="fas fa-ticket-alt"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Bilhetes Vendidos</dt>
              <dd class="text-lg font-medium text-gray-900">{{ stats.bilhetesVendidos }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Pedidos -->
    <div class="bg-white rounded-lg shadow-sm">
      <BaseTable
        :columns="columns"
        :data="filteredOrders"
        :loading="pedidosStore.loading"
        empty-message="Nenhum pedido encontrado"
      >
        <template #cell(evento)="{ row }">
          <div class="text-sm">
            <div class="font-medium">{{ row.evento.nome }}</div>
            <div class="text-gray-500">{{ formatDate(row.evento.dataEvento) }}</div>
          </div>
        </template>
        
        <template #cell(usuario)="{ row }">
          <div class="text-sm">
            <div class="font-medium">{{ row.usuario.nome }}</div>
            <div class="text-gray-500">{{ row.usuario.email }}</div>
          </div>
        </template>
        
        <template #cell(itens)="{ row }">
          <div class="text-sm">
            <div v-for="item in row.itens" :key="item.id" class="mb-1">
              <span class="font-medium">{{ item.lote.nome }}</span>
              <span class="text-gray-500">- {{ item.quantidade }}x {{ formatCurrency(item.precoUnitario) }}</span>
            </div>
          </div>
        </template>
        
        <template #cell(valorTotal)="{ row }">
          <span class="font-semibold text-lg">{{ formatCurrency(row.valorTotal) }}</span>
        </template>
        
        <template #cell(status)="{ row }">
          <span 
            :class="{
              'bg-yellow-100 text-yellow-800': row.status === 'PENDENTE',
              'bg-green-100 text-green-800': row.status === 'CONFIRMADO',
              'bg-red-100 text-red-800': row.status === 'CANCELADO',
              'bg-gray-100 text-gray-800': row.status === 'REEMBOLSADO'
            }"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ getStatusLabel(row.status) }}
          </span>
        </template>
        
        <template #cell(datas)="{ row }">
          <div class="text-sm">
            <div>Pedido: {{ formatDate(row.dataPedido) }}</div>
            <div v-if="row.dataConfirmacao" class="text-green-600">
              Confirmado: {{ formatDate(row.dataConfirmacao) }}
            </div>
            <div v-if="row.dataCancelamento" class="text-red-600">
              Cancelado: {{ formatDate(row.dataCancelamento) }}
            </div>
          </div>
        </template>
        
        <template #cell(bilhetes)="{ row }">
          <div class="text-sm">
            <span class="font-medium">{{ row.bilhetes?.length || 0 }}</span>
            <span class="text-gray-500">bilhete(s)</span>
          </div>
        </template>
        
        <template #cell(acoes)="{ row }">
          <div class="flex items-center space-x-2">
            <BaseButton
              @click="viewOrder(row)"
              variant="ghost"
              size="sm"
              title="Ver Detalhes"
            >
              <i class="fas fa-eye"></i>
            </BaseButton>
            <BaseButton
              v-if="row.status === 'PENDENTE'"
              @click="confirmOrder(row)"
              variant="ghost"
              size="sm"
              title="Confirmar"
              class="text-green-600 hover:text-green-700"
            >
              <i class="fas fa-check"></i>
            </BaseButton>
            <BaseButton
              v-if="['PENDENTE', 'CONFIRMADO'].includes(row.status)"
              @click="cancelOrder(row)"
              variant="ghost"
              size="sm"
              title="Cancelar"
              class="text-red-600 hover:text-red-700"
            >
              <i class="fas fa-times"></i>
            </BaseButton>
            <BaseButton
              @click="printOrder(row)"
              variant="ghost"
              size="sm"
              title="Imprimir"
            >
              <i class="fas fa-print"></i>
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Detalhes do Pedido -->
    <BaseModal
      :show="showDetailsModal"
      title="Detalhes do Pedido"
      size="lg"
      @close="showDetailsModal = false"
    >
      <div v-if="selectedOrder" class="space-y-6">
        <!-- Cabeçalho do Pedido -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">ID do Pedido</label>
              <p class="text-lg font-semibold text-gray-900">#{{ selectedOrder.id }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Status</label>
              <p>
                <span 
                  :class="{
                    'bg-yellow-100 text-yellow-800': selectedOrder.status === 'PENDENTE',
                    'bg-green-100 text-green-800': selectedOrder.status === 'CONFIRMADO',
                    'bg-red-100 text-red-800': selectedOrder.status === 'CANCELADO',
                    'bg-gray-100 text-gray-800': selectedOrder.status === 'REEMBOLSADO'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Informações do Evento e Cliente -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Evento</h3>
            <div class="space-y-2">
              <p class="font-medium">{{ selectedOrder.evento.nome }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(selectedOrder.evento.dataEvento) }}</p>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Cliente</h3>
            <div class="space-y-2">
              <p class="font-medium">{{ selectedOrder.usuario.nome }}</p>
              <p class="text-sm text-gray-600">{{ selectedOrder.usuario.email }}</p>
            </div>
          </div>
        </div>

        <!-- Itens do Pedido -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Itens do Pedido</h3>
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in selectedOrder.itens" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ item.lote.nome }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.quantidade }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatCurrency(item.precoUnitario) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ formatCurrency(item.precoTotal) }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Total do Pedido:
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                    {{ formatCurrency(selectedOrder.valorTotal) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Bilhetes (se houver) -->
        <div v-if="selectedOrder.bilhetes && selectedOrder.bilhetes.length > 0">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Bilhetes Gerados</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="bilhete in selectedOrder.bilhetes"
              :key="bilhete.id"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">Bilhete #{{ bilhete.id }}</p>
                  <p class="text-sm text-gray-600">{{ bilhete.codigoQR }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ bilhete.status }}</p>
                </div>
                <BaseButton
                  @click="printTicket(bilhete)"
                  variant="outline"
                  size="sm"
                >
                  <i class="fas fa-print"></i>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Observações -->
        <div v-if="selectedOrder.observacoes">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Observações</h3>
          <p class="text-gray-700">{{ selectedOrder.observacoes }}</p>
        </div>

        <!-- Histórico -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Histórico</h3>
          <div class="space-y-2">
            <div class="flex items-center text-sm">
              <i class="fas fa-plus text-blue-500 mr-2"></i>
              <span>Pedido criado em {{ formatDate(selectedOrder.dataPedido) }}</span>
            </div>
            <div v-if="selectedOrder.dataConfirmacao" class="flex items-center text-sm">
              <i class="fas fa-check text-green-500 mr-2"></i>
              <span>Confirmado em {{ formatDate(selectedOrder.dataConfirmacao) }}</span>
            </div>
            <div v-if="selectedOrder.dataCancelamento" class="flex items-center text-sm">
              <i class="fas fa-times text-red-500 mr-2"></i>
              <span>Cancelado em {{ formatDate(selectedOrder.dataCancelamento) }}</span>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <BaseButton @click="printOrder(selectedOrder)" variant="outline">
            <i class="fas fa-print mr-2"></i>
            Imprimir Pedido
          </BaseButton>
          <BaseButton @click="showDetailsModal = false" variant="primary">
            Fechar
          </BaseButton>
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
          <i class="fas fa-exclamation-triangle text-red-600"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Cancelar Pedido
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          Tem certeza que deseja cancelar o pedido #{{ orderToCancel?.id }}?
          Esta ação não pode ser desfeita.
        </p>
        <div class="flex justify-center space-x-3">
          <BaseButton @click="showCancelModal = false" variant="outline">
            Não
          </BaseButton>
          <BaseButton @click="confirmCancelOrder" variant="danger" :loading="pedidosStore.loading">
            Sim, Cancelar
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { usePedidosStore } from '@/stores/pedidos'
import { useEventsStore } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import type { Pedido, Event, Ticket } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const pedidosStore = usePedidosStore()
const eventsStore = useEventsStore()
const authStore = useAuthStore()

// Estado
const eventos = ref<Event[]>([])
const showDetailsModal = ref(false)
const showCancelModal = ref(false)
const selectedOrder = ref<Pedido | null>(null)
const orderToCancel = ref<Pedido | null>(null)

// Filtros
const filters = reactive({
  search: '',
  eventoId: '',
  status: '',
  periodo: '',
  dataInicio: '',
  dataFim: ''
})

// Estatísticas
const stats = reactive({
  totalPedidos: 0,
  valorTotal: 0,
  pedidosPendentes: 0,
  bilhetesVendidos: 0
})

// Colunas da tabela
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'evento', label: 'Evento', sortable: true },
  { key: 'usuario', label: 'Cliente', sortable: true },
  { key: 'itens', label: 'Itens' },
  { key: 'valorTotal', label: 'Valor Total', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'datas', label: 'Datas' },
  { key: 'bilhetes', label: 'Bilhetes' },
  { key: 'acoes', label: 'Ações', align: 'right' }
]

// Computeds
const filteredOrders = computed(() => {
  let result = authStore.isAdmin ? pedidosStore.pedidos : pedidosStore.myOrders
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(pedido => 
      pedido.id.toString().includes(search) ||
      pedido.usuario.nome.toLowerCase().includes(search) ||
      pedido.usuario.email.toLowerCase().includes(search) ||
      pedido.evento.nome.toLowerCase().includes(search)
    )
  }
  
  if (filters.eventoId) {
    result = result.filter(pedido => pedido.evento.id === parseInt(filters.eventoId))
  }
  
  if (filters.status) {
    result = result.filter(pedido => pedido.status === filters.status)
  }
  
  if (filters.dataInicio && filters.dataFim) {
    const inicio = new Date(filters.dataInicio)
    const fim = new Date(filters.dataFim)
    result = result.filter(pedido => {
      const dataPedido = new Date(pedido.dataPedido)
      return dataPedido >= inicio && dataPedido <= fim
    })
  }
  
  return result.sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime())
})

// Methods
const loadOrders = async () => {
  if (authStore.isAdmin) {
    await pedidosStore.fetchAllOrders(filters)
  } else {
    await pedidosStore.fetchMyOrders()
  }
  updateStats()
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

const updateStats = () => {
  const orders = filteredOrders.value
  stats.totalPedidos = orders.length
  stats.valorTotal = orders.reduce((sum, pedido) => sum + pedido.valorTotal, 0)
  stats.pedidosPendentes = orders.filter(pedido => pedido.status === 'PENDENTE').length
  stats.bilhetesVendidos = orders.reduce((sum, pedido) => sum + (pedido.bilhetes?.length || 0), 0)
}

const applyPeriodFilter = () => {
  const hoje = new Date()
  
  switch (filters.periodo) {
    case 'hoje':
      filters.dataInicio = hoje.toISOString().split('T')[0]
      filters.dataFim = hoje.toISOString().split('T')[0]
      break
    case 'semana':
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - hoje.getDay())
      filters.dataInicio = inicioSemana.toISOString().split('T')[0]
      filters.dataFim = hoje.toISOString().split('T')[0]
      break
    case 'mes':
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      filters.dataInicio = inicioMes.toISOString().split('T')[0]
      filters.dataFim = hoje.toISOString().split('T')[0]
      break
    default:
      filters.dataInicio = ''
      filters.dataFim = ''
  }
}

const clearFilters = () => {
  filters.search = ''
  filters.eventoId = ''
  filters.status = ''
  filters.periodo = ''
  filters.dataInicio = ''
  filters.dataFim = ''
  loadOrders()
}

const refreshOrders = () => {
  loadOrders()
}

const viewOrder = (order: Pedido) => {
  selectedOrder.value = order
  showDetailsModal.value = true
}

const confirmOrder = async (order: Pedido) => {
  // Implementar confirmação de pedido se necessário
  console.log('Confirmar pedido:', order.id)
}

const cancelOrder = (order: Pedido) => {
  orderToCancel.value = order
  showCancelModal.value = true
}

const confirmCancelOrder = async () => {
  if (!orderToCancel.value) return
  
  try {
    await pedidosStore.cancelOrder(orderToCancel.value.id)
    showCancelModal.value = false
    orderToCancel.value = null
    await loadOrders()
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error)
  }
}

const printOrder = (order: Pedido) => {
  // Implementar impressão de pedido
  console.log('Imprimir pedido:', order.id)
  window.print()
}

const printTicket = (ticket: Ticket) => {
  // Implementar impressão de bilhete
  console.log('Imprimir bilhete:', ticket.id)
}

const exportOrders = () => {
  // Implementar exportação de pedidos
  console.log('Exportar pedidos')
}

const getStatusLabel = (status: string) => {
  const labels = {
    'PENDENTE': 'Pendente',
    'CONFIRMADO': 'Confirmado',
    'CANCELADO': 'Cancelado',
    'REEMBOLSADO': 'Reembolsado'
  }
  return labels[status] || status
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
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

// Mounted
onMounted(async () => {
  await Promise.all([
    loadOrders(),
    loadEventos()
  ])
})
</script>