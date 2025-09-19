<template>
  <div>
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <!-- Text Input -->
    <input
      v-if="type === 'text' || type === 'email' || type === 'password' || type === 'number'"
      :id="inputId"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :min="min"
      :max="max"
      :step="step"
      class="input-field w-full"
      :class="[
        errorMessage ? 'border-red-300 focus:ring-red-500' : '',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      @blur="handleBlur"
    />
    
    <!-- Textarea -->
    <textarea
      v-else-if="type === 'textarea'"
      :id="inputId"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      class="input-field w-full resize-vertical"
      :class="[
        errorMessage ? 'border-red-300 focus:ring-red-500' : '',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      @blur="handleBlur"
    />
    
    <!-- Select -->
    <select
      v-else-if="type === 'select'"
      :id="inputId"
      v-model="inputValue"
      :disabled="disabled"
      :required="required"
      class="input-field w-full"
      :class="[
        errorMessage ? 'border-red-300 focus:ring-red-500' : '',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      @blur="handleBlur"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
    
    <!-- Date Input -->
    <input
      v-else-if="type === 'date' || type === 'datetime-local'"
      :id="inputId"
      v-model="inputValue"
      :type="type"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :min="min"
      :max="max"
      :step="step"
      class="input-field w-full"
      :class="[
        errorMessage ? 'border-red-300 focus:ring-red-500' : '',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      @blur="handleBlur"
    />
    
    <!-- Brazilian DateTime Input usando Vue Datepicker -->
    <div v-else-if="type === 'datetime-brazilian'" class="space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Campo de Data -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            📅 Data do Evento
          </label>
          <VueDatePicker
            v-model="dateOnlyValue"
            :format="'dd/MM/yyyy'"
            :enable-time-picker="false"
            :auto-apply="true"
            :placeholder="'Selecione a data'"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            locale="pt"
            class="w-full"
            @update:model-value="updateDateOnly"
            @blur="handleBlur"
          >
            <template #input-icon>
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </template>
          </VueDatePicker>
        </div>
        
        <!-- Campo de Hora -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            🕐 Hora do Evento
          </label>
          <VueDatePicker
            v-model="timeOnlyValue"
            time-picker
            :is24="true"
            :auto-apply="true"
            :placeholder="'Selecione a hora'"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            locale="pt"
            class="w-full"
            @update:model-value="updateTimeOnly"
            @blur="handleBlur"
          >
            <template #input-icon>
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </template>
          </VueDatePicker>
        </div>
      </div>
      
      <!-- Preview da Data/Hora Selecionada -->
      <div v-if="dateOnlyValue && timeOnlyValue" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm font-medium text-blue-800">
            Data e Hora Selecionadas:
          </span>
          <span class="text-sm font-semibold text-blue-900 bg-blue-100 px-2 py-1 rounded">
            {{ formatPreview() }}
          </span>
        </div>
      </div>
      
      <div class="text-xs text-gray-500 flex items-center space-x-1">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <span>Campos separados: Data (DD/MM/AAAA) + Hora (HH:MM)</span>
      </div>
    </div>
    
    <!-- Checkbox -->
    <div v-else-if="type === 'checkbox'" class="flex items-center">
      <input
        :id="inputId"
        v-model="inputValue"
        type="checkbox"
        :disabled="disabled"
        :required="required"
        class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        :class="disabled ? 'cursor-not-allowed' : ''"
        @blur="handleBlur"
      />
      <label
        :for="inputId"
        class="ml-2 text-sm text-gray-700"
        :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
      >
        {{ checkboxLabel }}
      </label>
    </div>
    
    <!-- Help Text -->
    <p
      v-if="helpText && !errorMessage"
      class="mt-1 text-sm text-gray-500"
    >
      {{ helpText }}
    </p>
    
    <!-- Error Message -->
    <p
      v-if="errorMessage"
      class="mt-1 text-sm text-red-600"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

interface Option {
  value: any
  label: string
}

interface Props {
  modelValue: any
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'datetime-brazilian' | 'checkbox'
  label?: string
  placeholder?: string
  helpText?: string
  errorMessage?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  rows?: number
  min?: string | number
  max?: string | number
  step?: string | number
  options?: Option[] | string[]
  optionValue?: string
  optionLabel?: string
  checkboxLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  label: '',
  placeholder: '',
  helpText: '',
  errorMessage: '',
  disabled: false,
  readonly: false,
  required: false,
  rows: 3,
  options: () => [],
  optionValue: 'value',
  optionLabel: 'label',
  checkboxLabel: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'blur': []
}>()

const inputId = useId()

// For Vue Datepicker
const datePickerValue = ref<Date | null>(null)
const dateOnlyValue = ref<Date | null>(null)
const timeOnlyValue = ref<{ hours: number; minutes: number; seconds?: number } | null>(null)

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Convert Brazilian format string to Date object
const parseBrazilianDate = (brazilianDateString: string): Date | null => {
  if (!brazilianDateString) return null
  
  try {
    if (brazilianDateString.includes('T')) {
      // ISO format
      return new Date(brazilianDateString)
    } else if (brazilianDateString.includes('/')) {
      // Brazilian format: DD/MM/YYYY HH:MM
      const [datePart, timePart] = brazilianDateString.split(' ')
      if (datePart && timePart) {
        const [day, month, year] = datePart.split('/')
        const [hours, minutes] = timePart.split(':')
        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        )
      }
    }
    return new Date(brazilianDateString)
  } catch {
    return null
  }
}

