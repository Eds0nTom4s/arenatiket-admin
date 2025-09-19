import axios, { type AxiosResponse, type AxiosError } from 'axios'
import type { 
  ApiResponse, 
  PageableResponse, 
  User, 
  LoginCredentials, 
  LoginResponse,
  CreateUserRequest,
  Event,
  CreateEventRequest,
  Ticket,
  TicketValidation,
  SalesReport,
  TicketCount,
  Category,
  CreateCategoryRequest,
  Lote,
  CreateLoteRequest,
  Reserva,
  CreateReservaRequest,
  Pedido,
  CheckoutRequest,
  CheckoutResponse,
  RelatorioVendas,
  RelatorioEvento,
  DashboardStats
} from '@/types'
import router from '@/router'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Criar instância do axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptador de requisição - adicionar JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Adding token to request:', token.substring(0, 10) + '...')
    } else {
      console.log('No token found for request')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptador de resposta - tratamento de erros
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log successful responses for debugging
    console.log('API Success Response:', {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
      success: response.data.sucesso,
      message: response.data.mensagem
    })
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      success: error.response?.data?.sucesso,
      message: error.response?.data?.mensagem,
      timestamp: error.response?.data?.timestamp
    })
    
    // Use import dinâmico para evitar dependência circular
    const showError = (message: string) => {
      // Fallback para console se o toast store não estiver disponível
      try {
        import('@/stores/toast').then(({ useToastStore }) => {
          const toastStore = useToastStore()
          toastStore.showError(message)
        })
      } catch {
        console.error(message)
      }
    }
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      const token = localStorage.getItem('token')
      console.error('401 Unauthorized - Token:', token ? token.substring(0, 10) + '...' : 'No token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      showError('Sessão expirada. Faça login novamente.')
      router.push('/login')
    } else if (error.response?.status === 403) {
      showError(error.response.data?.mensagem || 'Você não tem permissão para esta ação.')
    } else if (error.response?.status === 404) {
      showError(error.response.data?.mensagem || 'Recurso não encontrado.')
    } else if (error.response?.status === 409) {
      showError(error.response.data?.mensagem || 'Conflito de dados.')
    } else if (error.response?.status === 422) {
      showError(error.response.data?.mensagem || 'Dados inválidos.')
    } else if (error.response && error.response.status >= 500) {
      showError(error.response.data?.mensagem || 'Erro interno do servidor. Tente novamente.')
    } else {
      showError(error.response?.data?.mensagem || error.message || 'Erro na requisição.')
    }
    
    return Promise.reject(error)
  }
)

