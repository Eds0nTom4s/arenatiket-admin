<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-4">
      <!-- Header com Estatísticas -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Sistema de Vendas</h1>
            <p class="text-sm text-gray-600 mt-1">Processamento de vendas de bilhetes em tempo real</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-white rounded-lg shadow-sm px-4 py-2 border">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Vendas Hoje</div>
              <div class="text-lg font-bold text-green-600">{{ formatCurrency(salesStats.today) }}</div>
            </div>
            <div class="bg-white rounded-lg shadow-sm px-4 py-2 border">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Total Sessão</div>
              <div class="text-lg font-bold text-blue-600">{{ formatCurrency(salesStats.session) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Seleção de Evento e Lotes -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Seleção de Evento -->
          <div class="bg-white rounded-lg shadow-sm p-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Selecionar Evento</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Evento</label>
                <select
                  v-model="selectedEventoId"
                  @change="loadLotesForEvent"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Selecione um evento</option>
                  <option v-for="evento in eventos" :key="evento.id" :value="evento.id">
                    {{ evento.nome }} - {{ formatDate(evento.dataHora) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Lote</label>
                <BaseInput
                  v-model="searchLote"
                  placeholder="Nome do lote..."
                  icon="fas fa-search"
                  size="sm"
                />
              </div>
              <div v-if="selectedEventoId">
                <label class="block text-sm font-medium text-gray-700 mb-2">Lotes Encontrados</label>
                <div class="text-sm bg-gray-50 px-3 py-2 rounded-md border">
                  <span class="font-medium text-blue-600">{{ filteredLotes.length }}</span>
                  <span class="text-gray-600"> lotes disponíveis</span>
                </div>
              </div>
            </div>
          </div>

        <!-- Lista de Lotes Disponíveis -->
        <div v-if="selectedEventoId" class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Lotes Disponíveis</h2>
          <div v-if="lotesLoading" class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
            <p class="text-gray-500 mt-2">Carregando lotes...</p>
          </div>
          <div v-else-if="filteredLotes.length === 0" class="text-center py-8">
            <i class="fas fa-ticket-alt text-4xl text-gray-300"></i>
            <p class="text-gray-500 mt-2">Nenhum lote disponível para este evento</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="lote in filteredLotes"
              :key="lote.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
              :class="{ 'border-blue-500 bg-blue-50': isLoteSelected(lote.id) }"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-gray-900">{{ lote.nome }}</h3>
                <span class="text-lg font-bold text-blue-600">{{ formatCurrency(lote.preco) }}</span>
              </div>
              <p v-if="lote.descricao" class="text-sm text-gray-600 mb-2">{{ lote.descricao }}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Disponível: {{ lote.quantidadeDisponivel }}</span>
                <div class="flex items-center space-x-2">
                  <BaseButton
                    @click="removeLoteFromCart(lote.id)"
                    v-if="isLoteSelected(lote.id)"
                    variant="outline"
                    size="sm"
                    text="-"
                  >
                    <i class="fas fa-minus mr-1"></i>
                  </BaseButton>
                  <span v-if="isLoteSelected(lote.id)" class="font-medium">
                    {{ getLoteQuantity(lote.id) }}
                  </span>
                  <BaseButton
                    @click="addLoteToCart(lote)"
                    :disabled="lote.quantidadeDisponivel === 0 || getLoteQuantity(lote.id) >= lote.quantidadeDisponivel"
                    variant="primary"
                    size="sm"
                    text="+"
                  >
                    <i class="fas fa-plus mr-1"></i>
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Carrinho e Checkout -->
        <div class="space-y-4">
          <!-- Carrinho de Compras -->
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-semibold text-gray-900">Carrinho</h2>
              <div v-if="cart.length > 0" class="text-xs text-gray-500">
                {{ cart.length }} item(s)
              </div>
            </div>
            <div v-if="cart.length === 0" class="text-center py-6">
              <i class="fas fa-shopping-cart text-3xl text-gray-300"></i>
              <p class="text-sm text-gray-500 mt-2">Carrinho vazio</p>
              <p class="text-xs text-gray-400 mt-1">Selecione lotes para começar</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="item in cart"
                :key="item.loteId"
                class="flex items-center justify-between p-2 border border-gray-200 rounded-md text-sm"
              >
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">{{ item.nome }}</h4>
                  <div class="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{{ formatCurrency(item.preco) }} cada</span>
                    <span>•</span>
                    <span>{{ formatCurrency(item.preco * item.quantidade) }} total</span>
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <button
                    @click="removeLoteFromCart(item.loteId)"
                    class="h-6 w-6 inline-flex items-center justify-center text-xs text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="w-6 text-center font-medium text-xs">{{ item.quantidade }}</span>
                  <button
                    @click="addLoteToCartById(item.loteId)"
                    :disabled="item.quantidade >= item.maxQuantidade"
                    class="h-6 w-6 inline-flex items-center justify-center text-xs text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <!-- Total -->
              <div class="border-t pt-2 mt-3">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-semibold text-gray-900">Total:</span>
                  <span class="text-lg font-bold text-blue-600">{{ formatCurrency(totalCart) }}</span>
                </div>
                <div class="flex justify-between items-center text-xs text-gray-500">
                  <span>{{ totalQuantity }} bilhete(s)</span>
                  <span v-if="totalSavings > 0">Economia: {{ formatCurrency(totalSavings) }}</span>
                </div>
              </div>

              <BaseButton
                @click="clearCart"
                variant="outline"
                size="sm"
                text="Limpar"
                class="w-full mt-2"
              >
                <i class="fas fa-trash mr-1"></i>
              </BaseButton>
            </div>
          </div>

        <!-- Formulário de Checkout -->
        <div v-if="cart.length > 0" class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Dados do Comprador</h2>
          <form @submit.prevent="processCheckout" class="space-y-4">
            <BaseInput
              v-model="checkoutForm.nomeComprador"
              label="Nome Completo"
              placeholder="Nome do comprador"
              required
              :error="errors.nomeComprador"
            />
            
            <BaseInput
              v-model="checkoutForm.emailComprador"
              label="E-mail"
              type="email"
              placeholder="email@exemplo.com"
              required
              :error="errors.emailComprador"
            />
            
            <BaseInput
              v-model="checkoutForm.telefoneComprador"
              label="Telefone"
              placeholder="+351 912 345 678"
            />
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento</label>
              <select
                v-model="checkoutForm.metodoPagamento"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="TRANSFERENCIA">Transferência Bancária</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="MBWAY">MB WAY</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <textarea
                v-model="checkoutForm.observacoes"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Observações adicionais (opcional)"
              ></textarea>
            </div>
            
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              class="w-full"
              :loading="pedidosStore.loading"
              :text="`Processar Pagamento - ${formatCurrency(totalCart)}`"
            >
              <i class="fas fa-credit-card mr-2"></i>
            </BaseButton>
          </form>
        </div>
      </div>
    </div>
    </div>
  </div>

    <!-- Modal Resultado do Checkout -->
    <BaseModal
      :show="showResultModal"
      :title="checkoutSuccess ? 'Venda Realizada com Sucesso!' : 'Erro no Processamento'"
      size="lg"
      @close="closeResultModal"
    >
      <div v-if="checkoutSuccess && checkoutResult" class="space-y-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <i class="fas fa-check text-green-600 text-2xl"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Pagamento Processado
          </h3>
          <p class="text-sm text-gray-500">
            Pedido #{{ checkoutResult.pedidoId }} criado com sucesso
          </p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Pedido ID:</span>
              <p class="text-gray-900">{{ checkoutResult.pedidoId }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700">Valor Total:</span>
              <p class="text-gray-900 font-semibold">{{ formatCurrency(checkoutResult.valorTotal) }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700">Status:</span>
              <p class="text-gray-900">{{ checkoutResult.status }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700">Bilhetes:</span>
              <p class="text-gray-900">{{ checkoutResult.bilhetes?.length || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="checkoutResult.bilhetes && checkoutResult.bilhetes.length > 0">
          <h4 class="font-medium text-gray-900 mb-2">Bilhetes Gerados:</h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="bilhete in checkoutResult.bilhetes"
              :key="bilhete.id"
              class="p-3 border border-gray-200 rounded-lg text-sm"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium">Bilhete #{{ bilhete.id }}</span>
                <span class="text-gray-500">{{ bilhete.codigoQR }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center space-x-3">
          <BaseButton @click="printReceipt" variant="outline" text="Imprimir Recibo">
            <i class="fas fa-print mr-2"></i>
          </BaseButton>
          <BaseButton @click="closeResultModal" variant="primary" text="Concluir">
            <i class="fas fa-check mr-2"></i>
          </BaseButton>
        </div>
      </div>
      
      <div v-else class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <i class="fas fa-times text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Erro no Processamento
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          Não foi possível processar o pagamento. Tente novamente.
        </p>
        <BaseButton @click="closeResultModal" variant="primary" text="Tentar Novamente" />
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useLotesStore } from '@/stores/lotes'
import { usePedidosStore } from '@/stores/pedidos'
import type { Event, Lote, CheckoutRequest, CheckoutResponse, CheckoutItem } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const eventsStore = useEventsStore()
const lotesStore = useLotesStore()
const pedidosStore = usePedidosStore()

// Estado
const eventos = ref<Event[]>([])
const lotesDisponiveis = ref<Lote[]>([])
const selectedEventoId = ref('')
const searchLote = ref('')
const lotesLoading = ref(false)

// Estatísticas de vendas
const salesStats = reactive({
  today: 0,
  session: 0
})

// Vendas recentes
const recentSales = ref<any[]>([])

// Carrinho
interface CartItem {
  loteId: number
  nome: string
  preco: number
  quantidade: number
  maxQuantidade: number
}

const cart = ref<CartItem[]>([])

// Formulário de checkout
const checkoutForm = reactive<CheckoutRequest>({
  eventoId: 0,
  itens: [],
  nomeComprador: '',
  emailComprador: '',
  telefoneComprador: '',
  metodoPagamento: '',
  observacoes: ''
})

const errors = ref<Record<string, string>>({})

// Resultado do checkout
const showResultModal = ref(false)
const checkoutSuccess = ref(false)
const checkoutResult = ref<CheckoutResponse | null>(null)

// Computeds
const filteredLotes = computed(() => {
  let result = lotesDisponiveis.value
  
  if (searchLote.value) {
    const search = searchLote.value.toLowerCase()
    result = result.filter(lote => 
      lote.nome.toLowerCase().includes(search) ||
      lote.descricao?.toLowerCase().includes(search)
    )
  }
  
  return result.filter(lote => lote.ativo && lote.quantidadeDisponivel > 0)
})

const totalCart = computed(() => {
  return cart.value.reduce((total, item) => total + (item.preco * item.quantidade), 0)
})

const totalQuantity = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantidade, 0)
})

const totalSavings = computed(() => {
  // Simular economia baseada na quantidade
  const baseDiscount = totalQuantity.value > 5 ? totalCart.value * 0.05 : 0
  return baseDiscount
})

// Methods
const loadEventos = async () => {
  try {
    console.log('🔄 Carregando eventos...')
    const response = await eventsStore.fetchEvents()
    console.log('📦 Resposta da API:', response)
    console.log('📦 Tipo da resposta:', typeof response)
    console.log('📦 É array?', Array.isArray(response))
    
    if (Array.isArray(response)) {
      console.log('✅ Resposta é array, total de eventos:', response.length)
      console.log('🔍 Primeiro evento (estrutura):', response[0])
      
      const eventosAtivos = response.filter(evento => {
        console.log(`🎯 Evento ${evento.nome}: ativo = ${evento.ativo}`)
        return evento.ativo === true
      })
      
      eventos.value = eventosAtivos
      console.log('✅ Eventos ativos filtrados:', eventosAtivos.length)
    } else if (response && response.content && Array.isArray(response.content)) {
      console.log('✅ Resposta tem propriedade content, filtrando eventos ativos...')
      eventos.value = response.content.filter(evento => evento.ativo === true)
    } else {
      console.warn('⚠️ Estrutura de resposta inesperada:', response)
      eventos.value = []
    }
    
    console.log('📋 Eventos carregados na variável:', eventos.value.length)
    console.log('🎯 Eventos na variável:', eventos.value)
    console.log('🔄 Forçando reatividade...')
    
    // Forçar reatividade
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('✅ Eventos após timeout:', eventos.value.length)
    
  } catch (error) {
    console.error('❌ Erro ao carregar eventos:', error)
    eventos.value = []
  }
}

const loadLotesForEvent = async () => {
  if (!selectedEventoId.value) {
    lotesDisponiveis.value = []
    cart.value = []
    return
  }
  
  try {
    lotesLoading.value = true
    lotesDisponiveis.value = await lotesStore.fetchLotesByEvent(parseInt(selectedEventoId.value))
    cart.value = [] // Limpar carrinho ao trocar de evento
    checkoutForm.eventoId = parseInt(selectedEventoId.value)
  } catch (error) {
    console.error('Erro ao carregar lotes:', error)
  } finally {
    lotesLoading.value = false
  }
}

const isLoteSelected = (loteId: number) => {
  return cart.value.some(item => item.loteId === loteId)
}

const getLoteQuantity = (loteId: number) => {
  const item = cart.value.find(item => item.loteId === loteId)
  return item ? item.quantidade : 0
}

const addLoteToCart = (lote: Lote) => {
  const existingItem = cart.value.find(item => item.loteId === lote.id)
  
  if (existingItem) {
    if (existingItem.quantidade < lote.quantidadeDisponivel) {
      existingItem.quantidade++
    }
  } else {
    cart.value.push({
      loteId: lote.id,
      nome: lote.nome,
      preco: lote.preco,
      quantidade: 1,
      maxQuantidade: lote.quantidadeDisponivel
    })
  }
}

const addLoteToCartById = (loteId: number) => {
  const lote = lotesDisponiveis.value.find(l => l.id === loteId)
  if (lote) {
    addLoteToCart(lote)
  }
}

const removeLoteFromCart = (loteId: number) => {
  const itemIndex = cart.value.findIndex(item => item.loteId === loteId)
  
  if (itemIndex !== -1) {
    if (cart.value[itemIndex].quantidade > 1) {
      cart.value[itemIndex].quantidade--
    } else {
      cart.value.splice(itemIndex, 1)
    }
  }
}

const clearCart = () => {
  cart.value = []
}

const validateCheckoutForm = (): boolean => {
  errors.value = {}
  
  if (!checkoutForm.nomeComprador.trim()) {
    errors.value.nomeComprador = 'Nome é obrigatório'
  }
  
  if (!checkoutForm.emailComprador.trim()) {
    errors.value.emailComprador = 'E-mail é obrigatório'
  }
  
  if (!checkoutForm.metodoPagamento) {
    errors.value.metodoPagamento = 'Método de pagamento é obrigatório'
  }
  
  return Object.keys(errors.value).length === 0
}

const processCheckout = async () => {
  if (!validateCheckoutForm()) return
  
  // Preparar itens do checkout
  const itens: CheckoutItem[] = cart.value.map(item => ({
    loteId: item.loteId,
    quantidade: item.quantidade
  }))
  
  const checkoutData: CheckoutRequest = {
    ...checkoutForm,
    itens
  }
  
  try {
    checkoutResult.value = await pedidosStore.processCheckout(checkoutData)
    checkoutSuccess.value = true
    showResultModal.value = true
    
    // Atualizar estatísticas
    salesStats.session += totalCart.value
    salesStats.today += totalCart.value
    
    // Adicionar à lista de vendas recentes
    recentSales.value.unshift({
      id: checkoutResult.value.pedidoId,
      valor: totalCart.value,
      bilhetes: totalQuantity.value,
      tempo: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    })
    
    // Limpar formulário e carrinho
    clearCart()
    resetCheckoutForm()
    
    // Recarregar lotes para atualizar disponibilidade
    await loadLotesForEvent()
    
  } catch (error) {
    console.error('Erro no checkout:', error)
    checkoutSuccess.value = false
    showResultModal.value = true
  }
}

const resetCheckoutForm = () => {
  checkoutForm.nomeComprador = ''
  checkoutForm.emailComprador = ''
  checkoutForm.telefoneComprador = ''
  checkoutForm.metodoPagamento = ''
  checkoutForm.observacoes = ''
  errors.value = {}
}

const closeResultModal = () => {
  showResultModal.value = false
  checkoutResult.value = null
}

const printReceipt = () => {
  window.print()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value).replace('AOA', 'Kz')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Mounted
onMounted(async () => {
  await loadEventos()
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none;
  }
}
</style>