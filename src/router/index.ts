import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Login - ArenaTicket Admin'
    }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { 
          title: 'Dashboard - ArenaTicket Admin',
          permissions: ['ANY']
        }
      },
      {
        path: '/usuarios',
        name: 'Users',
        component: () => import('@/views/users/UsersView.vue'),
        meta: { 
          title: 'Usuários - ArenaTicket Admin',
          permissions: ['ADMIN']
        }
      },
      {
        path: '/eventos',
        name: 'Events',
        component: () => import('@/views/events/EventsView.vue'),
        meta: { 
          title: 'Eventos - ArenaTicket Admin',
          permissions: ['ADMIN', 'VENDEDOR']
        }
      },
      {
        path: '/eventos/:id',
        name: 'EventDetail',
        component: () => import('@/views/events/EventDetailView.vue'),
        meta: { 
          title: 'Detalhes do Evento - ArenaTicket Admin',
          permissions: ['ADMIN', 'VENDEDOR']
        }
      },
      {
        path: '/bilhetes',
        name: 'Tickets',
        component: () => import('@/views/tickets/TicketsView.vue'),
        meta: { 
          title: 'Bilhetes - ArenaTicket Admin',
          permissions: ['ADMIN', 'VENDEDOR', 'PORTEIRO']
        }
      },
      {
        path: '/validacao',
        name: 'Validation',
        component: () => import('@/views/tickets/ValidationView.vue'),
        meta: { 
          title: 'Validação de Bilhetes - ArenaTicket Admin',
          permissions: ['ADMIN', 'PORTEIRO']
        }
      },
      {
        path: '/relatorios',
        name: 'Reports',
        component: () => import('@/views/reports/ReportsView.vue'),
        meta: { 
          title: 'Relatórios - ArenaTicket Admin',
          permissions: ['ADMIN']
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { 
      title: 'Página não encontrada - ArenaTicket Admin',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage
  if (!authStore.isAuthenticated) {
    authStore.initializeAuth()
  }
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // Check authentication requirements
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Check permissions
    const permissions = to.meta.permissions as string[]
    if (permissions && permissions.length > 0) {
      const hasPermission = authStore.hasAnyPermission(permissions)
      
      if (!hasPermission) {
        // Redirect to dashboard if no permission
        next({ name: 'Dashboard' })
        return
      }
    }
  } else {
    // If route doesn't require auth and user is authenticated
    if (authStore.isAuthenticated && to.name === 'Login') {
      // Redirect to dashboard if trying to access login while authenticated
      next({ name: 'Dashboard' })
      return
    }
  }
  
  next()
})

// Navigation error handling
router.onError((error) => {
  console.error('Router error:', error)
})

export default router