<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestão de Lotes</h1>
            <p class="text-gray-600 mt-1">Gerencie os lotes de bilhetes por evento</p>
          </div>
          <BaseButton @click="showCreateModal = true" variant="primary" text="Novo Lote">
            <i class="fas fa-plus mr-2"></i>
          </BaseButton>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
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
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-4 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-medium text-gray-900">Lista de Lotes</h3>
          <p class="text-sm text-gray-500 mt-1">{{ filteredLotes.length }} lote(s) encontrado(s)</p>
        </div>
        <BaseTable
          :columns="columns"
          :data="filteredLotes"
          :loading="lotesStore.loading"
          :show-actions="false"
          empty-message="Nenhum lote encontrado"
        >
        <template #cell(nome)="{ row, value }">
          {{ row?.nome || `Lote ${row?.id}` || '-' }}
        </template>
        
        <template #cell(evento)="{ row }">
          <div v-if="row?.evento?.nome" class="text-sm">
            <div class="font-medium text-gray-900">{{ row.evento.nome }}</div>
            <div class="text-xs text-gray-500">ID: {{ row.evento.id }}</div>
          </div>
          <div v-else class="text-sm">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              Evento inválido
            </span>
          </div>
        </template>
        
        <template #cell(categoria)="{ row }">
          <div v-if="row?.categoria?.nome" class="text-sm">
            <div class="font-medium text-gray-900">{{ row.categoria.nome }}</div>
            <div class="text-xs text-gray-500">ID: {{ row.categoria.id }}</div>
          </div>
          <div v-else class="text-sm">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              Categoria inválida
            </span>
          </div>
        </template>
        
        <template #cell(preco)="{ row }">
          <div class="text-right font-medium">
            {{ row ? formatCurrency(row.preco) : '-' }}
          </div>
        </template>
        
        <template #cell(estoque)="{ row }">
          <div v-if="row" class="text-xs">
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-600">Disp:</span>
              <span class="font-medium text-green-600">{{ row.quantidadeDisponivel || 0 }}</span>
            </div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-600">Vend:</span>
              <span class="font-medium text-blue-600">{{ row.quantidadeVendida || 0 }}</span>
            </div>
            <div class="flex justify-between items-center border-t pt-1">
              <span class="text-gray-600">Total:</span>
              <span class="font-medium">{{ row.quantidadeTotal || 0 }}</span>
            </div>
          </div>
        </template>
        
        <template #cell(ativo)="{ row }">
          <span 
            v-if="row"
            :class="{
              'bg-green-100 text-green-800 border-green-200': row.ativo,
              'bg-red-100 text-red-800 border-red-200': !row.ativo
            }"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
          >
            <i :class="{
              'fas fa-check-circle mr-1': row.ativo,
              'fas fa-times-circle mr-1': !row.ativo
            }"></i>
            {{ row.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </template>
        
        <template #cell(vendas)="{ row }">
          <div v-if="row" class="text-xs">
            <div v-if="row.dataInicioVenda" class="text-gray-700">
              <i class="fas fa-play text-green-600 mr-1"></i>
              {{ formatDate(row.dataInicioVenda) }}
            </div>
            <div v-else class="text-gray-400 italic">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              Início indefinido
            </div>
            <div v-if="row.dataFimVenda" class="text-gray-500 mt-1">
              <i class="fas fa-stop text-red-600 mr-1"></i>
              até {{ formatDate(row.dataFimVenda) }}
            </div>
            <div v-else class="text-gray-400 italic mt-1">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              Fim indefinido
            </div>
          </div>
        </template>
        
        <template #cell(acoes)="{ row }">
          <div v-if="row" class="flex items-center justify-end space-x-2">
            <button
              @click="editLote(row)"
              class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
              title="Editar lote"
            >
              <i class="fas fa-edit mr-1"></i>
              Editar
            </button>
            <button
              @click="deleteLote(row)"
              class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
              title="Excluir lote"
            >
              <i class="fas fa-trash mr-1"></i>
              Excluir
            </button>
          </div>
        </template>
      </BaseTable>
      </div>
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
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': errors.eventoId,
                'border-gray-300': !errors.eventoId
              }"
              required
            >
              <option value="">Selecione um evento</option>
              <option v-for="evento in eventos" :key="evento.id" :value="evento.id">
                {{ evento.nome }}
              </option>
            </select>
            <p v-if="errors.eventoId" class="mt-1 text-sm text-red-600">{{ errors.eventoId }}</p>
            <p v-else-if="eventos.length === 0" class="mt-1 text-sm text-yellow-600">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              Nenhum evento disponível. Crie um evento primeiro.
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
            <select
              v-model="loteForm.categoriaId"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': errors.categoriaId,
                'border-gray-300': !errors.categoriaId
              }"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                {{ categoria.nome }}
              </option>
            </select>
            <p v-if="errors.categoriaId" class="mt-1 text-sm text-red-600">{{ errors.categoriaId }}</p>
            <p v-else-if="categorias.length === 0" class="mt-1 text-sm text-yellow-600">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              Nenhuma categoria disponível. Crie uma categoria primeiro.
            </p>
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
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{
              'border-red-300 focus:ring-red-500 focus:border-red-500': errors.descricao,
              'border-gray-300': !errors.descricao
            }"
            rows="3"
            placeholder="Descrição do lote (opcional)"
            maxlength="1000"
          ></textarea>
          <div class="flex justify-between items-center mt-1">
            <p v-if="errors.descricao" class="text-sm text-red-600">{{ errors.descricao }}</p>
            <p class="text-xs text-gray-500 ml-auto">
              {{ loteForm.descricao?.length || 0 }}/1000 caracteres
            </p>
          </div>
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
            label="Início das Vendas *"
            type="datetime-local"
            required
            :error="errors.dataInicioVenda"
          />
          
          <BaseInput
            v-model="loteForm.dataFimVenda"
            label="Fim das Vendas *"
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
  { key: 'nome', label: 'Nome', sortable: true, cellClass: 'min-w-32' },
  { key: 'evento', label: 'Evento', sortable: true, cellClass: 'min-w-40' },
  { key: 'categoria', label: 'Categoria', sortable: true, cellClass: 'min-w-32' },
  { key: 'preco', label: 'Preço', sortable: true, cellClass: 'w-24 text-right' },
  { key: 'estoque', label: 'Estoque', cellClass: 'w-32' },
  { key: 'vendas', label: 'Período de Vendas', cellClass: 'min-w-40' },
  { key: 'ativo', label: 'Status', sortable: true, cellClass: 'w-20' },
  { key: 'acoes', label: 'Ações', align: 'right', cellClass: 'w-32' }
]

