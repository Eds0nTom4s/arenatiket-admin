<template>
  <div v-if="isDevelopment" class="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg">
    <h3 class="text-sm font-bold text-yellow-800 mb-2">🔧 Dev Login Helper</h3>
    
    <!-- Toggle para modo de simulação -->
    <div class="mb-3 p-2 bg-yellow-50 rounded border">
      <label class="flex items-center text-xs text-yellow-800">
        <input 
          type="checkbox" 
          v-model="simulationMode" 
          class="mr-2"
        />
        Modo Simulação (sem backend)
      </label>
    </div>
    
    <div class="space-y-2">
      <button 
        @click="quickLogin('admin')"
        class="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
      >
        Login Admin
      </button>
      
      <button 
        @click="quickLogin('vendedor')"
        class="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
      >
        Login Vendedor
      </button>
      
      <button 
        @click="quickLogin('porteiro')"
        class="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
      >
        Login Porteiro
      </button>
      
      <button 
        @click="logout"
        class="w-full px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
      >
        Logout
      </button>
    </div>
    
    <div class="mt-2 text-xs text-yellow-700">
      Status: {{ authStore.isAuthenticated ? `Logado como ${authStore.user?.nome}` : 'Não logado' }}
      <br>
      Modo: {{ simulationMode ? 'Simulação' : 'Backend Real' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const isDevelopment = computed(() => {
  return import.meta.env.DEV
})

const simulationMode = ref(false)

const credentials = {
  admin: { email: 'admin@arenaticket.com', senha: 'senha123' },
  vendedor: { email: 'vendedor@arenaticket.com', senha: 'senha123' },
  porteiro: { email: 'porteiro@arenaticket.com', senha: 'senha123' }
}

const simulateLogin = (role: 'admin' | 'vendedor' | 'porteiro') => {
  const userData = {
    admin: { id: 1, nome: 'Administrador', email: 'admin@arenaticket.com', role: 'ADMIN', ativo: true },
    vendedor: { id: 2, nome: 'Vendedor', email: 'vendedor@arenaticket.com', role: 'VENDEDOR', ativo: true },
    porteiro: { id: 3, nome: 'Porteiro', email: 'porteiro@arenaticket.com', role: 'PORTEIRO', ativo: true }
  }
  
  const fakeToken = `fake-jwt-token-${role}-${Date.now()}`
  const user = userData[role]
  
  // Simular o que o authStore.login faria
  localStorage.setItem('token', fakeToken)
  localStorage.setItem('user', JSON.stringify(user))
  
  // Atualizar o estado do store diretamente
  authStore.token.value = fakeToken
  authStore.user.value = user
  
  return { token: fakeToken, usuario: user }
}

const quickLogin = async (role: 'admin' | 'vendedor' | 'porteiro') => {
  try {
    if (simulationMode.value) {
      // Modo simulação - não faz requisição ao backend
      const result = simulateLogin(role)
      
      // Redirecionar para dashboard após login simulado
      router.push('/dashboard')
      
      toastStore.showSuccess(`Login simulado realizado como ${role.toUpperCase()}!`)
    } else {
      // Modo normal - tenta fazer login real
      const creds = credentials[role]
      await authStore.login(creds)
      
      // Redirecionar para dashboard após login bem-sucedido
      router.push('/dashboard')
      
      toastStore.showSuccess(`Login automático realizado como ${role.toUpperCase()}!`)
    }
  } catch (error) {
    console.error('Erro no login automático:', error)
    toastStore.error('Erro no login automático. Tente o modo simulação ou verifique se o backend está rodando.')
  }
}

const logout = async () => {
  try {
    await authStore.logout()
    toastStore.info('Logout realizado')
    router.push('/login')
  } catch (error) {
    console.error('Erro no logout:', error)
  }
}
</script>