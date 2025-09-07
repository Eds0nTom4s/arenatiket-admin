<template>
  <Teleport to="body">
    <div
      v-show="isVisible"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="handleBackdropClick"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      />
      
      <!-- Modal -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <div
          ref="modalRef"
          class="relative w-full transform rounded-lg bg-white shadow-xl transition-all"
          :class="sizeClasses"
        >
          <!-- Header -->
          <div
            v-if="showHeader"
            class="flex items-center justify-between border-b border-gray-200 p-6"
          >
            <h3 class="text-lg font-semibold text-gray-900">
              <slot name="title">{{ title }}</slot>
            </h3>
            
            <button
              v-if="closable"
              @click="close"
              class="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-6">
            <slot />
          </div>
          
          <!-- Footer -->
          <div
            v-if="showFooter"
            class="flex items-center justify-end space-x-3 border-t border-gray-200 p-6"
          >
            <slot name="footer">
              <button
                v-if="showCancel"
                @click="close"
                class="btn-secondary"
              >
                {{ cancelText }}
              </button>
              
              <button
                v-if="showConfirm"
                @click="confirm"
                class="btn-primary"
                :disabled="confirmDisabled"
              >
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

interface Props {
  modelValue?: boolean
  show?: boolean  // Compatibilidade
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmDisabled?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  show: false,
  title: '',
  size: 'md',
  closable: true,
  showHeader: true,
  showFooter: false,
  showCancel: true,
  showConfirm: true,
  cancelText: 'Cancelar',
  confirmText: 'Confirmar',
  confirmDisabled: false,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'confirm': []
}>()

const modalRef = ref<HTMLElement>()

// Computed para suportar ambas as propriedades
const isVisible = computed(() => props.modelValue || props.show)

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  return sizes[props.size]
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const confirm = () => {
  emit('confirm')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (props.closeOnBackdrop && event.target === event.currentTarget) {
    close()
  }
}

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable) {
    close()
  }
}

// Focus management
watch(() => isVisible.value, async (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    
    await nextTick()
    if (modalRef.value && modalRef.value.parentNode) {
      modalRef.value.focus()
    }
  } else {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
  }
})

// Cleanup ao desmontar
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<script lang="ts">
export default {
  name: 'BaseModal'
}
</script>