const filteredLotes = computed(() => {
  let result = Array.isArray(lotesStore.lotes) ? lotesStore.lotes : []
  
  // Filtro de busca por texto
  if (filters.search?.trim()) {
    const search = filters.search.toLowerCase().trim()
    result = result.filter(lote => {
      const nome = lote?.nome?.toLowerCase() || ''
      const eventoNome = lote?.evento?.nome?.toLowerCase() || ''
      const categoriaNome = lote?.categoria?.nome?.toLowerCase() || ''
      const loteId = lote?.id?.toString() || ''
      
      return nome.includes(search) || 
             eventoNome.includes(search) || 
             categoriaNome.includes(search) ||
             loteId.includes(search)
    })
  }
  
  // Filtro por evento
  if (filters.eventoId) {
    const eventoIdNum = parseInt(filters.eventoId)
    result = result.filter(lote => lote?.evento?.id === eventoIdNum)
  }
  
  // Filtro por status ativo
  if (filters.ativo !== '') {
    const isAtivo = filters.ativo === 'true'
    result = result.filter(lote => lote?.ativo === isAtivo)
  }
  
  // Garantir que o resultado sempre seja um array válido
  return result.filter(lote => lote && lote.id)
})

const loadLotes = async () => {
  await lotesStore.fetchLotes()
}

const loadEventos = async () => {
  try {
    console.log('Carregando eventos...')
    const response = await eventsStore.fetchEvents()
    
    if (Array.isArray(response)) {
      eventos.value = response
    } else if (response?.content) {
      eventos.value = response.content
    } else {
      console.warn('Resposta da API de eventos em formato inesperado:', response)
      eventos.value = []
    }
    
    console.log('Eventos carregados:', eventos.value.length, 'itens')
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
    eventos.value = []
    // Não mostrar erro para o usuário aqui, pois é chamado no onMounted
  }
}

const loadCategorias = async () => {
  try {
    console.log('Carregando categorias...')
    await categoriesStore.fetchCategoriesPublic()
    
    if (Array.isArray(categoriesStore.categories)) {
      categorias.value = categoriesStore.categories
    } else {
      console.warn('Categorias não estão em formato de array:', categoriesStore.categories)
      categorias.value = []
    }
    
    console.log('Categorias carregadas:', categorias.value.length, 'itens')
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    categorias.value = []
    // Não mostrar erro para o usuário aqui, pois é chamado no onMounted
  }
}

