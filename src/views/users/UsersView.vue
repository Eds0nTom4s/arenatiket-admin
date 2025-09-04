<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gerencie usuários do sistema e suas permissões.
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0">
        <BaseButton
          @click="openCreateModal"
          text="Novo Usuário"
        />
      </div>
    </div>
    
    <!-- Filters -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div class="flex-1 max-w-md">
          <BaseInput
            v-model="filters.search"
            type="text"
            placeholder="Buscar por nome ou email..."
            @input="debouncedSearch"
          />
        </div>
        
        <div class="flex items-center space-x-4">
          <BaseInput
            v-model="filters.role"
            type="select"
            placeholder="Todos os perfis"
            :options="roleOptions"
            @change="applyFilters"
          />
          
          <BaseButton
            @click="clearFilters"
            text="Limpar"
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    </div>
    
    <!-- Users Table -->
    <BaseTable
      title="Lista de Usuários"
      :columns="columns"
      :data="safeUsers"
      :loading="loading"
      :pagination="pagination"
      :show-edit="true"
      :show-delete="true"
      empty-title="Nenhum usuário encontrado"
      empty-message="Não há usuários cadastrados no sistema."
      @edit="openEditModal"
      @delete="confirmDelete"
      @page-change="changePage"
    >
      <!-- Custom cell for status -->
      <template #cell(ativo)="{ value }">
        <span
          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
          :class="value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          {{ value ? 'Ativo' : 'Inativo' }}
        </span>
      </template>
      
      <!-- Custom cell for role -->
      <template #cell(role)="{ value }">
        <span
          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
          :class="getRoleClass(value)"
        >
          {{ getRoleLabel(value) }}
        </span>
      </template>
      
      <!-- Custom cell for creation date -->
      <template #cell(dataCriacao)="{ value }">
        <span class="text-sm text-gray-900">
          {{ formatDate(value) }}
        </span>
      </template>
    </BaseTable>
    
    <!-- Create/Edit User Modal -->
    <BaseModal
      v-model="showModal"
      :title="modalTitle"
      size="md"
      :show-footer="true"
      :show-confirm="true"
      :confirm-text="isEditing ? 'Atualizar' : 'Criar'"
      :confirm-disabled="formLoading"
      @confirm="submitForm"
      @close="closeModal"
    >
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Name -->
        <BaseInput
          v-model="form.nome"
          type="text"
          label="Nome Completo"
          placeholder="Digite o nome completo"
          required
          :error-message="errors.nome"
          @blur="clearFieldError('nome')"
        />
        
        <!-- Email -->
        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="Digite o email"
          required
          :error-message="errors.email"
          @blur="clearFieldError('email')"
        />
        
        <!-- Password (only when creating) -->
        <BaseInput
          v-if="!isEditing"
          v-model="form.senha"
          type="password"
          label="Senha"
          placeholder="Digite a senha"
          required
          help-text="Mínimo de 6 caracteres"
          :error-message="errors.senha"
          @blur="clearFieldError('senha')"
        />
        
        <!-- Role -->
        <BaseInput
          v-model="form.role"
          type="select"
          label="Perfil"
          placeholder="Selecione o perfil"
          required
          :options="roleOptions"
          :error-message="errors.role"
          @blur="clearFieldError('role')"
        />
        
        <!-- Active status (only when editing) -->
        <BaseInput
          v-if="isEditing"
          v-model="form.ativo"
          type="checkbox"
          checkbox-label="Usuário ativo"
          help-text="Desmarque para desativar o usuário"
        />
      </form>
    </BaseModal>
    
    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-model="showDeleteModal"
      title="Confirmar Exclusão"
      size="sm"
      :show-footer="true"
      :show-confirm="true"
      confirm-text="Excluir"
      cancel-text="Cancelar"
      @confirm="deleteUser"
      @close="cancelDelete"
    >
      <p class="text-sm text-gray-600">
        Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.nome }}</strong>?
        Esta ação não pode ser desfeita.
      </p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import type { User, CreateUserRequest } from '@/types'
