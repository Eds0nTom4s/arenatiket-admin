import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { Event, CreateEventRequest, PageableResponse } from '@/types'
import { useToastStore } from './toast'

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const loading = ref(false)
  const pagination = ref({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  })

  const toastStore = useToastStore()

  // Actions
  const fetchEvents = async (params?: {
    page?: number
    size?: number
    categoria?: string
    status?: string
  }) => {
    try {
      loading.value = true
      const response = await ApiService.getEvents(params)
      
      // Handle direct array response (current API behavior)
      if (Array.isArray(response)) {
        events.value = response.map(event => ({
          ...event,
          // Ensure required properties exist with defaults
          status: event.status || 'ATIVO',
          categoria: event.categoria || 'OUTROS', 
          bilhetesVendidos: event.bilhetesVendidos || 0,
          capacidadeTotal: event.capacidadeTotal || 100,
          // Handle both dataEvento and dataHora fields
          dataEvento: event.dataEvento || event.dataHora || '',
          dataHora: event.dataHora || event.dataEvento || ''
        }))
        
        // Set pagination for direct array response
        pagination.value = {
          page: 0,
          size: events.value.length,
          totalElements: events.value.length,
          totalPages: 1
        }
      } else if (response && response.content) {
        // Handle paginated response structure
        events.value = response.content
        pagination.value = response.pageable
      } else {
        // Fallback
        events.value = []
        console.warn('Unexpected API response structure for events:', response)
      }
      
      return response
    } catch (error) {
      console.error('Error fetching events:', error)
      // Initialize with empty array on error
      events.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchEvent = async (id: number) => {
    try {
      loading.value = true
      const event = await ApiService.getEvent(id)
      currentEvent.value = event
      return event
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (eventData: CreateEventRequest) => {
    try {
      loading.value = true
      const newEvent = await ApiService.createEvent(eventData)
      
      // Ensure events array is initialized
      if (!Array.isArray(events.value)) {
        events.value = []
      }
      
      // Only add to list if we got a valid response
      if (newEvent) {
        events.value.unshift(newEvent)
        toastStore.showSuccess('Evento criado com sucesso!')
      }
      
      return newEvent
    } catch (error) {
      console.error('Error creating event:', error)
      toastStore.showError('Erro ao criar evento. Tente novamente.')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id: number, eventData: Partial<CreateEventRequest>) => {
    try {
      loading.value = true
      const updatedEvent = await ApiService.updateEvent(id, eventData)
      
      // Ensure events array is initialized
      if (!Array.isArray(events.value)) {
        events.value = []
      }
      
      const index = events.value.findIndex(event => event.id === id)
      if (index > -1 && updatedEvent) {
        events.value[index] = updatedEvent
      }
      
      if (currentEvent.value?.id === id && updatedEvent) {
        currentEvent.value = updatedEvent
      }
      
      toastStore.showSuccess('Evento atualizado com sucesso!')
      
      return updatedEvent
    } catch (error) {
      console.error('Error updating event:', error)
      toastStore.showError('Erro ao atualizar evento. Tente novamente.')
      throw error
    } finally {
      loading.value = false
    }
  }

  const setCurrentEvent = (event: Event | null) => {
    currentEvent.value = event
  }

  const getEventById = (id: number) => {
    if (!Array.isArray(events.value)) return null
    return events.value.find(event => event.id === id) || null
  }

  const getEventsByStatus = (status: string) => {
    if (!Array.isArray(events.value)) return []
    return events.value.filter(event => event.status === status)
  }

  const getEventsByCategory = (categoria: string) => {
    if (!Array.isArray(events.value)) return []
    return events.value.filter(event => event.categoria === categoria)
  }

  return {
    events,
    currentEvent,
    loading,
    pagination,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    setCurrentEvent,
    getEventById,
    getEventsByStatus,
    getEventsByCategory
  }
})