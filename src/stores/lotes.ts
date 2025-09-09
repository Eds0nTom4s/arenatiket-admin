import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { Lote, CreateLoteRequest, PageableResponse } from '@/types'
import { useToastStore } from './toast'

export const useLotesStore = defineStore('lotes', () => {
  const lotes = ref<Lote[]>([])
  const loading = ref(false)
  const totalElements = ref(0)
  const totalPages = ref(0)
  
  const toastStore = useToastStore()

  // Actions
  const fetchLotes = async (params?: { page?: number; size?: number }) => {
    try {
      loading.value = true
      // Ensure we request lots with relations included
      const requestParams = {
        ...params,
        includeRelations: true
      }
      const response = await ApiService.getLotes(requestParams)
      
      console.log('Raw API response for lotes:', response)
      
      if (Array.isArray(response)) {
        lotes.value = response
        totalElements.value = response.length
        totalPages.value = 1
      } else {
        lotes.value = response.content || []
        totalElements.value = response.pageable?.totalElements || 0
        totalPages.value = response.pageable?.totalPages || 1
      }
      
      // Log first lot structure for debugging
      if (lotes.value.length > 0) {
        console.log('First lot structure:', JSON.stringify(lotes.value[0], null, 2))
      }
    } catch (error) {
      console.error('Erro ao buscar lotes:', error)
      lotes.value = [] // Garantir que é sempre um array
      toastStore.showError('Erro ao carregar lotes')
    } finally {
      loading.value = false
    }
  }

  const fetchLotesByEvent = async (eventoId: number) => {
    try {
      loading.value = true
      const response = await ApiService.getLotesByEvent(eventoId)
      return response || []
    } catch (error) {
      console.error('Erro ao buscar lotes do evento:', error)
      toastStore.showError('Erro ao carregar lotes do evento')
      return []
    } finally {
      loading.value = false
    }
  }

  const createLote = async (data: CreateLoteRequest) => {
    try {
      loading.value = true
      const newLote = await ApiService.createLote(data)
      if (newLote && Array.isArray(lotes.value)) {
        lotes.value.unshift(newLote)
        totalElements.value++
      }
      toastStore.showSuccess('Lote criado com sucesso!')
      return newLote
    } catch (error) {
      console.error('Erro ao criar lote:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateLote = async (id: number, data: Partial<CreateLoteRequest>) => {
    try {
      loading.value = true
      const updatedLote = await ApiService.updateLote(id, data)
      const index = lotes.value.findIndex(l => l.id === id)
      if (index !== -1 && updatedLote) {
        lotes.value[index] = updatedLote
      }
      toastStore.showSuccess('Lote atualizado com sucesso!')
      return updatedLote
    } catch (error) {
      console.error('Erro ao atualizar lote:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteLote = async (id: number) => {
    try {
      loading.value = true
      await ApiService.deleteLote(id)
      lotes.value = lotes.value.filter(l => l.id !== id)
      totalElements.value--
      toastStore.showSuccess('Lote desativado com sucesso!')
    } catch (error) {
      console.error('Erro ao desativar lote:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getLoteById = (id: number) => {
    return lotes.value.find(l => l.id === id)
  }

  const getLotesByEventId = (eventoId: number) => {
    return lotes.value.filter(l => l?.evento?.id === eventoId)
  }

  return {
    lotes,
    loading,
    totalElements,
    totalPages,
    fetchLotes,
    fetchLotesByEvent,
    createLote,
    updateLote,
    deleteLote,
    getLoteById,
    getLotesByEventId
  }
})