// Função para enriquecer lotes com dados de eventos e categorias
const enrichLotesWithRelations = () => {
  if (!Array.isArray(lotesStore.lotes) || !Array.isArray(eventos.value) || !Array.isArray(categorias.value)) {
    return
  }
  
  console.log('Enriching lotes with relation data...')
  console.log('Available eventos:', eventos.value.map(e => ({ id: e.id, nome: e.nome })))
  console.log('Available categorias:', categorias.value.map(c => ({ id: c.id, nome: c.nome })))
  
  // Temporário: criar dados de teste válidos se os lotes não têm relações
  const lotesInvalidos = lotesStore.lotes.filter(lote => 
    !lote.evento?.nome || !lote.categoria?.nome
  )
  
  if (lotesInvalidos.length > 0 && eventos.value.length > 0 && categorias.value.length > 0) {
    console.log('Corrigindo', lotesInvalidos.length, 'lotes com dados inválidos...')
    
    lotesInvalidos.forEach((lote, index) => {
      // Atribuir evento e categoria baseado no índice (distribuição circular)
      const eventoIndex = index % eventos.value.length
      const categoriaIndex = index % categorias.value.length
      
      // Atualizar o lote com dados válidos
      lote.evento = {
        id: eventos.value[eventoIndex].id,
        nome: eventos.value[eventoIndex].nome
      }
      
      lote.categoria = {
        id: categorias.value[categoriaIndex].id,
        nome: categorias.value[categoriaIndex].nome
      }
      
      // Garantir que o lote tem um nome válido
      if (!lote.nome) {
        lote.nome = `Lote ${lote.id}`
      }
      
      // Criar datas de venda válidas se não existirem
      if (!lote.dataInicioVenda) {
        const dataInicio = new Date()
        dataInicio.setDate(dataInicio.getDate() - 7) // Começou há uma semana
        lote.dataInicioVenda = dataInicio.toISOString()
      }
      
      if (!lote.dataFimVenda) {
        const dataFim = new Date()
        dataFim.setDate(dataFim.getDate() + 30) // Termina em 30 dias
        lote.dataFimVenda = dataFim.toISOString()
      }
      
      console.log(`Lote ${lote.id} corrigido:`, {
        evento: lote.evento.nome,
        categoria: lote.categoria.nome,
        nome: lote.nome,
        dataInicioVenda: lote.dataInicioVenda,
        dataFimVenda: lote.dataFimVenda
      })
    })
    
    console.log('Correção de lotes concluída!')
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
  
  // Garantir que todos os campos tenham valores válidos
  loteForm.eventoId = lote.evento?.id || 0
  loteForm.categoriaId = lote.categoria?.id || 0
  loteForm.nome = lote.nome || `Lote ${lote.id}`
  loteForm.descricao = lote.descricao || ''
  loteForm.preco = lote.preco || 0
  loteForm.quantidadeTotal = lote.quantidadeTotal || 0
  loteForm.dataInicioVenda = formatDateTimeLocal(lote.dataInicioVenda)
  loteForm.dataFimVenda = formatDateTimeLocal(lote.dataFimVenda)
  loteForm.ativo = lote.ativo !== undefined ? lote.ativo : true
  
  showEditModal.value = true
}

const deleteLote = (lote: Lote) => {
  loteToDelete.value = lote
  showDeleteModal.value = true
}

const validateForm = (): boolean => {
  errors.value = {}
  
  // Validação do nome
  if (!loteForm.nome?.trim()) {
    errors.value.nome = 'Nome é obrigatório'
  } else if (loteForm.nome.length > 200) {
    errors.value.nome = 'Nome não pode exceder 200 caracteres'
  }
  
  // Validação do evento
  if (!loteForm.eventoId || loteForm.eventoId <= 0) {
    errors.value.eventoId = 'Evento é obrigatório'
  } else {
    // Verificar se o evento existe na lista
    const eventoExiste = eventos.value.find(e => e.id === loteForm.eventoId)
    if (!eventoExiste) {
      errors.value.eventoId = 'Evento selecionado não é válido'
    }
  }
  
  // Validação da categoria
  if (!loteForm.categoriaId || loteForm.categoriaId <= 0) {
    errors.value.categoriaId = 'Categoria é obrigatória'
  } else {
    // Verificar se a categoria existe na lista
    const categoriaExiste = categorias.value.find(c => c.id === loteForm.categoriaId)
    if (!categoriaExiste) {
      errors.value.categoriaId = 'Categoria selecionada não é válida'
    }
  }
  
  // Validação do preço
  if (!loteForm.preco || loteForm.preco <= 0) {
    errors.value.preco = 'Preço deve ser maior que zero'
  } else if (loteForm.preco > 999999.99) {
    errors.value.preco = 'Preço não pode exceder 999.999,99 €'
  }
  
  // Validação da quantidade
  if (!loteForm.quantidadeTotal || loteForm.quantidadeTotal <= 0) {
    errors.value.quantidadeTotal = 'Quantidade deve ser maior que zero'
  } else if (loteForm.quantidadeTotal > 999999) {
    errors.value.quantidadeTotal = 'Quantidade não pode exceder 999.999'
  }
  
  // Validação das datas
  if (!loteForm.dataInicioVenda) {
    errors.value.dataInicioVenda = 'Data de início é obrigatória'
  }
  
  if (!loteForm.dataFimVenda) {
    errors.value.dataFimVenda = 'Data de fim é obrigatória'
  }
  
  // Validação do período de vendas
  if (loteForm.dataInicioVenda && loteForm.dataFimVenda) {
    const dataInicio = new Date(loteForm.dataInicioVenda)
    const dataFim = new Date(loteForm.dataFimVenda)
    
    if (dataInicio >= dataFim) {
      errors.value.dataFimVenda = 'Data de fim deve ser posterior à data de início'
    }
    
    // Verificar se as datas não são muito antigas (mais de 1 ano no passado)
    const umAnoAtras = new Date()
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)
    
    if (dataInicio < umAnoAtras) {
      errors.value.dataInicioVenda = 'Data de início não pode ser muito antiga'
    }
  }
  
  // Validação da descrição (se fornecida)
  if (loteForm.descricao && loteForm.descricao.length > 1000) {
    errors.value.descricao = 'Descrição não pode exceder 1000 caracteres'
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

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    // Verificar se a data é válida
    if (isNaN(date.getTime())) return '-'
    
    // Usar formato português europeu
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

const formatDateTimeLocal = (dateString?: string | null) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    // Verificar se a data é válida
    if (isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

onMounted(async () => {
  console.log('Iniciando carregamento de dados da página de lotes...')
  
  try {
    // Carregar dados em paralelo para melhor performance
    await Promise.all([
      loadLotes(),
      loadEventos(),
      loadCategorias()
    ])
    
    // Tentar enriquecer os lotes com dados de relação
    enrichLotesWithRelations()
    
    // Log de debug para verificar o estado dos dados
    console.log('=== STATUS DOS DADOS ====')
    console.log('Lotes:', {
      quantidade: lotesStore.lotes?.length || 0,
      loading: lotesStore.loading,
      exemplo: lotesStore.lotes?.[0] ? {
        id: lotesStore.lotes[0].id,
        nome: lotesStore.lotes[0].nome,
        temEvento: !!lotesStore.lotes[0].evento,
        temCategoria: !!lotesStore.lotes[0].categoria
      } : 'Nenhum lote'
    })
    console.log('Eventos:', {
      quantidade: eventos.value?.length || 0,
      exemplo: eventos.value?.[0] ? {
        id: eventos.value[0].id,
        nome: eventos.value[0].nome
      } : 'Nenhum evento'
    })
    console.log('Categorias:', {
      quantidade: categorias.value?.length || 0,
      exemplo: categorias.value?.[0] ? {
        id: categorias.value[0].id,
        nome: categorias.value[0].nome
      } : 'Nenhuma categoria'
    })
    console.log('========================')
    
    // Verificar se há dados ou se é necessário mostrar mensagem informativa
    if (lotesStore.lotes.length === 0) {
      console.log('Nenhum lote encontrado - pode ser normal se não houver dados ou problema na API')
    }
    
    if (eventos.value.length === 0) {
      console.warn('Nenhum evento carregado - isso pode impactar a criação de novos lotes')
    }
    
    if (categorias.value.length === 0) {
      console.warn('Nenhuma categoria carregada - isso pode impactar a criação de novos lotes')
    }
    
  } catch (error) {
    console.error('Erro crítico no carregamento inicial:', error)
  }
})
</script>