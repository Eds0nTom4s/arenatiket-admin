<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Relatórios de Vendas</h1>
      <p class="text-gray-600 mt-1">Análise completa de vendas e performance</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <form @submit.prevent="generateReport" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BaseInput
          v-model="filters.dataInicio"
          label="Data Início"
          type="date"
          required
        />
        
        <BaseInput
          v-model="filters.dataFim"
          label="Data Fim"
          type="date"
          required
        />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Evento (Opcional)</label>
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
        
        <div class="flex items-end">
          <BaseButton type="submit" variant="primary" :loading="reportsStore.loading" class="w-full">
            <i class="fas fa-chart-line mr-2"></i>
            Gerar Relatório
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Dashboard Stats -->
    <div v-if="dashboardStats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <i class="fas fa-calendar-alt"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total de Eventos</dt>
              <dd class="text-lg font-medium text-gray-900">{{ dashboardStats.totalEventos }}</dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
              <i class="fas fa-ticket-alt"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Bilhetes Vendidos</dt>
              <dd class="text-lg font-medium text-gray-900">{{ dashboardStats.totalBilhetesVendidos }}</dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
              <i class="fas fa-euro-sign"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Receita Total</dt>
              <dd class="text-lg font-medium text-gray-900">{{ formatCurrency(dashboardStats.valorTotalVendas) }}</dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
              <i class="fas fa-users"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Usuários Ativos</dt>
              <dd class="text-lg font-medium text-gray-900">{{ dashboardStats.usuariosAtivos }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Relatórios -->
    <div v-if="salesReport" class="space-y-8">
      <!-- Resumo do Período -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Resumo do Período</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ salesReport.resumo.totalBilhetesVendidos }}</div>
            <div class="text-sm text-gray-500">Bilhetes Vendidos</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ formatCurrency(salesReport.resumo.valorTotalVendas) }}</div>
            <div class="text-sm text-gray-500">Receita Total</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ formatCurrency(salesReport.resumo.ticketMedio) }}</div>
            <div class="text-sm text-gray-500">Ticket Médio</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ salesReport.resumo.eventosComVendas }}</div>
            <div class="text-sm text-gray-500">Eventos com Vendas</div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Vendas por Dia -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Vendas por Dia</h3>
          <div class="h-80">
            <canvas ref="salesByDayChart"></canvas>
          </div>
        </div>

        <!-- Vendas por Evento -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Vendas por Evento</h3>
          <div class="h-80">
            <canvas ref="salesByEventChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Tabela de Vendas por Evento -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Detalhamento por Evento</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bilhetes Vendidos
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocupação
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="venda in salesReport.vendasPorEvento" :key="venda.eventoId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ venda.nomeEvento }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ venda.bilhetesVendidos }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCurrency(venda.valorVendas) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        :style="{ width: venda.percentualOcupacao + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-500">{{ venda.percentualOcupacao.toFixed(1) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <BaseButton
                    @click="viewEventReport(venda.eventoId)"
                    variant="ghost"
                    size="sm"
                  >
                    <i class="fas fa-eye mr-1"></i>
                    Ver Detalhes
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ações do Relatório -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Ações</h3>
          <div class="flex space-x-3">
            <BaseButton @click="exportReport" variant="outline">
              <i class="fas fa-download mr-2"></i>
              Exportar PDF
            </BaseButton>
            <BaseButton @click="exportReportExcel" variant="outline">
              <i class="fas fa-file-excel mr-2"></i>
              Exportar Excel
            </BaseButton>
            <BaseButton @click="printReport" variant="secondary">
              <i class="fas fa-print mr-2"></i>
              Imprimir
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Inicial -->
    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <i class="fas fa-chart-line text-2xl text-blue-600"></i>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Gerar Relatório de Vendas</h2>
      <p class="text-gray-600 mb-4">
        Selecione o período desejado e clique em "Gerar Relatório" para visualizar os dados de vendas.
      </p>
      <p class="text-sm text-gray-500">
        Você poderá visualizar gráficos, tabelas e exportar os dados em diferentes formatos.
      </p>
    </div>

    <!-- Modal Relatório de Evento -->
    <BaseModal
      :show="showEventReportModal"
      title="Relatório do Evento"
      size="xl"
      @close="showEventReportModal = false"
    >
      <div v-if="eventReport" class="space-y-6">
        <!-- Cabeçalho do Evento -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900">{{ eventReport.evento.nome }}</h3>
          <p class="text-sm text-gray-600">{{ formatDate(eventReport.evento.dataEvento) }} - {{ eventReport.evento.local }}</p>
          <p class="text-sm text-gray-500 mt-1">Capacidade: {{ eventReport.evento.capacidadeTotal }}</p>
        </div>

        <!-- Resumo do Evento -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ eventReport.resumo.bilhetesVendidos }}</div>
            <div class="text-xs text-gray-500">Vendidos</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600">{{ eventReport.resumo.bilhetesDisponiveis }}</div>
            <div class="text-xs text-gray-500">Disponíveis</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatCurrency(eventReport.resumo.valorTotalVendas) }}</div>
            <div class="text-xs text-gray-500">Receita</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ eventReport.resumo.percentualOcupacao.toFixed(1) }}%</div>
            <div class="text-xs text-gray-500">Ocupação</div>
          </div>
        </div>

        <!-- Vendas por Lote -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-3">Vendas por Lote</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendidos</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receita</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="lote in eventReport.vendasPorLote" :key="lote.loteId">
                  <td class="px-4 py-2 text-sm font-medium text-gray-900">{{ lote.nomeLote }}</td>
                  <td class="px-4 py-2 text-sm text-gray-500">{{ lote.quantidadeVendida }}</td>
                  <td class="px-4 py-2 text-sm text-gray-500">{{ lote.quantidadeTotal }}</td>
                  <td class="px-4 py-2 text-sm text-gray-500">{{ formatCurrency(lote.valorVendas) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-500">{{ lote.percentualVendido.toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import { useReportsStore } from '@/stores/reports'
import { useEventsStore } from '@/stores/events'
import type { SalesReport, RelatorioEvento, Event, DashboardStats } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

const reportsStore = useReportsStore()
const eventsStore = useEventsStore()

// Estado
const eventos = ref<Event[]>([])
const salesReport = ref<SalesReport | null>(null)
const eventReport = ref<RelatorioEvento | null>(null)
const dashboardStats = ref<DashboardStats | null>(null)
const showEventReportModal = ref(false)

// Referências dos gráficos
const salesByDayChart = ref<HTMLCanvasElement | null>(null)
const salesByEventChart = ref<HTMLCanvasElement | null>(null)
let salesByDayChartInstance: Chart | null = null
let salesByEventChartInstance: Chart | null = null

// Filtros
const filters = reactive({
  dataInicio: '',
  dataFim: '',
  eventoId: ''
})

// Methods
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

const loadDashboardStats = async () => {
  try {
    dashboardStats.value = await reportsStore.fetchDashboardStats()
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
  }
}

const generateReport = async () => {
  try {
    const params = {
      dataInicio: filters.dataInicio,
      dataFim: filters.dataFim,
      eventoId: filters.eventoId ? parseInt(filters.eventoId) : undefined
    }
    
    salesReport.value = await reportsStore.fetchSalesReport(params)
    
    // Aguardar o DOM atualizar antes de criar os gráficos
    await nextTick()
    createCharts()
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
  }
}

const createCharts = () => {
  if (salesReport.value) {
    createSalesByDayChart()
    createSalesByEventChart()
  }
}

const createSalesByDayChart = () => {
  if (!salesByDayChart.value || !salesReport.value) return
  
  // Destruir gráfico existente
  if (salesByDayChartInstance) {
    salesByDayChartInstance.destroy()
  }
  
  const ctx = salesByDayChart.value.getContext('2d')
  if (!ctx) return
  
  const data = salesReport.value.vendasPorDia
  
  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: data.map(item => formatChartDate(item.data)),
      datasets: [{
        label: 'Receita (€)',
        data: data.map(item => item.valorVendas),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Bilhetes Vendidos',
        data: data.map(item => item.bilhetesVendidos),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Receita (€)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Bilhetes'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  }
  
  salesByDayChartInstance = new Chart(ctx, config)
}

const createSalesByEventChart = () => {
  if (!salesByEventChart.value || !salesReport.value) return
  
  // Destruir gráfico existente
  if (salesByEventChartInstance) {
    salesByEventChartInstance.destroy()
  }
  
  const ctx = salesByEventChart.value.getContext('2d')
  if (!ctx) return
  
  const data = salesReport.value.vendasPorEvento.slice(0, 10) // Top 10 eventos
  
  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: data.map(item => item.nomeEvento),
      datasets: [{
        data: data.map(item => item.valorVendas),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed
              return context.label + ': ' + formatCurrency(value)
            }
          }
        }
      }
    }
  }
  
  salesByEventChartInstance = new Chart(ctx, config)
}

const viewEventReport = async (eventoId: number) => {
  try {
    eventReport.value = await reportsStore.fetchEventReport(eventoId)
    showEventReportModal.value = true
  } catch (error) {
    console.error('Erro ao carregar relatório do evento:', error)
  }
}

const exportReport = () => {
  window.print()
}

const exportReportExcel = () => {
  // Implementar exportação para Excel
  console.log('Exportar para Excel')
}

const printReport = () => {
  window.print()
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

const formatChartDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

// Inicializar datas padrão (último mês)
const initializeDefaultDates = () => {
  const hoje = new Date()
  const mesPassado = new Date()
  mesPassado.setMonth(mesPassado.getMonth() - 1)
  
  filters.dataFim = hoje.toISOString().split('T')[0]
  filters.dataInicio = mesPassado.toISOString().split('T')[0]
}

// Mounted
onMounted(async () => {
  initializeDefaultDates()
  await Promise.all([
    loadEventos(),
    loadDashboardStats()
  ])
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none;
  }
}
</style>