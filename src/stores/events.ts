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
      
      events.value = response.content
      pagination.value = response.pageable
      
      return response
    } catch (error) {
      console.error('Error fetching events:', error)
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
      
      events.value.unshift(newEvent)
      toastStore.showSuccess('Evento criado com sucesso!')
      
      return newEvent
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id: number, eventData: Partial<CreateEventRequest>) => {
    try {
      loading.value = true
      const updatedEvent = await ApiService.updateEvent(id, eventData)
      
      const index = events.value.findIndex(event => event.id === id)
      if (index > -1) {
        events.value[index] = updatedEvent
      }
      
      if (currentEvent.value?.id === id) {
        currentEvent.value = updatedEvent
      }
      
      toastStore.showSuccess('Evento atualizado com sucesso!')
      
      return updatedEvent
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const setCurrentEvent = (event: Event | null) => {
    currentEvent.value = event
  }

  const getEventById = (id: number) => {
    return events.value.find(event => event.id === id) || null
  }

  const getEventsByStatus = (status: string) => {
    return events.value.filter(event => event.status === status)
  }

  const getEventsByCategory = (categoria: string) => {
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