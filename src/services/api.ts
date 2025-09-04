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
  TicketCount
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
    return response
  },
  (error: AxiosError<ApiResponse>) => {
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      showError('Sessão expirada. Faça login novamente.')
      router.push('/login')
    } else if (error.response?.status === 403) {
      showError('Você não tem permissão para esta ação.')
    } else if (error.response?.status === 404) {
      showError('Recurso não encontrado.')
    } else if (error.response?.status === 409) {
      showError(error.response.data?.mensagem || 'Conflito de dados.')
    } else if (error.response?.status === 422) {
      showError(error.response.data?.mensagem || 'Dados inválidos.')
    } else if (error.response && error.response.status >= 500) {
      showError('Erro interno do servidor. Tente novamente.')
    } else {
      showError(error.response?.data?.mensagem || 'Erro na requisição.')
    }
    
    return Promise.reject(error)
  }
)

// API Client class
export class ApiService {
  // Autenticação
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    console.log('Raw API Response:', response.data)
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
  }): Promise<PageableResponse<Event>> {
    const response = await apiClient.get<ApiResponse<PageableResponse<Event>>>('/eventos', { params })
    return response.data.dados
  }

  static async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get<ApiResponse<Event>>(`/eventos/${id}`)
    return response.data.dados
  }

  static async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<ApiResponse<Event>>('/admin/eventos', eventData)
    return response.data.dados
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
}

export default apiClient