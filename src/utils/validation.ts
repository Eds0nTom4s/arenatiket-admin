/**
 * Validações padronizadas segundo API Contract e Backend corrigido
 * Baseado em RELATORIO_CORRECOES-backend.md
 */

// Regex patterns aligned with backend validations
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  BRAZILIAN_DATE: /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  PHONE: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  QR_CODE: /^QR_[A-Z0-9]{8,12}$/
}

// Validation limits aligned with backend
export const VALIDATION_LIMITS = {
  EVENT: {
    NOME_MAX: 200,
    DESCRICAO_MAX: 1000,
    LOCAL_MAX: 300,
    CAPACIDADE_MIN: 1,
    CAPACIDADE_MAX: 1000000
  },
  USER: {
    NOME_MAX: 100,
    EMAIL_MAX: 100,
    SENHA_MIN: 6,
    SENHA_MAX: 50
  },
  CATEGORY: {
    NOME_MAX: 50,
    DESCRICAO_MAX: 500
  },
  LOTE: {
    NOME_MAX: 100,
    DESCRICAO_MAX: 1000,
    PRECO_MIN: 0.01,
    PRECO_MAX: 99999.99,
    QUANTIDADE_MIN: 1,
    QUANTIDADE_MAX: 1000000
  }
}

// Valid categories according to backend
export const VALID_CATEGORIES = [
  'FUTEBOL',
  'BASQUETEBOL', 
  'VOLEIBOL',
  'MUSICA',
  'TEATRO',
  'DESPORTO',
  'OUTROS'
] as const

// Valid user roles according to API Contract
export const VALID_ROLES = [
  'ADMIN',
  'VENDEDOR', 
  'PORTEIRO'
] as const

// Valid event statuses according to API Contract
export const VALID_EVENT_STATUSES = [
  'ATIVO',
  'INATIVO',
  'ESGOTADO'
] as const

// Valid ticket statuses according to API Contract  
export const VALID_TICKET_STATUSES = [
  'DISPONIVEL',
  'RESERVADO',
  'VENDIDO',
  'USADO',
  'CANCELADO'
] as const

/**
 * Convert Brazilian date format to ISO 8601
 * According to backend corrections - now expects ISO format
 */
export function convertBrazilianToISO(brazilianDate: string): string {
  if (!brazilianDate || brazilianDate.trim() === '') {
    throw new Error('Data não fornecida')
  }
  
  if (!VALIDATION_PATTERNS.BRAZILIAN_DATE.test(brazilianDate)) {
    console.warn('Invalid date format:', brazilianDate)
    throw new Error('Formato de data inválido. Use: DD/MM/YYYY HH:MM')
  }

  const [datePart, timePart] = brazilianDate.split(' ')
  const [day, month, year] = datePart.split('/')
  const [hours, minutes] = timePart.split(':')
  
  // Create date in local timezone first, then convert to ISO
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1, // Month is 0-indexed
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  )

  if (isNaN(date.getTime())) {
    throw new Error('Data inválida')
  }

  // Log timezone information for debugging
  console.log('🔍 Date conversion debug:')
  console.log('🔍 Input:', brazilianDate)
  console.log('🔍 Local date object:', date)
  console.log('🔍 Local timezone offset:', date.getTimezoneOffset())
  console.log('🔍 ISO string:', date.toISOString())
  
  // For backend compatibility, we want to send the date as if it were in UTC
  // but representing the local time
  const utcDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  )
  
  // Adjust for timezone to ensure backend receives the intended local time
  const timezoneOffset = utcDate.getTimezoneOffset() * 60000 // Convert to milliseconds
  const adjustedDate = new Date(utcDate.getTime() - timezoneOffset)
  
  const isoString = adjustedDate.toISOString()
  console.log('🔍 Final ISO string (timezone adjusted):', isoString)
  
  return isoString
}

/**
 * Convert ISO date to Brazilian format for display
 */
