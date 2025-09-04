<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start p-4 rounded-lg shadow-lg border max-w-md transform transition-all duration-300"
          :class="toastClasses(toast.type)"
        >
          <div class="flex-shrink-0">
            <svg
              v-if="toast.type === 'success'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
            </svg>
          </div>
          
          <div class="ml-3 flex-1 min-w-0">
            <h4
              v-if="toast.title"
              class="text-sm font-medium"
              :class="titleClasses(toast.type)"
            >
              {{ toast.title }}
            </h4>
            <p
              class="text-sm"
              :class="messageClasses(toast.type)"
            >
              {{ toast.message }}
            </p>
          </div>
          
          <button
            @click="removeToast(toast.id)"
            class="ml-4 flex-shrink-0 p-1 rounded-md transition-colors"
            :class="closeButtonClasses(toast.type)"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore

const toastClasses = (type: string) => {
  const classes = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const titleClasses = (type: string) => {
  const classes = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const messageClasses = (type: string) => {
  const classes = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const closeButtonClasses = (type: string) => {
  const classes = {
    success: 'text-green-500 hover:text-green-600 hover:bg-green-100',
    error: 'text-red-500 hover:text-red-600 hover:bg-red-100',
    warning: 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100',
    info: 'text-blue-500 hover:text-blue-600 hover:bg-blue-100'
  }
  return classes[type as keyof typeof classes] || classes.info
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>