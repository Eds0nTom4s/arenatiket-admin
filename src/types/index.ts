export interface ApiResponse<T = any> {
  sucesso: boolean
  mensagem: string
  dados: T
  timestamp: string
}

export interface PageableResponse<T> {
  content: T[]
  pageable: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export interface User {
  id: number
  nome: string
  email: string
  role: 'ADMIN' | 'VENDEDOR' | 'PORTEIRO'
  ativo: boolean
  dataCriacao?: string
}

export interface LoginCredentials {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  type: string
  id: number
  nome: string
  email: string
  role: 'ADMIN' | 'VENDEDOR' | 'PORTEIRO'
  ativo?: boolean
}

export interface CreateUserRequest {
  nome: string
  email: string
  senha: string
  role: 'ADMIN' | 'VENDEDOR' | 'PORTEIRO'
}

export interface Event {
  id: number
  nome: string
  descricao: string
  dataEvento: string
  local: string
  categoria: string
  status: 'ATIVO' | 'INATIVO' | 'ESGOTADO'
  capacidadeTotal: number
  bilhetesVendidos: number
  precoMinimo?: number
  precoMaximo?: number
  imagemUrl?: string
  dataCriacao?: string
}

export interface CreateEventRequest {
  nome: string
  descricao: string
  dataEvento: string
  local: string
  categoria: string
  capacidadeTotal: number
  imagemUrl?: string
}

export interface Ticket {
  id: number
  evento: {
    id: number
    nome: string
    dataEvento: string
    local: string
  }
  categoriaBilhete: {
    id: number
    nome: string
    preco: number
    setor?: string
    fila?: number
    assento?: number
  }
  codigoQR: string
  status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'USADO' | 'CANCELADO'
  dataCompra: string
  dataValidacao?: string
  nomeComprador: string
  emailComprador: string
}

export interface TicketValidation {
  bilheteId: number
  valido: boolean
  status?: string
  evento?: {
    nome: string
    dataEvento: string
    local: string
  }
  categoria?: string
  assento?: string
  nomeComprador?: string
  dataValidacao?: string
  validadoPor?: string
  motivo?: string
  dataValidacaoAnterior?: string
}

export interface SalesReport {
  periodo: {
    dataInicio: string
    dataFim: string
  }
  resumo: {
    totalBilhetesVendidos: number
    valorTotalVendas: number
    ticketMedio: number
    eventosComVendas: number
  }
  vendasPorEvento: Array<{
    eventoId: number
    nomeEvento: string
    bilhetesVendidos: number
    valorVendas: number
    percentualOcupacao: number
  }>
  vendasPorDia: Array<{
    data: string
    bilhetesVendidos: number
    valorVendas: number
  }>
}

export interface TicketCount {
  status: string
  count: number
}