import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { Pedido, CheckoutRequest, CheckoutResponse, PageableResponse } from '@/types'
import { useToastStore } from './toast'

export const usePedidosStore = defineStore('pedidos', () => {
  const pedidos = ref<Pedido[]>([])
  const myOrders = ref<Pedido[]>([])
  const loading = ref(false)
  const totalElements = ref(0)
  const totalPages = ref(0)
  
  const toastStore = useToastStore()

  // Actions
  const fetchAllOrders = async (params?: { 
    page?: number
    size?: number
    status?: string
    eventoId?: number 
  }) => {
    try {
      loading.value = true
      const response = await ApiService.getAllOrders(params)
      
      if (Array.isArray(response)) {
        pedidos.value = response
        totalElements.value = response.length
        totalPages.value = 1
      } else {
        pedidos.value = response.content
        totalElements.value = response.pageable.totalElements
        totalPages.value = response.pageable.totalPages
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      toastStore.showError('Erro ao carregar pedidos')
    } finally {
      loading.value = false
    }
  }

  const fetchMyOrders = async (params?: { page?: number; size?: number }) => {
    try {
      loading.value = true
      const response = await ApiService.getMyOrders(params)
      
      if (Array.isArray(response)) {
        myOrders.value = response
      } else {
        myOrders.value = response.content
      }
    } catch (error) {
      console.error('Erro ao buscar meus pedidos:', error)
      toastStore.showError('Erro ao carregar meus pedidos')
    } finally {
      loading.value = false
    }
  }

  const getOrder = async (id: number) => {
    try {
      loading.value = true
      const pedido = await ApiService.getOrder(id)
      return pedido
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
      toastStore.showError('Erro ao carregar pedido')
      throw error
    } finally {
      loading.value = false
    }
  }

  const processCheckout = async (data: CheckoutRequest) => {
    try {
      loading.value = true
      const result = await ApiService.processCheckout(data)
      toastStore.showSuccess('Checkout processado com sucesso!')
      
      // Refresh orders
      await fetchMyOrders()
      
      return result
    } catch (error) {
      console.error('Erro no checkout:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (pedidoId: number) => {
    try {
      loading.value = true
      await ApiService.cancelOrder(pedidoId)
      
      // Update local state
      const updateOrderStatus = (orders: Pedido[]) => {
        const index = orders.findIndex(p => p.id === pedidoId)
        if (index !== -1) {
          orders[index].status = 'CANCELADO'
          orders[index].dataCancelamento = new Date().toISOString()
        }
      }
      
      updateOrderStatus(pedidos.value)
      updateOrderStatus(myOrders.value)
      
      toastStore.showSuccess('Pedido cancelado com sucesso!')
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getPedidoById = (id: number) => {
    return pedidos.value.find(p => p.id === id) || myOrders.value.find(p => p.id === id)
  }

  const getPedidosByEvent = (eventoId: number) => {
    return pedidos.value.filter(p => p.evento.id === eventoId)
  }

  const getPedidosByStatus = (status: string) => {
    return pedidos.value.filter(p => p.status === status)
  }

  return {
    pedidos,
    myOrders,
    loading,
    totalElements,
    totalPages,
    fetchAllOrders,
    fetchMyOrders,
    getOrder,
    processCheckout,
    cancelOrder,
    getPedidoById,
    getPedidosByEvent,
    getPedidosByStatus
  }
})