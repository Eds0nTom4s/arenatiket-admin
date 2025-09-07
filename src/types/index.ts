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
  dataEvento?: string  // Legacy field
  dataHora: string     // Primary field
  local: string
  categoria: string
  status: 'ATIVO' | 'INATIVO' | 'ESGOTADO'
  capacidadeTotal: number
  bilhetesVendidos: number
  precoMinimo?: number
  precoMaximo?: number
  imagemUrl?: string
  dataCriacao?: string
  ativo?: boolean
}

export interface CreateEventRequest {
  nome: string
  descricao?: string
  dataHora: string  // Brazilian format: dd/MM/yyyy HH:mm
  local: string
  categoria?: string
  capacidadeTotal?: number
  imagemUrl?: string
  ativo?: boolean
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

// === CATEGORIAS ===
export interface Category {
  id: number
  nome: string
  descricao?: string
  ativo: boolean
  dataCriacao?: string
}

export interface CreateCategoryRequest {
  nome: string
  descricao?: string
  ativo?: boolean
}

// === LOTES ===
export interface Lote {
  id: number
  evento: {
    id: number
    nome: string
  }
  categoria: {
    id: number
    nome: string
  }
  nome: string
  descricao?: string
  preco: number
  quantidadeTotal: number
  quantidadeDisponivel: number
  quantidadeVendida: number
  dataInicioVenda: string
  dataFimVenda: string
  ativo: boolean
  dataCriacao?: string
}

export interface CreateLoteRequest {
  eventoId: number
  categoriaId: number
  nome: string
  descricao?: string
  preco: number
  quantidadeTotal: number
  dataInicioVenda: string
  dataFimVenda: string
  ativo?: boolean
}

// === RESERVAS ===
export interface Reserva {
  id: number
  evento: {
    id: number
    nome: string
    dataEvento: string
  }
  lote: {
    id: number
    nome: string
    preco: number
  }
  quantidade: number
  valorTotal: number
  status: 'ATIVA' | 'CANCELADA' | 'CONVERTIDA' | 'EXPIRADA'
  dataReserva: string
  dataExpiracao: string
  nomeCliente: string
  emailCliente: string
  telefoneCliente?: string
  observacoes?: string
  dataCancelamento?: string
  dataConversao?: string
}

export interface CreateReservaRequest {
  eventoId: number
  loteId: number
  quantidade: number
  nomeCliente: string
  emailCliente: string
  telefoneCliente?: string
  observacoes?: string
}

// === PEDIDOS ===
export interface Pedido {
  id: number
  evento: {
    id: number
    nome: string
    dataEvento: string
  }
  usuario: {
    id: number
    nome: string
    email: string
  }
  itens: PedidoItem[]
  valorTotal: number
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'REEMBOLSADO'
  dataPedido: string
  dataConfirmacao?: string
  dataCancelamento?: string
  metodoPagamento?: string
  observacoes?: string
  bilhetes?: Ticket[]
}

export interface PedidoItem {
  id: number
  lote: {
    id: number
    nome: string
    preco: number
  }
  quantidade: number
  precoUnitario: number
  precoTotal: number
}

// === VENDAS/CHECKOUT ===
export interface CheckoutRequest {
  eventoId: number
  itens: CheckoutItem[]
  nomeComprador: string
  emailComprador: string
  telefoneComprador?: string
  metodoPagamento: string
  observacoes?: string
}

export interface CheckoutItem {
  loteId: number
  quantidade: number
}

export interface CheckoutResponse {
  pedidoId: number
  valorTotal: number
  status: string
  bilhetes: Ticket[]
  dataVencimento?: string
  linkPagamento?: string
}

// === RELATÓRIOS ===
export interface RelatorioVendas {
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
  vendasPorEvento: VendaEvento[]
  vendasPorDia: VendaDia[]
  vendasPorCategoria?: VendaCategoria[]
}

export interface VendaEvento {
  eventoId: number
  nomeEvento: string
  bilhetesVendidos: number
  valorVendas: number
  percentualOcupacao: number
}

export interface VendaDia {
  data: string
  bilhetesVendidos: number
  valorVendas: number
}

export interface VendaCategoria {
  categoriaId: number
  nomeCategoria: string
  bilhetesVendidos: number
  valorVendas: number
}

export interface RelatorioEvento {
  evento: {
    id: number
    nome: string
    dataEvento: string
    local: string
    capacidadeTotal: number
  }
  resumo: {
    bilhetesVendidos: number
    bilhetesDisponiveis: number
    valorTotalVendas: number
    percentualOcupacao: number
  }
  vendasPorLote: {
    loteId: number
    nomeLote: string
    quantidadeTotal: number
    quantidadeVendida: number
    valorVendas: number
    percentualVendido: number
  }[]
  vendasPorPeriodo: VendaDia[]
}

// === DASHBOARD ===
export interface DashboardStats {
  totalEventos: number
  eventosAtivos: number
  totalBilhetesVendidos: number
  valorTotalVendas: number
  usuariosAtivos: number
  reservasAtivas: number
  pedidosPendentes: number
  bilhetesValidados: number
}

// === ENUMS ===
export type StatusEvento = 'ATIVO' | 'INATIVO' | 'ESGOTADO'
export type StatusBilhete = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'USADO' | 'CANCELADO'
export type StatusReserva = 'ATIVA' | 'CANCELADA' | 'CONVERTIDA' | 'EXPIRADA'
export type StatusPedido = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'REEMBOLSADO'
export type UserRole = 'ADMIN' | 'VENDEDOR' | 'PORTEIRO'