<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestão de Lotes</h1>
          <p class="text-gray-600 mt-1">Gerencie os lotes de bilhetes por evento</p>
        </div>
        <BaseButton @click="showCreateModal = true" variant="primary" text="Novo Lote">
          <i class="fas fa-plus mr-2"></i>
        </BaseButton>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BaseInput
          v-model="filters.search"
          label="Buscar"
          placeholder="Nome do lote..."
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
            v-model="filters.ativo"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
        <div class="flex items-end">
          <BaseButton @click="loadLotes" variant="secondary" text="Buscar" class="mr-2">
            <i class="fas fa-search mr-2"></i>
          </BaseButton>
          <BaseButton @click="clearFilters" variant="outline" text="Limpar">
            <i class="fas fa-times mr-2"></i>
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="bg-white rounded-lg shadow-sm">
      <BaseTable
        :columns="columns"
        :data="filteredLotes"
        :loading="lotesStore.loading"
        empty-message="Nenhum lote encontrado"
      >
        <template #cell(evento)="{ row }">
          {{ row?.evento?.nome || '-' }}
        </template>
        
        <template #cell(categoria)="{ row }">
          {{ row?.categoria?.nome || '-' }}
        </template>
        
        <template #cell(preco)="{ row }">
          {{ row ? formatCurrency(row.preco) : '-' }}
        </template>
        
        <template #cell(estoque)="{ row }">
          <div v-if="row" class="text-sm">
            <div class="flex justify-between">
              <span>Disponível:</span>
              <span class="font-medium text-green-600">{{ row.quantidadeDisponivel || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span>Vendido:</span>
              <span class="font-medium text-blue-600">{{ row.quantidadeVendida || 0 }}</span>
            </div>
            <div class="flex justify-between border-t pt-1">
              <span>Total:</span>
              <span class="font-medium">{{ row.quantidadeTotal || 0 }}</span>
            </div>
          </div>
        </template>
        
        <template #cell(ativo)="{ row }">
          <span 
            v-if="row"
            :class="{
              'bg-green-100 text-green-800': row.ativo,
              'bg-red-100 text-red-800': !row.ativo
            }"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ row.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </template>
        
        <template #cell(vendas)="{ row }">
          <div v-if="row" class="text-sm">
            <div>{{ formatDate(row.dataInicioVenda) }}</div>
            <div class="text-gray-500">até {{ formatDate(row.dataFimVenda) }}</div>
          </div>
        </template>
        
        <template #cell(acoes)="{ row }">
          <div v-if="row" class="flex items-center space-x-2">
            <BaseButton
              @click="editLote(row)"
              variant="ghost"
              size="sm"
              text=""
              title="Editar"
            >
              <i class="fas fa-edit"></i>
            </BaseButton>
            <BaseButton
              @click="deleteLote(row)"
              variant="ghost"
              size="sm"
              text=""
              class="text-red-600 hover:text-red-700"
              title="Excluir"
            >
              <i class="fas fa-trash"></i>
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Criar/Editar -->
    <BaseModal
      :model-value="showCreateModal || showEditModal"
      :title="editingLote ? 'Editar Lote' : 'Novo Lote'"
      size="lg"
      @close="closeModal"
    >
      <form @submit.prevent="saveLote" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Evento *</label>
            <select
              v-model="loteForm.eventoId"
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
            <select
              v-model="loteForm.categoriaId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                {{ categoria.nome }}
              </option>
            </select>
          </div>
        </div>
        
        <BaseInput
          v-model="loteForm.nome"
          label="Nome do Lote"
          placeholder="Ex: Arquibancada Premium"
          required
          maxlength="200"
          :error="errors.nome"
        />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            v-model="loteForm.descricao"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Descrição do lote (opcional)"
            maxlength="1000"
          ></textarea>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model.number="loteForm.preco"
            label="Preço (€)"
            type="number"
            step="0.01"
            min="0"
            required
            :error="errors.preco"
          />
          
          <BaseInput
            v-model.number="loteForm.quantidadeTotal"
            label="Quantidade Total"
            type="number"
            min="1"
            required
            :error="errors.quantidadeTotal"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model="loteForm.dataInicioVenda"
            label="Início das Vendas"
            type="datetime-local"
            required
            :error="errors.dataInicioVenda"
          />
          
          <BaseInput
            v-model="loteForm.dataFimVenda"
            label="Fim das Vendas"
            type="datetime-local"
            required
            :error="errors.dataFimVenda"
          />
        </div>
        
        <div class="flex items-center">
          <input
            id="ativo"
            v-model="loteForm.ativo"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="ativo" class="ml-2 text-sm text-gray-700">
            Lote ativo
          </label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <BaseButton type="button" @click="closeModal" variant="outline" text="Cancelar" />
          <BaseButton type="submit" variant="primary" :text="editingLote ? 'Atualizar' : 'Criar'" :loading="lotesStore.loading" />
        </div>
      </form>
    </BaseModal>

    <!-- Modal Confirmação Exclusão -->
    <BaseModal
      :model-value="showDeleteModal"
      title="Confirmar Exclusão"
      size="sm"
      @close="showDeleteModal = false"
    >
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Excluir Lote
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          Tem certeza que deseja excluir o lote "{{ loteToDelete?.nome }}"?
          Esta ação pode afetar vendas em andamento.
        </p>
        <div class="flex justify-center space-x-3">
          <BaseButton @click="showDeleteModal = false" variant="outline" text="Cancelar" />
          <BaseButton @click="confirmDelete" variant="danger" text="Excluir" :loading="lotesStore.loading" />
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useLotesStore } from '@/stores/lotes'
import { useEventsStore } from '@/stores/events'
import { useCategoriesStore } from '@/stores/categories'
import type { Lote, CreateLoteRequest, Event, Category } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const lotesStore = useLotesStore()
const eventsStore = useEventsStore()
const categoriesStore = useCategoriesStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingLote = ref<Lote | null>(null)
const loteToDelete = ref<Lote | null>(null)

