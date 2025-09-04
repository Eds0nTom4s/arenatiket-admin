import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { Ticket, TicketValidation } from '@/types'
import { useToastStore } from './toast'

export const useTicketsStore = defineStore('tickets', () => {
  const currentTicket = ref<Ticket | null>(null)
  const validationResult = ref<TicketValidation | null>(null)
  const loading = ref(false)
  const ticketCounts = ref<Record<string, number>>({
    ATIVO: 0,
    USADO: 0,
    CANCELADO: 0
  })

  const toastStore = useToastStore()

  // Actions
  const fetchTicket = async (id: number) => {
    try {
      loading.value = true
      const ticket = await ApiService.getTicket(id)
      currentTicket.value = ticket
      return ticket
    } catch (error) {
      console.error('Error fetching ticket:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchTicketByQR = async (codigoQR: string) => {
    try {
      loading.value = true
      const ticket = await ApiService.getTicketByQR(codigoQR)
      currentTicket.value = ticket
      return ticket
    } catch (error) {
      console.error('Error fetching ticket by QR:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const validateTicket = async (codigoQR: string) => {
    try {
      loading.value = true
      const result = await ApiService.validateTicket(codigoQR)
      validationResult.value = result
      
      if (result.valido) {
        toastStore.showSuccess(`Bilhete validado com sucesso para ${result.nomeComprador}`)
      } else {
        toastStore.showError(`Bilhete inválido: ${result.motivo}`)
      }
      
      return result
    } catch (error) {
      console.error('Error validating ticket:', error)
      validationResult.value = {
        bilheteId: 0,
        valido: false,
        motivo: 'Erro na validação'
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchTicketCounts = async () => {
    try {
      // Usar os valores corretos do enum StatusBilhete
      const statuses = ['DISPONIVEL', 'VENDIDO', 'USADO', 'CANCELADO']
      const promises = statuses.map(status => ApiService.getTicketCount(status))
      const counts = await Promise.all(promises)
      
      statuses.forEach((status, index) => {
        ticketCounts.value[status] = counts[index]
      })
      
      return ticketCounts.value
    } catch (error) {
      console.error('Error fetching ticket counts:', error)
      throw error
    }
  }

  const clearValidation = () => {
    validationResult.value = null
  }

  const setCurrentTicket = (ticket: Ticket | null) => {
    currentTicket.value = ticket
  }

  return {
    currentTicket,
    validationResult,
    loading,
    ticketCounts,
    fetchTicket,
    fetchTicketByQR,
    validateTicket,
    fetchTicketCounts,
    clearValidation,
    setCurrentTicket
  }
})