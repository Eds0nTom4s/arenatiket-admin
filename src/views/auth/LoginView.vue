<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
          <span class="text-white font-bold text-2xl">A</span>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">ArenaTicket</h2>
        <p class="mt-2 text-sm text-gray-600">
          Faça login em sua conta administrativa
        </p>
      </div>
      
      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <!-- Email -->
          <BaseInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
            :error-message="errors.email"
            @blur="clearFieldError('email')"
          />
          
          <!-- Password -->
          <BaseInput
            v-model="form.senha"
            type="password"
            label="Senha"
            placeholder="Digite sua senha"
            required
            :error-message="errors.senha"
            @blur="clearFieldError('senha')"
          />
        </div>
        
        <!-- Submit Button -->
        <BaseButton
          type="submit"
          text="Entrar"
          :loading="loading"
          loading-text="Entrando..."
          full-width
          size="lg"
        />
        
        <!-- Error Message -->
        <div
          v-if="errors.general"
          class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
        >
          <p class="text-sm text-red-600">{{ errors.general }}</p>
        </div>
      </form>
      
      <!-- Demo Credentials -->
      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 class="text-sm font-medium text-blue-800 mb-2">Credenciais de Demonstração:</h3>
        <div class="text-xs text-blue-700 space-y-1">
          <p><strong>Admin:</strong> admin@arenaticket.com / senha123</p>
          <p><strong>Vendedor:</strong> vendedor@arenaticket.com / senha123</p>
          <p><strong>Porteiro:</strong> porteiro@arenaticket.com / senha123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)

const form = reactive({
  email: '',
  senha: ''
})

const errors = reactive({
  email: '',
  senha: '',
  general: ''
})

const clearFieldError = (field: keyof typeof errors) => {
  errors[field] = ''
}

const clearAllErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

const validateForm = () => {
  clearAllErrors()
  let isValid = true

  if (!form.email.trim()) {
    errors.email = 'Email é obrigatório'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email inválido'
    isValid = false
  }

  if (!form.senha.trim()) {
    errors.senha = 'Senha é obrigatória'
    isValid = false
  } else if (form.senha.length < 6) {
    errors.senha = 'Senha deve ter pelo menos 6 caracteres'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    clearAllErrors()
    
    console.log('Attempting login...')
    await authStore.login(form)
    console.log('Login successful, redirecting...')
    
    // Ensure token is properly set before redirecting
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication failed - no token set')
    }
    
    // Redirect to intended page or dashboard
    const redirectTo = route.query.redirect as string || '/'
    router.push(redirectTo)
    
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.response?.status === 401) {
      errors.general = 'Email ou senha incorretos'
    } else if (error.response?.status === 422) {
      // Handle validation errors from API
      const apiErrors = error.response.data?.errors
      if (apiErrors) {
        Object.keys(apiErrors).forEach(field => {
          if (field in errors) {
            errors[field as keyof typeof errors] = apiErrors[field][0]
          }
        })
      } else {
        errors.general = error.response.data?.mensagem || 'Dados inválidos'
      }
    } else {
      errors.general = 'Erro no servidor. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

// Auto-fill demo credentials for testing
const fillDemoCredentials = (role: 'admin' | 'vendedor' | 'porteiro') => {
  const credentials = {
    admin: { email: 'admin@arenaticket.com', senha: 'senha123' },
    vendedor: { email: 'vendedor@arenaticket.com', senha: 'senha123' },
    porteiro: { email: 'porteiro@arenaticket.com', senha: 'senha123' }
  }
  
  form.email = credentials[role].email
  form.senha = credentials[role].senha
  clearAllErrors()
}
</script>