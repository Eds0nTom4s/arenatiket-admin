<template>
  <div class="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
    <!-- Header -->
    <div
      v-if="showHeader"
      class="bg-gray-50 px-6 py-3 border-b border-gray-200"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900">
          <slot name="title">{{ title }}</slot>
        </h3>
        
        <div class="flex items-center space-x-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
    
    <!-- Filters -->
    <div
      v-if="showFilters"
      class="bg-gray-50 px-6 py-3 border-b border-gray-200"
    >
      <slot name="filters" />
    </div>
    
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="flex items-center space-x-2 text-gray-500">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
        <span class="text-sm">Carregando...</span>
      </div>
    </div>
    
    <!-- Empty State -->
    <div
      v-else-if="!loading && (!data || data.length === 0)"
      class="text-center py-12"
    >
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-gray-900 mb-1">{{ emptyTitle }}</h3>
      <p class="text-sm text-gray-500">{{ emptyMessage }}</p>
    </div>
    
    <!-- Table -->
    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Table Header -->
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              :class="column.headerClass"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                
                <!-- Sortable indicator -->
                <button
                  v-if="column.sortable"
                  @click="handleSort(column.key)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
                  </svg>
                </button>
              </div>
            </th>
            
            <!-- Actions column -->
            <th
              v-if="showActions"
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ações
            </th>
          </tr>
        </thead>
        
        <!-- Table Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, index) in (data || [])"
            :key="getRowKey(item, index)"
            class="hover:bg-gray-50 transition-colors"
            :class="getRowClass(item, index)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap"
              :class="column.cellClass"
            >
              <slot
                :name="`cell(${column.key})`"
                :item="item"
                :row="item"
                :value="getColumnValue(item, column.key)"
                :index="index"
              >
                <span class="text-sm text-gray-900">
                  {{ getColumnValue(item, column.key) }}
                </span>
              </slot>
            </td>
            
            <!-- Actions cell -->
            <td
              v-if="showActions"
              class="px-6 py-4 whitespace-nowrap text-right text-sm"
            >
              <slot
                name="actions"
                :item="item"
                :row="item"
                :index="index"
              >
                <div class="flex items-center justify-end space-x-2">
                  <button
                    v-if="showEdit"
                    @click="$emit('edit', item)"
                    class="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    Editar
                  </button>
                  
                  <button
                    v-if="showDelete"
                    @click="$emit('delete', item)"
                    class="text-red-600 hover:text-red-900 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div
      v-if="showPagination && pagination"
      class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="pagination.page === 0"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          <button
            @click="nextPage"
            :disabled="pagination.page >= pagination.totalPages - 1"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
        
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ (pagination.page * pagination.size) + 1 }}</span>
              até
              <span class="font-medium">{{ Math.min((pagination.page + 1) * pagination.size, pagination.totalElements) }}</span>
              de
              <span class="font-medium">{{ pagination.totalElements }}</span>
              resultados
            </p>
          </div>
          
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="previousPage"
                :disabled="pagination.page === 0"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <button
                @click="nextPage"
                :disabled="pagination.page >= pagination.totalPages - 1"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  headerClass?: string
  cellClass?: string
}

interface Pagination {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

interface Props {
  title?: string
  columns: Column[]
  data?: any[]
  loading?: boolean
  showHeader?: boolean
  showFilters?: boolean
  showActions?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showPagination?: boolean
  pagination?: Pagination
  emptyTitle?: string
  emptyMessage?: string
  rowKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  data: () => [],
  loading: false,
  showHeader: true,
  showFilters: false,
  showActions: true,
  showEdit: true,
  showDelete: true,
  showPagination: true,
  emptyTitle: 'Nenhum resultado encontrado',
  emptyMessage: 'Não há dados para exibir.',
  rowKey: 'id'
})

const emit = defineEmits<{
  'edit': [item: any]
  'delete': [item: any]
  'sort': [column: string, direction: 'asc' | 'desc']
  'page-change': [page: number]
}>()

// Computed
const getColumnValue = (item: any, key: string) => {
  if (!item) return ''
  return key.split('.').reduce((obj, prop) => obj?.[prop], item) || ''
}

const getRowKey = (item: any, index: number) => {
  if (!item) return index
  return getColumnValue(item, props.rowKey) || index
}

const getRowClass = (item: any, index: number) => {
  // Override in parent component if needed
  return ''
}

const handleSort = (column: string) => {
  // Simple toggle for now - extend for more complex sorting
  emit('sort', column, 'asc')
}

const previousPage = () => {
  if (props.pagination && props.pagination.page > 0) {
    emit('page-change', props.pagination.page - 1)
  }
}

const nextPage = () => {
  if (props.pagination && props.pagination.page < props.pagination.totalPages - 1) {
    emit('page-change', props.pagination.page + 1)
  }
}
</script>