export function convertISOToBrazilian(isoDate: string): string {
  if (!isoDate) return ''
  
  const date = new Date(isoDate)
  
  if (isNaN(date.getTime())) {
    console.warn('Invalid ISO date:', isoDate)
    return isoDate
  }
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Validate event data according to backend rules
 */
export function validateEvent(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Nome validation
  if (!data.nome?.trim()) {
    errors.nome = 'Nome é obrigatório'
  } else if (data.nome.length > VALIDATION_LIMITS.EVENT.NOME_MAX) {
    errors.nome = `Nome deve ter no máximo ${VALIDATION_LIMITS.EVENT.NOME_MAX} caracteres`
  }

  // Descrição validation (optional)
  if (data.descricao && data.descricao.length > VALIDATION_LIMITS.EVENT.DESCRICAO_MAX) {
    errors.descricao = `Descrição deve ter no máximo ${VALIDATION_LIMITS.EVENT.DESCRICAO_MAX} caracteres`
  }

  // Data validation - expects Brazilian format from form, converts to ISO
  if (!data.dataHora) {
    errors.dataHora = 'Data e hora são obrigatórias'
  } else {
    try {
      const isoDate = convertBrazilianToISO(data.dataHora)
      const eventDate = new Date(isoDate)
      const now = new Date()
      
      if (eventDate <= now) {
        errors.dataHora = 'A data deve ser no futuro'
      }
    } catch (error) {
      errors.dataHora = error instanceof Error ? error.message : 'Formato de data inválido'
    }
  }

  // Local validation
  if (!data.local?.trim()) {
    errors.local = 'Local é obrigatório'
  } else if (data.local.length > VALIDATION_LIMITS.EVENT.LOCAL_MAX) {
    errors.local = `Local deve ter no máximo ${VALIDATION_LIMITS.EVENT.LOCAL_MAX} caracteres`
  }

  // Categoria validation
  if (!data.categoria) {
    errors.categoria = 'Categoria é obrigatória'
  } else if (!VALID_CATEGORIES.includes(data.categoria)) {
    errors.categoria = 'Categoria inválida'
  }

  // Capacidade validation
  if (!data.capacidadeTotal || data.capacidadeTotal <= 0) {
    errors.capacidadeTotal = 'Capacidade deve ser maior que zero'
  } else if (data.capacidadeTotal > VALIDATION_LIMITS.EVENT.CAPACIDADE_MAX) {
    errors.capacidadeTotal = `Capacidade máxima permitida: ${VALIDATION_LIMITS.EVENT.CAPACIDADE_MAX.toLocaleString()}`
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate user data according to backend rules
 */
export function validateUser(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Nome validation
  if (!data.nome?.trim()) {
    errors.nome = 'Nome é obrigatório'
  } else if (data.nome.length > VALIDATION_LIMITS.USER.NOME_MAX) {
    errors.nome = `Nome deve ter no máximo ${VALIDATION_LIMITS.USER.NOME_MAX} caracteres`
  }

  // Email validation
  if (!data.email?.trim()) {
    errors.email = 'Email é obrigatório'
  } else if (!VALIDATION_PATTERNS.EMAIL.test(data.email)) {
    errors.email = 'Email inválido'
  } else if (data.email.length > VALIDATION_LIMITS.USER.EMAIL_MAX) {
    errors.email = `Email deve ter no máximo ${VALIDATION_LIMITS.USER.EMAIL_MAX} caracteres`
  }

  // Senha validation (only for new users)
  if (data.senha !== undefined) {
    if (!data.senha) {
      errors.senha = 'Senha é obrigatória'
    } else if (data.senha.length < VALIDATION_LIMITS.USER.SENHA_MIN) {
      errors.senha = `Senha deve ter no mínimo ${VALIDATION_LIMITS.USER.SENHA_MIN} caracteres`
    } else if (data.senha.length > VALIDATION_LIMITS.USER.SENHA_MAX) {
      errors.senha = `Senha deve ter no máximo ${VALIDATION_LIMITS.USER.SENHA_MAX} caracteres`
    }
  }

  // Role validation
  if (!data.role) {
    errors.role = 'Perfil é obrigatório'
  } else if (!VALID_ROLES.includes(data.role)) {
    errors.role = 'Perfil inválido'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate QR Code format
 */
export function validateQRCode(qrCode: string): boolean {
  return VALIDATION_PATTERNS.QR_CODE.test(qrCode) || qrCode.length >= 8
}

/**
 * Format currency for display (Portuguese format)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-PT').format(value)
}

/**
 * Validate API Response structure
 */
export function isValidApiResponse(response: any): boolean {
  return (
    response &&
    typeof response.sucesso === 'boolean' &&
    typeof response.mensagem === 'string' &&
    response.dados !== undefined &&
    typeof response.timestamp === 'string'
  )
}