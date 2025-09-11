import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiService } from '@/services/api'
import type { User, LoginCredentials } from '@/types'
import { useToastStore } from './toast'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const toastStore = useToastStore()

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isVendedor = computed(() => user.value?.role === 'VENDEDOR')
  const isPorteiro = computed(() => user.value?.role === 'PORTEIRO')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true
      const response = await ApiService.login(credentials)
      
      // Debug: log the response to see its structure
      console.log('Login response:', response)
      
      // Check if response has the expected structure according to API Contract
      if (!response || !response.token || !response.usuario) {
        throw new Error('Resposta da API inválida - estrutura incorreta')
      }
      
      // Extract user data from response.usuario
      const usuario = {
        id: response.usuario.id,
        nome: response.usuario.nome,
        email: response.usuario.email,
        role: response.usuario.role,
        ativo: response.usuario.ativo || true
      }
      
      if (!usuario.nome || !usuario.email || !usuario.role) {
        throw new Error('Dados do usuário incompletos na resposta da API')
      }
      
      // Store in localStorage FIRST
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(usuario))
      
      // Then update reactive state
      token.value = response.token
      user.value = usuario
      
      // Wait a bit to ensure token is available for next requests
      await new Promise(resolve => setTimeout(resolve, 100))
      
      toastStore.showSuccess(`Bem-vindo, ${usuario.nome}!`)
      
      return { token: response.token, usuario }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    toastStore.showInfo('Logout realizado com sucesso')
  }

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        logout()
      }
    }
  }

  const hasPermission = (permission: 'ADMIN' | 'VENDEDOR' | 'PORTEIRO' | 'ANY') => {
    if (!user.value) return false
    if (permission === 'ANY') return true
    if (permission === 'ADMIN') return user.value.role === 'ADMIN'
    return user.value.role === permission
  }

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(permission => hasPermission(permission as any))
  }

  const verifyToken = () => {
    // Verify that we have both token and user data
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser && !token.value) {
      // Re-initialize if data exists but reactive state is missing
      initializeAuth()
    }
    
    return !!token.value && !!user.value
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isVendedor,
    isPorteiro,
    login,
    logout,
    initializeAuth,
    hasPermission,
    hasAnyPermission,
    verifyToken
  }
})