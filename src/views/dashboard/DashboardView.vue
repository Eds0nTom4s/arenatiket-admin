<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Bem-vindo, {{ user?.nome }}!
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            Aqui está um resumo das atividades do sistema.
          </p>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ currentDate }}</span>
        </div>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Available Tickets -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 9a3 3 0 010-6h1.4l2.6 2.6L8.6 3H12v7l-4 4v1h8v-1l-4-4V3h3.4l2.6 2.6L20.6 3H22a3 3 0 010 6"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Bilhetes Disponíveis
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ formatNumber(ticketCounts.DISPONIVEL || 0) }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <!-- Sold Tickets -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 9a3 3 0 010-6h1.4l2.6 2.6L8.6 3H12v7l-4 4v1h8v-1l-4-4V3h3.4l2.6 2.6L20.6 3H22a3 3 0 010 6"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Bilhetes Vendidos
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ formatNumber(ticketCounts.VENDIDO || 0) }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <!-- Used Tickets -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Bilhetes Usados
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ formatNumber(ticketCounts.USADO || 0) }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <!-- Cancelled Tickets -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6"/>
                <path d="M9 9l6 6"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Bilhetes Cancelados
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ formatNumber(ticketCounts.CANCELADO || 0) }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <!-- Active Events -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Eventos Ativos
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ activeEventsCount }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Recent Events -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Eventos Recentes</h3>
          <router-link
            to="/eventos"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos
          </router-link>
        </div>
        
        <div v-if="eventsLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
        
        <div v-else-if="recentEvents.length === 0" class="text-center py-4 text-gray-500">
          <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p class="text-sm">Nenhum evento encontrado</p>
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="event in recentEvents"
            :key="event.id"
            class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            @click="$router.push(`/eventos/${event.id}`)"
          >
            <div class="flex-shrink-0">
              <div
                class="w-3 h-3 rounded-full"
                :class="getEventStatusColor(event.status)"
              />
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ event.nome }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ formatEventDate(event.dataEvento) }} • {{ event.local }}
              </p>
            </div>
            <div class="ml-3 text-xs text-gray-400">
              {{ event.bilhetesVendidos }}/{{ event.capacidadeTotal }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions Panel -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        
        <div class="space-y-3">
          <!-- Create Event (Admin only) -->
          <router-link
            v-if="authStore.isAdmin"
            to="/eventos?action=create"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center group-hover:bg-primary-200">
                <svg class="w-4 h-4 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">Criar Evento</p>
              <p class="text-xs text-gray-500">Adicionar novo evento ao sistema</p>
            </div>
          </router-link>
          
          <!-- Validate Tickets -->
          <router-link
            v-if="authStore.hasAnyPermission(['ADMIN', 'PORTEIRO'])"
            to="/validacao"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center group-hover:bg-green-200">
                <svg class="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">Validar Bilhetes</p>
              <p class="text-xs text-gray-500">Escaneie códigos QR para validação</p>
            </div>
          </router-link>
          
          <!-- View Reports -->
          <router-link
            v-if="authStore.isAdmin"
            to="/relatorios"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center group-hover:bg-blue-200">
                <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">Relatórios</p>
              <p class="text-xs text-gray-500">Visualizar relatórios de vendas</p>
            </div>
          </router-link>
          
          <!-- Manage Users -->
          <router-link
            v-if="authStore.isAdmin"
            to="/usuarios"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center group-hover:bg-yellow-200">
                <svg class="w-4 h-4 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">Gerenciar Usuários</p>
              <p class="text-xs text-gray-500">Administrar usuários do sistema</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useEventsStore } from '@/stores/events'
import { useTicketsStore } from '@/stores/tickets'

const authStore = useAuthStore()
const eventsStore = useEventsStore()
const ticketsStore = useTicketsStore()

const { user } = storeToRefs(authStore)
const { events, loading: eventsLoading } = storeToRefs(eventsStore)
const { ticketCounts } = storeToRefs(ticketsStore)

// Computed
const currentDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const recentEvents = computed(() => {
  return events.value?.slice(0, 5) || []
})

const activeEventsCount = computed(() => {
  if (!events.value || !Array.isArray(events.value)) return 0
  return events.value.filter(event => event.status === 'ATIVO').length
})

// Methods
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('pt-BR').format(num)
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

const getEventStatusColor = (status: string) => {
  const colors = {
    ATIVO: 'bg-green-400',
    INATIVO: 'bg-gray-400',
    ESGOTADO: 'bg-red-400'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-400'
}

// Load data on mount
onMounted(async () => {
  try {
    // Load recent events
    await eventsStore.fetchEvents({ page: 0, size: 10, status: 'ATIVO' })
    
    // Load ticket counts
    await ticketsStore.fetchTicketCounts()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>