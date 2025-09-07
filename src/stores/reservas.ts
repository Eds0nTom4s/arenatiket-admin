import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { Reserva, CreateReservaRequest, PageableResponse } from '@/types'
import { useToastStore } from './toast'

export const useReservasStore = defineStore('reservas', () => {
  const reservas = ref<Reserva[]>([])
  const loading = ref(false)
  const totalElements = ref(0)
  const totalPages = ref(0)
  
  const toastStore = useToastStore()

  // Actions
  const fetchReservas = async (params?: { 
    page?: number
    size?: number
    eventoId?: number
    status?: string 
  }) => {
    try {
      loading.value = true
      const response = await ApiService.getReservas(params)
      
      if (Array.isArray(response)) {
        reservas.value = response
        totalElements.value = response.length
        totalPages.value = 1
      } else {
        reservas.value = response.content
        totalElements.value = response.pageable.totalElements
        totalPages.value = response.pageable.totalPages
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
      toastStore.showError('Erro ao carregar reservas')
    } finally {
      loading.value = false
    }
  }

  const createReserva = async (data: CreateReservaRequest) => {
    try {
      loading.value = true
      const newReserva = await ApiService.createReserva(data)
      reservas.value.unshift(newReserva)
      totalElements.value++
      toastStore.showSuccess('Reserva criada com sucesso!')
      return newReserva
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelReserva = async (id: number) => {
    try {
      loading.value = true
      const cancelledReserva = await ApiService.cancelReserva(id)
      const index = reservas.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reservas.value[index] = cancelledReserva
      }
      toastStore.showSuccess('Reserva cancelada com sucesso!')
      return cancelledReserva
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const convertReserva = async (id: number) => {
    try {
      loading.value = true
      const pedido = await ApiService.convertReserva(id)
      
      // Atualizar status da reserva
      const index = reservas.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reservas.value[index].status = 'CONVERTIDA'
        reservas.value[index].dataConversao = new Date().toISOString()
      }
      
      toastStore.showSuccess('Reserva convertida em pedido com sucesso!')
      return pedido
    } catch (error) {
      console.error('Erro ao converter reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getReservaById = (id: number) => {
    return reservas.value.find(r => r.id === id)
  }

  const getReservasByEvent = (eventoId: number) => {
    return reservas.value.filter(r => r.evento.id === eventoId)
  }

  const getReservasByStatus = (status: string) => {
    return reservas.value.filter(r => r.status === status)
  }

  return {
    reservas,
    loading,
    totalElements,
    totalPages,
    fetchReservas,
    createReserva,
    cancelReserva,
    convertReserva,
    getReservaById,
    getReservasByEvent,
    getReservasByStatus
  }
})