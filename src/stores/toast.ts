import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    toasts.value.push(newToast)
    
    // Auto remove toast
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    toasts.value = []
  }

  // Helper methods
  const showSuccess = (message: string, title?: string) => {
    return addToast({ type: 'success', message, title })
  }

  const showError = (message: string, title?: string) => {
    return addToast({ type: 'error', message, title, duration: 7000 })
  }

  const showWarning = (message: string, title?: string) => {
    return addToast({ type: 'warning', message, title })
  }

  const showInfo = (message: string, title?: string) => {
    return addToast({ type: 'info', message, title })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})