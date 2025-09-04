<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 bg-primary-600">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span class="text-primary-600 font-bold text-lg">A</span>
          </div>
          <span class="text-white font-semibold text-lg">ArenaTicket</span>
        </div>
      </div>
      
      <!-- Navigation -->
      <nav class="mt-5 px-2 space-y-1 h-full overflow-y-auto scrollbar-hide">
        <template v-for="item in navigationItems" :key="item.name">
          <router-link
            v-if="hasPermission(item.permissions)"
            :to="item.to"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
            :class="isActiveRoute(item.to) 
              ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            @click="closeSidebar"
          >
            <svg
              v-if="item.name === 'Dashboard'"
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="isActiveRoute(item.to) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <svg
              v-else-if="item.name === 'Usuários'"
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="isActiveRoute(item.to) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <svg
              v-else-if="item.name === 'Eventos'"
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="isActiveRoute(item.to) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <svg
              v-else-if="item.name === 'Bilhetes'"
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="isActiveRoute(item.to) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M2 9a3 3 0 010-6h1.4l2.6 2.6L8.6 3H12v7l-4 4v1h8v-1l-4-4V3h3.4l2.6 2.6L20.6 3H22a3 3 0 010 6"/>
            </svg>
            <svg
              v-else-if="item.name === 'Validação'"
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="isActiveRoute(item.to) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <svg
              v-else-if="item.name === 'Relatórios'"
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="isActiveRoute(item.to) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            {{ item.name }}
          </router-link>
        </template>
        
        <!-- User Menu at bottom -->
        <div class="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-200 bg-white">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-medium text-sm">
                  {{ user?.nome?.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ user?.nome }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ user?.role }}
              </p>
            </div>
            <button
              @click="handleLogout"
              class="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Logout"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </aside>
    
    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen lg:ml-0">
      <!-- Top header -->
      <header class="sticky top-0 z-40 lg:z-10 bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <!-- Mobile menu button -->
          <button
            @click="toggleSidebar"
            class="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          
          <!-- Page title -->
          <div class="flex-1 lg:flex lg:items-center lg:justify-between">
            <h1 class="text-lg font-semibold text-gray-900 ml-4 lg:ml-0">
              {{ currentPageTitle }}
            </h1>
            
            <!-- Right side actions -->
            <div class="hidden lg:flex lg:items-center lg:space-x-4">
              <!-- Notifications -->
              <button class="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </button>
              
              <!-- User profile -->
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-700">{{ user?.nome }}</span>
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-medium text-sm">
                    {{ user?.nome?.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Page content -->
      <main class="flex-1 bg-gray-50 overflow-y-auto scrollbar-hide">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <router-view />
          </div>
        </div>
      </main>
    </div>
    
    <!-- Mobile sidebar overlay -->
    <div
      v-show="sidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="closeSidebar"
    >
      <div class="absolute inset-0 bg-gray-600 opacity-75"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const sidebarOpen = ref(false)

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    to: '/',
    permissions: ['ANY']
  },
  {
    name: 'Usuários',
    to: '/usuarios',
    permissions: ['ADMIN']
  },
  {
    name: 'Eventos',
    to: '/eventos',
    permissions: ['ADMIN', 'VENDEDOR']
  },
  {
    name: 'Bilhetes',
    to: '/bilhetes',
    permissions: ['ADMIN', 'VENDEDOR', 'PORTEIRO']
  },
  {
    name: 'Validação',
    to: '/validacao',
    permissions: ['ADMIN', 'PORTEIRO']
  },
  {
    name: 'Relatórios',
    to: '/relatorios',
    permissions: ['ADMIN']
  }
]

const currentPageTitle = computed(() => {
  const currentRoute = navigationItems.find(item => 
    item.to === route.path || (item.to !== '/' && route.path.startsWith(item.to))
  )
  return currentRoute?.name || 'ArenaTicket Admin'
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const hasPermission = (permissions: string[]) => {
  return authStore.hasAnyPermission(permissions)
}

const handleLogout = () => {
  authStore.logout()
  sidebarOpen.value = false
}
</script>