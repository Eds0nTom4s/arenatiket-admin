<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestão de Categorias</h1>
          <p class="text-gray-600 mt-1">Gerencie as categorias de bilhetes do sistema</p>
        </div>
        <BaseButton @click="showCreateModal = true" variant="primary" text="Nova Categoria">
          <i class="fas fa-plus mr-2"></i>
        </BaseButton>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseInput
          v-model="filters.search"
          label="Buscar"
          placeholder="Nome da categoria..."
          icon="fas fa-search"
        />
        <div class="flex items-end">
          <BaseButton @click="loadCategories" variant="secondary" text="Buscar" class="mr-2">
            <i class="fas fa-search mr-2"></i>
          </BaseButton>
          <BaseButton @click="clearFilters" variant="outline" text="Limpar">
            <i class="fas fa-times mr-2"></i>
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm">
      <BaseTable
        :columns="columns"
        :data="filteredCategories"
        :loading="categoriesStore.loading"
        empty-message="Nenhuma categoria encontrada"
      >
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
        
        <template #cell(dataCriacao)="{ row }">
          {{ row ? formatDate(row.dataCriacao) : '-' }}
        </template>
        
        <template #cell(acoes)="{ row }">
          <div v-if="row" class="flex items-center space-x-2">
            <BaseButton
              @click="editCategory(row)"
              variant="ghost"
              size="sm"
              text=""
              title="Editar"
            >
              <i class="fas fa-edit"></i>
            </BaseButton>
            <BaseButton
              @click="deleteCategory(row)"
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
      :title="editingCategory ? 'Editar Categoria' : 'Nova Categoria'"
      size="md"
      @close="closeModal"
    >
      <form @submit.prevent="saveCategory" class="space-y-6">
        <BaseInput
          v-model="categoryForm.nome"
          label="Nome"
          placeholder="Nome da categoria"
          required
          maxlength="100"
          :error="errors.nome"
        />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            v-model="categoryForm.descricao"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Descrição da categoria (opcional)"
            maxlength="500"
          ></textarea>
        </div>
        
        <div class="flex items-center">
          <input
            id="ativo"
            v-model="categoryForm.ativo"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="ativo" class="ml-2 text-sm text-gray-700">
            Categoria ativa
          </label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <BaseButton type="button" @click="closeModal" variant="outline" text="Cancelar" />
          <BaseButton type="submit" variant="primary" :text="editingCategory ? 'Atualizar' : 'Criar'" :loading="categoriesStore.loading" />
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
          Excluir Categoria
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          Tem certeza que deseja excluir a categoria "{{ categoryToDelete?.nome }}"?
        </p>
        <div class="flex justify-center space-x-3">
          <BaseButton @click="showDeleteModal = false" variant="outline" text="Cancelar" />
          <BaseButton @click="confirmDelete" variant="danger" text="Excluir" :loading="categoriesStore.loading" />
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import type { Category, CreateCategoryRequest } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const categoriesStore = useCategoriesStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)

const categoryForm = reactive<CreateCategoryRequest>({
  nome: '',
  descricao: '',
  ativo: true
})

const errors = ref<Record<string, string>>({})
const filters = reactive({ search: '' })

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'descricao', label: 'Descrição' },
  { key: 'ativo', label: 'Status', sortable: true },
  { key: 'dataCriacao', label: 'Criado em', sortable: true },
  { key: 'acoes', label: 'Ações', align: 'right' }
]

const filteredCategories = computed(() => {
  let result = categoriesStore.categories
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(cat => 
      cat.nome.toLowerCase().includes(search) ||
      cat.descricao?.toLowerCase().includes(search)
    )
  }
  
  return result
})

const loadCategories = async () => {
  await categoriesStore.fetchCategories()
}

const clearFilters = () => {
  filters.search = ''
  loadCategories()
}

const resetForm = () => {
  categoryForm.nome = ''
  categoryForm.descricao = ''
  categoryForm.ativo = true
  errors.value = {}
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategory.value = null
  resetForm()
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  categoryForm.nome = category.nome
  categoryForm.descricao = category.descricao || ''
  categoryForm.ativo = category.ativo
  showEditModal.value = true
}

const deleteCategory = (category: Category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!categoryForm.nome.trim()) {
    errors.value.nome = 'Nome é obrigatório'
  }
  
  return Object.keys(errors.value).length === 0
}

const saveCategory = async () => {
  if (!validateForm()) return
  
  try {
    if (editingCategory.value) {
      await categoriesStore.updateCategory(editingCategory.value.id, categoryForm)
    } else {
      await categoriesStore.createCategory(categoryForm)
    }
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar categoria:', error)
  }
}

const confirmDelete = async () => {
  if (!categoryToDelete.value) return
  
  try {
    await categoriesStore.deleteCategory(categoryToDelete.value.id)
    showDeleteModal.value = false
    categoryToDelete.value = null
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadCategories()
})
</script>