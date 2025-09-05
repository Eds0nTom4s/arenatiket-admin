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
    
    <!-- Brazilian DateTime Input (DD/MM/YYYY HH:MM) -->
    <div v-else-if="type === 'datetime-brazilian'" class="grid grid-cols-2 gap-2">
      <!-- Date Input (DD/MM/YYYY) -->
      <div>
        <input
          :id="inputId + '_date'"
          v-model="dateValue"
          type="date"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          class="input-field w-full"
          :class="[
            errorMessage ? 'border-red-300 focus:ring-red-500' : '',
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          ]"
          @input="updateDateTime"
          @blur="handleBlur"
        />
      </div>
      
      <!-- Time Input (HH:MM) -->
      <div>
        <input
          :id="inputId + '_time'"
          v-model="timeValue"
          type="time"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          class="input-field w-full"
          :class="[
            errorMessage ? 'border-red-300 focus:ring-red-500' : '',
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          ]"
          @input="updateDateTime"
          @blur="handleBlur"
        />
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

// For datetime-european type
const dateValue = ref('')
const timeValue = ref('')

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Watch for changes in modelValue to update date/time fields
watch(() => props.modelValue, (newValue) => {
  if (props.type === 'datetime-brazilian' && newValue) {
    // Handle both ISO string and Brazilian format
    let date: Date;
    
    if (newValue.includes('T')) {
      // ISO format: 2025-09-13T15:30:00
      date = new Date(newValue);
    } else if (newValue.includes('/')) {
      // Brazilian format: 13/09/2025 15:30
      const [datePart, timePart] = newValue.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    } else {
      date = new Date(newValue);
    }
    
    if (!isNaN(date.getTime())) {
      // Format date as YYYY-MM-DD for date input
      dateValue.value = date.toISOString().split('T')[0];
      // Format time as HH:MM for time input (without seconds)
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      timeValue.value = `${hours}:${minutes}`;
    }
  }
}, { immediate: true })

// Update datetime when date or time changes
const updateDateTime = () => {
  if (props.type === 'datetime-brazilian' && dateValue.value && timeValue.value) {
    const [year, month, day] = dateValue.value.split('-');
    const [hours, minutes] = timeValue.value.split(':');
    
    // Create Brazilian format: dd/MM/yyyy HH:mm
    const brazilianFormat = `${day}/${month}/${year} ${hours}:${minutes}`;
    
    emit('update:modelValue', brazilianFormat);
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