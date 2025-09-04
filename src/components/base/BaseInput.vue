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
      class="input-field w-full"
      :class="[
        errorMessage ? 'border-red-300 focus:ring-red-500' : '',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      @blur="handleBlur"
    />
    
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
import { computed, useId } from 'vue'

interface Option {
  value: any
  label: string
}

interface Props {
  modelValue: any
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'checkbox'
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

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

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