// API Client class
export class ApiService {
  // Autenticação
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('Making login request with credentials:', { email: credentials.email, senha: '***' })
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    console.log('Raw API Response:', response.data)
    console.log('Response status:', response.status)
    console.log('Response data keys:', Object.keys(response.data))
    console.log('Response dados:', response.data.dados)
    console.log('Response dados keys:', Object.keys(response.data.dados || {}))
    return response.data.dados
  }

  static async register(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData)
    return response.data.dados
  }

  // Usuários (ADMIN)
  static async getUsers(params?: {
    page?: number
    size?: number
    role?: string
  }): Promise<PageableResponse<User> | User[]> {
    const response = await apiClient.get<ApiResponse<PageableResponse<User>> | ApiResponse<User[]>>('/admin/usuarios', { params })
    
    // Handle both paginated and direct array responses
    const data = response.data.dados
    
    // If it's already an array, return it directly
    if (Array.isArray(data)) {
      return data
    }
    
    // If it's a paginated response, return it
    return data as PageableResponse<User>
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/admin/usuarios', userData)
    return response.data.dados
  }

  static async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/usuarios/${id}`, userData)
    return response.data.dados
  }

  static async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/usuarios/${id}`)
  }

  // Eventos
  static async getEvents(params?: {
    page?: number
    size?: number
    categoria?: string
    status?: string
  }): Promise<Event[]> {
    const response = await apiClient.get<ApiResponse<Event[]>>('/eventos', { params })
    return response.data.dados
  }

  static async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get<ApiResponse<Event>>(`/eventos/${id}`)
    return response.data.dados
  }

  static async createEvent(eventData: CreateEventRequest): Promise<Event> {
    console.log('API Service - Creating event with data:', eventData)
    console.log('API Service - Event data keys:', Object.keys(eventData))
    
    try {
      const response = await apiClient.post<ApiResponse<Event>>('/admin/eventos', eventData)
      return response.data.dados
    } catch (error: any) {
      console.error('🔴 API Service - Event creation failed')
      console.error('🔴 Error status:', error.response?.status)
      console.error('🔴 Error message:', error.response?.data?.mensagem)
      console.error('🔴 Validation details:', error.response?.data?.dados)
      console.error('🔴 Full error response:', JSON.stringify(error.response?.data, null, 2))
      throw error
    }
  }

  static async updateEvent(id: number, eventData: Partial<CreateEventRequest>): Promise<Event> {
    const response = await apiClient.put<ApiResponse<Event>>(`/admin/eventos/${id}`, eventData)
    return response.data.dados
  }

  // Bilhetes
  static async getTicket(id: number): Promise<Ticket> {
    const response = await apiClient.get<ApiResponse<Ticket>>(`/bilhetes/${id}`)
    return response.data.dados
  }

  static async getTicketByQR(codigoQR: string): Promise<Ticket> {
    const response = await apiClient.get<ApiResponse<Ticket>>(`/bilhetes/qr/${codigoQR}`)
    return response.data.dados
  }

  static async validateTicket(codigoQR: string): Promise<TicketValidation> {
    const response = await apiClient.post<ApiResponse<TicketValidation>>(`/porteiro/bilhetes/validar?codigoQR=${codigoQR}`)
    return response.data.dados
  }

  static async getTicketCount(status: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(`/admin/bilhetes/contagem/${status}`)
    return response.data.dados
  }

  // Relatórios
  static async getSalesReport(params: {
    dataInicio: string
    dataFim: string
    eventoId?: number
  }): Promise<SalesReport> {
    const response = await apiClient.get<ApiResponse<SalesReport>>('/admin/relatorios/vendas', { params })
    return response.data.dados
  }

  static async getEventReport(id: number): Promise<RelatorioEvento> {
    const response = await apiClient.get<ApiResponse<RelatorioEvento>>(`/admin/relatorios/evento/${id}`)
    return response.data.dados
  }

  // Categorias (ADMIN)
  static async getCategories(params?: {
    page?: number
    size?: number
  }): Promise<PageableResponse<Category> | Category[]> {
    const response = await apiClient.get<ApiResponse<PageableResponse<Category>> | ApiResponse<Category[]>>('/admin/categorias', { params })
    return response.data.dados
  }

  static async getCategoriesPublic(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categorias')
    return response.data.dados
  }

  static async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>('/admin/categorias', data)
    return response.data.dados
  }

  static async updateCategory(id: number, data: Partial<CreateCategoryRequest>): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/admin/categorias/${id}`, data)
    return response.data.dados
  }

  static async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/admin/categorias/${id}`)
  }

  // Lotes (ADMIN)
  static async getLotes(params?: {
    page?: number
    size?: number
    includeRelations?: boolean
  }): Promise<PageableResponse<Lote> | Lote[]> {
    const response = await apiClient.get<ApiResponse<PageableResponse<Lote>> | ApiResponse<Lote[]>>('/admin/lotes', { 
      params: {
        ...params,
        includeRelations: true // Sempre incluir relações
      }
    })
    return response.data.dados
  }

  static async getLotesByEvent(eventoId: number): Promise<Lote[]> {
    const response = await apiClient.get<ApiResponse<Lote[]>>(`/lotes/evento/${eventoId}`)
    return response.data.dados
  }

  static async createLote(data: CreateLoteRequest): Promise<Lote> {
    const response = await apiClient.post<ApiResponse<Lote>>('/admin/lotes', data)
    return response.data.dados
  }

  static async updateLote(id: number, data: Partial<CreateLoteRequest>): Promise<Lote> {
    const response = await apiClient.put<ApiResponse<Lote>>(`/admin/lotes/${id}`, data)
    return response.data.dados
  }

  static async deleteLote(id: number): Promise<void> {
    await apiClient.delete(`/admin/lotes/${id}`)
  }

  // Reservas (ADMIN)
  static async getReservas(params?: {
    page?: number
    size?: number
    eventoId?: number
    status?: string
  }): Promise<PageableResponse<Reserva> | Reserva[]> {
    const response = await apiClient.get<ApiResponse<PageableResponse<Reserva>> | ApiResponse<Reserva[]>>('/admin/reservas', { params })
    return response.data.dados
  }

  static async createReserva(data: CreateReservaRequest): Promise<Reserva> {
    const response = await apiClient.post<ApiResponse<Reserva>>('/admin/reservas', data)
    return response.data.dados
  }

  static async cancelReserva(id: number): Promise<Reserva> {
    const response = await apiClient.put<ApiResponse<Reserva>>(`/admin/reservas/${id}/cancelar`)
    return response.data.dados
  }

  static async convertReserva(id: number): Promise<Pedido> {
    const response = await apiClient.post<ApiResponse<Pedido>>(`/admin/reservas/${id}/converter`)
    return response.data.dados
  }

  // Vendas/Checkout
  static async processCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>('/vendas/checkout', data)
    return response.data.dados
  }

  static async getMyOrders(params?: {
    page?: number
    size?: number
  }): Promise<PageableResponse<Pedido> | Pedido[]> {
    const response = await apiClient.get<ApiResponse<PageableResponse<Pedido>> | ApiResponse<Pedido[]>>('/vendas/meus-pedidos', { params })
    return response.data.dados
  }

  static async cancelOrder(pedidoId: number): Promise<void> {
    await apiClient.post(`/vendas/cancelar/${pedidoId}`)
  }

  // Pedidos
  static async getOrder(id: number): Promise<Pedido> {
    const response = await apiClient.get<ApiResponse<Pedido>>(`/pedidos/${id}`)
    return response.data.dados
  }

  static async getAllOrders(params?: {
    page?: number
    size?: number
    status?: string
    eventoId?: number
  }): Promise<PageableResponse<Pedido> | Pedido[]> {
    const response = await apiClient.get<ApiResponse<PageableResponse<Pedido>> | ApiResponse<Pedido[]>>('/admin/pedidos', { params })
    return response.data.dados
  }

  // Dashboard/Estatísticas
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
    return response.data.dados
  }
}

export default apiClient