import BaseTable from '@/components/base/BaseTable.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const usersStore = useUsersStore()
const { users, loading, pagination } = storeToRefs(usersStore)

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const formLoading = ref(false)
const userToDelete = ref<User | null>(null)

// Form data
const form = reactive({
  nome: '',
  email: '',
  senha: '',
  role: '',
  ativo: true
})

// Form errors
const errors = reactive({
  nome: '',
  email: '',
  senha: '',
  role: ''
})

// Filters
const filters = reactive({
  search: '',
  role: '',
  page: 0,
  size: 20
})

// Table columns
const columns = [
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Perfil' },
  { key: 'ativo', label: 'Status' },
  { key: 'dataCriacao', label: 'Criado em', sortable: true }
]

// Role options
const roleOptions = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
  { value: 'PORTEIRO', label: 'Porteiro' }
]

// Computed
const safeUsers = computed(() => {
  return users.value || []
})

const modalTitle = computed(() => {
  return isEditing.value ? 'Editar Usuário' : 'Novo Usuário'
})

// Methods
const loadUsers = async () => {
  try {
    await usersStore.fetchUsers({
      page: filters.page,
      size: filters.size,
      ...(filters.role && { role: filters.role })
    })
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const applyFilters = () => {
  filters.page = 0
  loadUsers()
}

const clearFilters = () => {
  filters.search = ''
  filters.role = ''
  filters.page = 0
  loadUsers()
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const changePage = (page: number) => {
  filters.page = page
  loadUsers()
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getRoleLabel = (role: string) => {
  const labels = {
    ADMIN: 'Administrador',
    VENDEDOR: 'Vendedor',
    PORTEIRO: 'Porteiro'
  }
  return labels[role as keyof typeof labels] || role
}

const getRoleClass = (role: string) => {
  const classes = {
    ADMIN: 'bg-purple-100 text-purple-800',
    VENDEDOR: 'bg-blue-100 text-blue-800',
    PORTEIRO: 'bg-green-100 text-green-800'
  }
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

// Modal functions
const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (user: User) => {
  isEditing.value = true
  form.nome = user.nome
  form.email = user.email
  form.role = user.role
  form.ativo = user.ativo
  form.senha = '' // Don't populate password
  usersStore.setCurrentUser(user)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  usersStore.setCurrentUser(null)
}

const resetForm = () => {
  form.nome = ''
  form.email = ''
  form.senha = ''
  form.role = ''
  form.ativo = true
  clearAllErrors()
}

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

  if (!form.nome.trim()) {
    errors.nome = 'Nome é obrigatório'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email é obrigatório'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email inválido'
    isValid = false
  }

  if (!isEditing.value && !form.senha.trim()) {
    errors.senha = 'Senha é obrigatória'
    isValid = false
  } else if (!isEditing.value && form.senha.length < 6) {
    errors.senha = 'Senha deve ter pelo menos 6 caracteres'
    isValid = false
  }

  if (!form.role) {
    errors.role = 'Perfil é obrigatório'
    isValid = false
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  try {
    formLoading.value = true

    if (isEditing.value) {
      const currentUser = usersStore.currentUser
      if (currentUser) {
        await usersStore.updateUser(currentUser.id, {
          nome: form.nome,
          email: form.email,
          role: form.role as any
        })
      }
    } else {
      await usersStore.createUser(form as CreateUserRequest)
    }

    closeModal()
    // Note: Store automatically updates the users list
  } catch (error: any) {
    console.error('Error submitting form:', error)
    
    // Handle validation errors from API
    if (error.response?.status === 422) {
      const apiErrors = error.response.data?.errors
      if (apiErrors) {
        Object.keys(apiErrors).forEach(field => {
          if (field in errors) {
            errors[field as keyof typeof errors] = apiErrors[field][0]
          }
        })
      }
    }
  } finally {
    formLoading.value = false
  }
}

// Delete functions
const confirmDelete = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const cancelDelete = () => {
  userToDelete.value = null
  showDeleteModal.value = false
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    await usersStore.deleteUser(userToDelete.value.id)
    cancelDelete()
    // Note: Store automatically updates the users list
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

// Load data on mount
onMounted(() => {
  loadUsers()
})
</script>