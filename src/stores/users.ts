import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { User, CreateUserRequest, PageableResponse } from '@/types'
import { useToastStore } from './toast'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const pagination = ref({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  })

  const toastStore = useToastStore()

  // Actions
  const fetchUsers = async (params?: {
    page?: number
    size?: number
    role?: string
  }) => {
    try {
      loading.value = true
      const response = await ApiService.getUsers(params)
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        // Direct array response
        users.value = response
        pagination.value = {
          page: 0,
          size: response.length,
          totalElements: response.length,
          totalPages: 1
        }
      } else if (response && response.content && Array.isArray(response.content)) {
        // Paginated response
        users.value = response.content
        pagination.value = response.pageable
      } else {
        console.warn('Invalid API response structure:', response)
        users.value = []
        pagination.value = {
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0
        }
      }
      
      return response
    } catch (error) {
      console.error('Error fetching users:', error)
      // Ensure users array is always valid even on error
      if (!users.value) {
        users.value = []
      }
      toastStore.showError('Erro ao carregar usuários')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData: CreateUserRequest) => {
    try {
      loading.value = true
      const newUser = await ApiService.createUser(userData)
      
      // Ensure users array is initialized
      if (!users.value) {
        users.value = []
      }
      
      users.value.unshift(newUser)
      toastStore.showSuccess('Usuário criado com sucesso!')
      
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      toastStore.showError('Erro ao criar usuário')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, userData: Partial<CreateUserRequest>) => {
    try {
      loading.value = true
      const updatedUser = await ApiService.updateUser(id, userData)
      
      // Ensure users array is initialized
      if (!users.value) {
        users.value = []
      }
      
      const index = users.value.findIndex(user => user.id === id)
      if (index > -1) {
        users.value[index] = updatedUser
      }
      
      toastStore.showSuccess('Usuário atualizado com sucesso!')
      
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      toastStore.showError('Erro ao atualizar usuário')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    try {
      loading.value = true
      await ApiService.deleteUser(id)
      
      // Ensure users array is initialized
      if (!users.value) {
        users.value = []
        return
      }
      
      const index = users.value.findIndex(user => user.id === id)
      if (index > -1) {
        users.value.splice(index, 1)
      }
      
      toastStore.showSuccess('Usuário excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting user:', error)
      toastStore.showError('Erro ao excluir usuário')
      throw error
    } finally {
      loading.value = false
    }
  }

  const setCurrentUser = (user: User | null) => {
    currentUser.value = user
  }

  const getUserById = (id: number) => {
    return users.value.find(user => user.id === id) || null
  }

  const getUsersByRole = (role: string) => {
    return users.value.filter(user => user.role === role)
  }

  return {
    users,
    currentUser,
    loading,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    setCurrentUser,
    getUserById,
    getUsersByRole
  }
})