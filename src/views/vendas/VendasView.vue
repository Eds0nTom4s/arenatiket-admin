<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Vendas / Checkout</h1>
      <p class="text-gray-600 mt-1">Processamento de vendas de bilhetes</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Seleção de Evento e Lotes -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Seleção de Evento -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Selecionar Evento</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Evento</label>
              <select
                v-model="selectedEventoId"
                @change="loadLotesForEvent"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um evento</option>
                <option v-for="evento in eventos" :key="evento.id" :value="evento.id">
                  {{ evento.nome }} - {{ formatDate(evento.dataEvento) }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Lote</label>
              <BaseInput
                v-model="searchLote"
                placeholder="Nome do lote..."
                icon="fas fa-search"
              />
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
                  >
                    <i class="fas fa-minus mr-1"></i>
                    -
                  </BaseButton>
                  <span v-if="isLoteSelected(lote.id)" class="font-medium">
                    {{ getLoteQuantity(lote.id) }}
                  </span>
                  <BaseButton
                    @click="addLoteToCart(lote)"
                    :disabled="lote.quantidadeDisponivel === 0 || getLoteQuantity(lote.id) >= lote.quantidadeDisponivel"
                    variant="primary"
                    size="sm"
                  >
                    <i class="fas fa-plus mr-1"></i>
                    +
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carrinho e Checkout -->
      <div class="space-y-6">
        <!-- Carrinho de Compras -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Carrinho de Compras</h2>
          <div v-if="cart.length === 0" class="text-center py-8">
            <i class="fas fa-shopping-cart text-4xl text-gray-300"></i>
            <p class="text-gray-500 mt-2">Carrinho vazio</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="item in cart"
              :key="item.loteId"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ item.nome }}</h4>
                <p class="text-sm text-gray-500">{{ formatCurrency(item.preco) }} cada</p>
              </div>
              <div class="flex items-center space-x-2">
                <BaseButton
                  @click="removeLoteFromCart(item.loteId)"
                  variant="outline"
                  size="sm"
                >
                  <i class="fas fa-minus"></i>
                </BaseButton>
                <span class="w-8 text-center font-medium">{{ item.quantidade }}</span>
                <BaseButton
                  @click="addLoteToCartById(item.loteId)"
                  :disabled="item.quantidade >= item.maxQuantidade"
                  variant="outline"
                  size="sm"
                >
                  <i class="fas fa-plus"></i>
                </BaseButton>
              </div>
            </div>
            
            <!-- Total -->
            <div class="border-t pt-3">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900">Total:</span>
                <span class="text-xl font-bold text-blue-600">{{ formatCurrency(totalCart) }}</span>
              </div>
              <div class="text-sm text-gray-500">
                {{ totalQuantity }} bilhete(s)
              </div>
            </div>

            <BaseButton
              @click="clearCart"
              variant="outline"
              size="sm"
              class="w-full"
            >
              <i class="fas fa-trash mr-2"></i>
              Limpar Carrinho
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
            >
              <i class="fas fa-credit-card mr-2"></i>
              Processar Pagamento - {{ formatCurrency(totalCart) }}
            </BaseButton>
          </form>
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
          <BaseButton @click="printReceipt" variant="outline">
            <i class="fas fa-print mr-2"></i>
            Imprimir Recibo
          </BaseButton>
          <BaseButton @click="closeResultModal" variant="primary">
            <i class="fas fa-check mr-2"></i>
            Concluir
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
        <BaseButton @click="closeResultModal" variant="primary">
          Tentar Novamente
        </BaseButton>
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

// Methods
const loadEventos = async () => {
  try {
    const response = await eventsStore.fetchEvents()
    if (Array.isArray(response)) {
      eventos.value = response.filter(evento => evento.status === 'ATIVO')
    } else {
      eventos.value = response.content.filter(evento => evento.status === 'ATIVO')
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
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
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
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