// Convert Date object to Brazilian format string
const formatToBrazilian = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Format preview for separated fields
const formatPreview = (): string => {
  if (!dateOnlyValue.value || !timeOnlyValue.value) return ''
  
  const day = dateOnlyValue.value.getDate().toString().padStart(2, '0')
  const month = (dateOnlyValue.value.getMonth() + 1).toString().padStart(2, '0')
  const year = dateOnlyValue.value.getFullYear()
  const hours = timeOnlyValue.value.hours.toString().padStart(2, '0')
  const minutes = timeOnlyValue.value.minutes.toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Watch for changes in modelValue to update datepicker
watch(() => props.modelValue, (newValue) => {
  if (props.type === 'datetime-brazilian') {
    const parsedDate = parseBrazilianDate(newValue)
    if (parsedDate) {
      // Update combined datepicker
      datePickerValue.value = parsedDate
      
      // Update separated fields
      dateOnlyValue.value = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
      timeOnlyValue.value = {
        hours: parsedDate.getHours(),
        minutes: parsedDate.getMinutes()
      }
    } else {
      datePickerValue.value = null
      dateOnlyValue.value = null
      timeOnlyValue.value = null
    }
  }
}, { immediate: true })

// Update Brazilian datetime when datepicker changes
const updateBrazilianDateTime = (selectedDate: Date | null) => {
  if (props.type === 'datetime-brazilian' && selectedDate) {
    const brazilianFormat = formatToBrazilian(selectedDate)
    emit('update:modelValue', brazilianFormat)
  } else if (!selectedDate) {
    emit('update:modelValue', '')
  }
}

// Update when date field changes
const updateDateOnly = (selectedDate: Date | null) => {
  if (props.type === 'datetime-brazilian') {
    dateOnlyValue.value = selectedDate
    console.log('🔍 BaseInput - Date selected:', selectedDate)
    updateSeparatedDateTime()
  }
}

// Update when time field changes
const updateTimeOnly = (selectedTime: { hours: number; minutes: number; seconds?: number } | null) => {
  if (props.type === 'datetime-brazilian') {
    timeOnlyValue.value = selectedTime
    console.log('🔍 BaseInput - Time selected:', selectedTime)
    updateSeparatedDateTime()
  }
}

// Combine date and time into Brazilian format
const updateSeparatedDateTime = () => {
  console.log('🔍 BaseInput DEBUG - updateSeparatedDateTime called')
  console.log('🔍 BaseInput DEBUG - dateOnlyValue:', dateOnlyValue.value)
  console.log('🔍 BaseInput DEBUG - timeOnlyValue:', timeOnlyValue.value)
  
  if (dateOnlyValue.value && timeOnlyValue.value) {
    const day = dateOnlyValue.value.getDate().toString().padStart(2, '0')
    const month = (dateOnlyValue.value.getMonth() + 1).toString().padStart(2, '0')
    const year = dateOnlyValue.value.getFullYear()
    const hours = timeOnlyValue.value.hours.toString().padStart(2, '0')
    const minutes = timeOnlyValue.value.minutes.toString().padStart(2, '0')
    
    const brazilianFormat = `${day}/${month}/${year} ${hours}:${minutes}`
    console.log('✅ BaseInput DEBUG - Generated Brazilian format:', brazilianFormat)
    emit('update:modelValue', brazilianFormat)
  } else if (dateOnlyValue.value && !timeOnlyValue.value) {
    // Date selected but no time - set default time to current hour
    const now = new Date()
    const day = dateOnlyValue.value.getDate().toString().padStart(2, '0')
    const month = (dateOnlyValue.value.getMonth() + 1).toString().padStart(2, '0')
    const year = dateOnlyValue.value.getFullYear()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = '00' // Default to :00
    
    const brazilianFormat = `${day}/${month}/${year} ${hours}:${minutes}`
    console.log('⚠️ BaseInput DEBUG - Date only, using default time:', brazilianFormat)
    
    // Also set the time picker to the default time
    timeOnlyValue.value = { hours: now.getHours(), minutes: 0 }
    
    emit('update:modelValue', brazilianFormat)
  } else if (!dateOnlyValue.value && !timeOnlyValue.value) {
    console.log('⚠️ BaseInput DEBUG - Both date and time are null, emitting empty string')
    emit('update:modelValue', '')
  } else {
    console.log('⚠️ BaseInput DEBUG - Partial data - Date:', !!dateOnlyValue.value, 'Time:', !!timeOnlyValue.value)
    // Don't emit anything if only time is selected without date
  }
}

const getOptionValue = (option: any) => {
  if (typeof option === 'string') return option
  return option[props.optionValue]
}

const getOptionLabel = (option: any) => {
  if (typeof option === 'string') return option
  return option[props.optionLabel]
}

const handleBlur = () => {
  emit('blur')
}
</script>