const eventos = ref<Event[]>([])
const categorias = ref<Category[]>([])

const loteForm = reactive<CreateLoteRequest>({
  eventoId: 0,
  categoriaId: 0,
  nome: '',
  descricao: '',
  preco: 0,
  quantidadeTotal: 0,
  dataInicioVenda: '',
  dataFimVenda: '',
  ativo: true
})

const errors = ref<Record<string, string>>({})
const filters = reactive({
  search: '',
  eventoId: '',
  ativo: ''
})

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'evento', label: 'Evento', sortable: true },
  { key: 'categoria', label: 'Categoria', sortable: true },
  { key: 'preco', label: 'Preço', sortable: true },
  { key: 'estoque', label: 'Estoque' },
  { key: 'vendas', label: 'Período de Vendas' },
  { key: 'ativo', label: 'Status', sortable: true },
  { key: 'acoes', label: 'Ações', align: 'right' }
]

const filteredLotes = computed(() => {
  let result = lotesStore.lotes || []
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(lote => 
      lote?.nome?.toLowerCase().includes(search) ||
      lote?.evento?.nome?.toLowerCase().includes(search) ||
      lote?.categoria?.nome?.toLowerCase().includes(search)
    )
  }
  
  if (filters.eventoId) {
    result = result.filter(lote => lote?.evento?.id === parseInt(filters.eventoId))
  }
  
  if (filters.ativo !== '') {
    result = result.filter(lote => lote?.ativo === (filters.ativo === 'true'))
  }
  
  return result
})

const loadLotes = async () => {
  await lotesStore.fetchLotes()
}

const loadEventos = async () => {
  try {
    const response = await eventsStore.fetchEvents()
    if (Array.isArray(response)) {
      eventos.value = response
    } else if (response?.content) {
      eventos.value = response.content
    } else {
      eventos.value = []
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
    eventos.value = []
  }
}

const loadCategorias = async () => {
  try {
    await categoriesStore.fetchCategoriesPublic()
    categorias.value = categoriesStore.categories
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

const clearFilters = () => {
  filters.search = ''
  filters.eventoId = ''
  filters.ativo = ''
  loadLotes()
}

const resetForm = () => {
  loteForm.eventoId = 0
  loteForm.categoriaId = 0
  loteForm.nome = ''
  loteForm.descricao = ''
  loteForm.preco = 0
  loteForm.quantidadeTotal = 0
  loteForm.dataInicioVenda = ''
  loteForm.dataFimVenda = ''
  loteForm.ativo = true
  errors.value = {}
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingLote.value = null
  resetForm()
}

const editLote = (lote: Lote) => {
  editingLote.value = lote
  loteForm.eventoId = lote.evento.id
  loteForm.categoriaId = lote.categoria.id
  loteForm.nome = lote.nome
  loteForm.descricao = lote.descricao || ''
  loteForm.preco = lote.preco
  loteForm.quantidadeTotal = lote.quantidadeTotal
  loteForm.dataInicioVenda = formatDateTimeLocal(lote.dataInicioVenda)
  loteForm.dataFimVenda = formatDateTimeLocal(lote.dataFimVenda)
  loteForm.ativo = lote.ativo
  showEditModal.value = true
}

const deleteLote = (lote: Lote) => {
  loteToDelete.value = lote
  showDeleteModal.value = true
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!loteForm.nome.trim()) {
    errors.value.nome = 'Nome é obrigatório'
  }
  
  if (!loteForm.eventoId) {
    errors.value.eventoId = 'Evento é obrigatório'
  }
  
  if (!loteForm.categoriaId) {
    errors.value.categoriaId = 'Categoria é obrigatória'
  }
  
  if (loteForm.preco <= 0) {
    errors.value.preco = 'Preço deve ser maior que zero'
  }
  
  if (loteForm.quantidadeTotal <= 0) {
    errors.value.quantidadeTotal = 'Quantidade deve ser maior que zero'
  }
  
  if (!loteForm.dataInicioVenda) {
    errors.value.dataInicioVenda = 'Data de início é obrigatória'
  }
  
  if (!loteForm.dataFimVenda) {
    errors.value.dataFimVenda = 'Data de fim é obrigatória'
  }
  
  if (loteForm.dataInicioVenda && loteForm.dataFimVenda) {
    if (new Date(loteForm.dataInicioVenda) >= new Date(loteForm.dataFimVenda)) {
      errors.value.dataFimVenda = 'Data de fim deve ser posterior à data de início'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const saveLote = async () => {
  if (!validateForm()) return
  
  try {
    if (editingLote.value) {
      await lotesStore.updateLote(editingLote.value.id, loteForm)
    } else {
      await lotesStore.createLote(loteForm)
    }
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar lote:', error)
  }
}

const confirmDelete = async () => {
  if (!loteToDelete.value) return
  
  try {
    await lotesStore.deleteLote(loteToDelete.value.id)
    showDeleteModal.value = false
    loteToDelete.value = null
  } catch (error) {
    console.error('Erro ao excluir lote:', error)
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('pt-BR')
  } catch {
    return '-'
  }
}

const formatDateTimeLocal = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

onMounted(async () => {
  await Promise.all([
    loadLotes(),
    loadEventos(),
    loadCategorias()
  ])
})
</script>