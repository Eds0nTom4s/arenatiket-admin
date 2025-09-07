import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { Category, CreateCategoryRequest, PageableResponse } from '@/types'
import { useToastStore } from './toast'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const totalElements = ref(0)
  const totalPages = ref(0)
  
  const toastStore = useToastStore()

  // Actions
  const fetchCategories = async (params?: { page?: number; size?: number }) => {
    try {
      loading.value = true
      const response = await ApiService.getCategories(params)
      
      if (Array.isArray(response)) {
        categories.value = response
        totalElements.value = response.length
        totalPages.value = 1
      } else {
        categories.value = response.content || []
        totalElements.value = response.pageable?.totalElements || 0
        totalPages.value = response.pageable?.totalPages || 1
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      categories.value = [] // Garantir que é sempre um array
      toastStore.showError('Erro ao carregar categorias')
    } finally {
      loading.value = false
    }
  }

  const fetchCategoriesPublic = async () => {
    try {
      loading.value = true
      const response = await ApiService.getCategoriesPublic()
      categories.value = response
    } catch (error) {
      console.error('Erro ao buscar categorias públicas:', error)
      toastStore.showError('Erro ao carregar categorias')
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (data: CreateCategoryRequest) => {
    try {
      loading.value = true
      const newCategory = await ApiService.createCategory(data)
      if (newCategory && Array.isArray(categories.value)) {
        categories.value.unshift(newCategory)
        totalElements.value++
      }
      toastStore.showSuccess('Categoria criada com sucesso!')
      return newCategory
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: number, data: Partial<CreateCategoryRequest>) => {
    try {
      loading.value = true
      const updatedCategory = await ApiService.updateCategory(id, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1 && updatedCategory) {
        categories.value[index] = updatedCategory
      }
      toastStore.showSuccess('Categoria atualizada com sucesso!')
      return updatedCategory
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      loading.value = true
      await ApiService.deleteCategory(id)
      categories.value = categories.value.filter(c => c.id !== id)
      totalElements.value--
      toastStore.showSuccess('Categoria desativada com sucesso!')
    } catch (error) {
      console.error('Erro ao desativar categoria:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getCategoryById = (id: number) => {
    return categories.value.find(c => c.id === id)
  }

  return {
    categories,
    loading,
    totalElements,
    totalPages,
    fetchCategories,
    fetchCategoriesPublic,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  }
})