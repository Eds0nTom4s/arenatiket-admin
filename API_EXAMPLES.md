# ArenaTicket - Exemplos Práticos de Uso das APIs

## 🚀 Guia de Início Rápido

Este documento contém exemplos práticos de como usar as APIs do ArenaTicket em diferentes cenários.

---

## 📱 Cenário 1: Aplicação Mobile - Fluxo Completo de Compra

### 1. Login do Usuário
```javascript
// POST /api/auth/login
const login = async (email, senha) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  
  const data = await response.json();
  if (data.sucesso) {
    localStorage.setItem('token', data.dados.token);
    localStorage.setItem('user', JSON.stringify(data.dados.usuario));
  }
  return data;
};

// Exemplo de uso
const resultado = await login('cliente@email.com', 'senha123');
```

### 2. Listar Eventos Disponíveis
```javascript
// GET /api/eventos
const listarEventos = async (page = 0, size = 10) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8080/api/eventos?page=${page}&size=${size}&status=ATIVO`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};

// Exemplo de resposta
{
  "sucesso": true,
  "dados": {
    "content": [
      {
        "id": 1,
        "nome": "Benfica vs Porto",
        "dataEvento": "2024-02-15T20:00:00Z",
        "local": "Estádio da Luz",
        "precoMinimo": 25.00,
        "precoMaximo": 150.00,
        "bilhetesDisponiveis": 20000
      }
    ]
  }
}
```

### 3. Buscar Detalhes do Evento
```javascript
// GET /api/eventos/{id}
const buscarEvento = async (eventoId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8080/api/eventos/${eventoId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

---

## 🏢 Cenário 2: Sistema Administrativo - Gestão de Eventos

### 1. Criar Novo Evento (ADMIN)
```javascript
// POST /api/admin/eventos
const criarEvento = async (dadosEvento) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8080/api/admin/eventos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosEvento)
  });
  
  return await response.json();
};

// Exemplo de payload
const novoEvento = {
  "nome": "Concerto de Ano Novo",
  "descricao": "Concerto especial de celebração",
  "dataEvento": "2024-12-31T22:00:00Z",
  "local": "Centro Cultural",
  "categoria": "MUSICA",
  "capacidadeTotal": 5000,
  "imagemUrl": "https://example.com/concerto.jpg"
};

const resultado = await criarEvento(novoEvento);
```

### 2. Gerenciar Categorias de Bilhetes
```javascript
// POST /api/admin/eventos/{eventoId}/categorias
const criarCategoriaBilhete = async (eventoId, categoria) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8080/api/admin/eventos/${eventoId}/categorias`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(categoria)
  });
  
  return await response.json();
};

// Exemplo - criando diferentes categorias
const categorias = [
  {
    "nome": "VIP",
    "descricao": "Área VIP com serviço premium",
    "preco": 150.00,
    "quantidade": 100,
    "caracteristicas": ["Bar incluído", "Estacionamento", "Acesso prioritário"]
  },
  {
    "nome": "Pista",
    "descricao": "Área da pista - próximo ao palco",
    "preco": 80.00,
    "quantidade": 2000
  },
  {
    "nome": "Arquibancada",
    "descricao": "Lugares numerados na arquibancada",
    "preco": 45.00,
    "quantidade": 2900
  }
];

for (const categoria of categorias) {
  await criarCategoriaBilhete(1, categoria);
}
```

---

## 🔐 Cenário 3: Sistema de Portaria - Validação de Bilhetes

### 1. App do Porteiro - Validar por QR Code
```javascript
// POST /api/porteiro/bilhetes/validar
const validarBilhete = async (codigoQR) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8080/api/porteiro/bilhetes/validar?codigoQR=${codigoQR}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const resultado = await response.json();
  
  // Tratar diferentes cenários
  if (resultado.sucesso && resultado.dados.valido) {
    // Bilhete válido - liberar entrada
    mostrarSucesso(`Entrada liberada para ${resultado.dados.nomeComprador}`);
  } else {
    // Bilhete inválido - negar entrada
    mostrarErro(resultado.dados.motivo || resultado.mensagem);
  }
  
  return resultado;
};

// Simulação de leitura de QR Code
const lerQRCode = () => {
  // Integração com câmera/leitor QR
  const codigoQR = "QR_123456789"; // Código lido
  return validarBilhete(codigoQR);
};
```

### 2. Interface de Validação
```html
<!-- Exemplo de interface para porteiro -->
<div class="validacao-bilhete">
  <div class="qr-scanner">
    <video id="camera"></video>
    <div class="overlay">
      <div class="scan-area"></div>
    </div>
  </div>
  
  <div class="resultado" id="resultado">
    <!-- Resultado da validação aparece aqui -->
  </div>
  
  <button onclick="lerQRCode()" class="btn-validar">
    Validar Bilhete
  </button>
</div>
```

---

## 📊 Cenário 4: Dashboard Administrativo - Relatórios

### 1. Relatório de Vendas
```javascript
// GET /api/admin/relatorios/vendas
const gerarRelatorioVendas = async (dataInicio, dataFim, eventoId = null) => {
  const token = localStorage.getItem('token');
  let url = `http://localhost:8080/api/admin/relatorios/vendas?dataInicio=${dataInicio}&dataFim=${dataFim}`;
  
  if (eventoId) {
    url += `&eventoId=${eventoId}`;
  }
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};

// Exemplo de uso para dashboard
const carregarDashboard = async () => {
  const hoje = new Date().toISOString().split('T')[0];
  const mesPassado = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
  
  const relatorio = await gerarRelatorioVendas(mesPassado, hoje);
  
  if (relatorio.sucesso) {
    const dados = relatorio.dados;
    
    // Atualizar elementos do dashboard
    document.getElementById('total-vendas').textContent = 
      `€${dados.resumo.valorTotalVendas.toLocaleString()}`;
    
    document.getElementById('bilhetes-vendidos').textContent = 
      dados.resumo.totalBilhetesVendidos.toLocaleString();
    
    document.getElementById('ticket-medio').textContent = 
      `€${dados.resumo.ticketMedio.toFixed(2)}`;
    
    // Gerar gráfico de vendas por evento
    gerarGrafico(dados.vendasPorEvento);
  }
};
```

### 2. Estatísticas em Tempo Real
```javascript
// WebSocket para atualizações em tempo real (futuro)
// GET /api/admin/bilhetes/contagem/{status}
const atualizarEstatisticas = async () => {
  const token = localStorage.getItem('token');
  
  const promises = [
    fetch('http://localhost:8080/api/admin/bilhetes/contagem/DISPONIVEL', {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch('http://localhost:8080/api/admin/bilhetes/contagem/VENDIDO', {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch('http://localhost:8080/api/admin/bilhetes/contagem/USADO', {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch('http://localhost:8080/api/admin/bilhetes/contagem/CANCELADO', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  ];
  
  const responses = await Promise.all(promises);
  const dados = await Promise.all(responses.map(r => r.json()));
  
  return {
    disponiveis: dados[0].dados,
    vendidos: dados[1].dados,
    usados: dados[2].dados,
    cancelados: dados[3].dados
  };
};

// Atualizar a cada 30 segundos
setInterval(async () => {
  const stats = await atualizarEstatisticas();
  atualizarContadores(stats);
}, 30000);
```

---

## 🔄 Cenário 5: Integração com Sistema Externo

### 1. Webhook para Notificações
```javascript
// Sistema externo pode receber notificações via webhook
// Configuração no lado do ArenaTicket (futuro)

// Endpoint que o sistema externo deve expor
app.post('/webhook/arenaticket', (req, res) => {
  const evento = req.body;
  
  switch (evento.tipo) {
    case 'BILHETE_VENDIDO':
      processarVenda(evento.dados);
      break;
    case 'BILHETE_VALIDADO':
      registrarEntrada(evento.dados);
      break;
    case 'EVENTO_CRIADO':
      sincronizarEvento(evento.dados);
      break;
  }
  
  res.status(200).json({ sucesso: true });
});
```

### 2. Sincronização de Dados
```javascript
// Sincronizar dados entre sistemas
const sincronizarEventos = async () => {
  const token = localStorage.getItem('token');
  
  // Buscar todos os eventos
  const response = await fetch('http://localhost:8080/api/eventos?size=1000', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const eventos = await response.json();
  
  if (eventos.sucesso) {
    // Enviar para sistema externo
    for (const evento of eventos.dados.content) {
      await enviarParaSistemaExterno(evento);
    }
  }
};
```

---

## 🔧 Utilitários e Helpers

### 1. Cliente HTTP Configurado
```javascript
class ArenaTicketAPI {
  constructor(baseURL = 'http://localhost:8080/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensagem || 'Erro na requisição');
    }
    
    return data;
  }
  
  // Métodos específicos
  async login(email, senha) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    
    if (data.sucesso) {
      this.token = data.dados.token;
      localStorage.setItem('token', this.token);
    }
    
    return data;
  }
  
  async listarEventos(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/eventos?${query}`);
  }
  
  async validarBilhete(codigoQR) {
    return this.request(`/porteiro/bilhetes/validar?codigoQR=${codigoQR}`, {
      method: 'POST'
    });
  }
}

// Uso
const api = new ArenaTicketAPI();

// Login
await api.login('usuario@email.com', 'senha');

// Listar eventos
const eventos = await api.listarEventos({ status: 'ATIVO', size: 5 });

// Validar bilhete
const validacao = await api.validarBilhete('QR_123456789');
```

### 2. Interceptadores de Erro
```javascript
// Tratamento global de erros
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.status === 401) {
    // Token expirado - redirecionar para login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
});

// Helper para retry automático
const withRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * i));
    }
  }
};
```

---

## 📱 Exemplos para Diferentes Plataformas

### React/JavaScript
```jsx
import { useState, useEffect } from 'react';

const EventosList = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const carregarEventos = async () => {
      try {
        const api = new ArenaTicketAPI();
        const response = await api.listarEventos();
        setEventos(response.dados.content);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarEventos();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      {eventos.map(evento => (
        <div key={evento.id} className="evento-card">
          <h3>{evento.nome}</h3>
          <p>{evento.local}</p>
          <p>€{evento.precoMinimo} - €{evento.precoMaximo}</p>
        </div>
      ))}
    </div>
  );
};
```

### PHP/Laravel
```php
<?php

class ArenaTicketService {
    private $baseUrl;
    private $token;
    
    public function __construct($baseUrl = 'http://localhost:8080/api') {
        $this->baseUrl = $baseUrl;
        $this->token = session('arena_ticket_token');
    }
    
    public function listarEventos($params = []) {
        $url = $this->baseUrl . '/eventos?' . http_build_query($params);
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json'
        ])->get($url);
        
        return $response->json();
    }
    
    public function validarBilhete($codigoQR) {
        $url = $this->baseUrl . '/porteiro/bilhetes/validar?codigoQR=' . $codigoQR;
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->post($url);
        
        return $response->json();
    }
}

// Controller
class EventoController extends Controller {
    public function index(ArenaTicketService $arenaTicket) {
        $eventos = $arenaTicket->listarEventos(['status' => 'ATIVO']);
        return view('eventos.index', compact('eventos'));
    }
}
```

---

*Este documento complementa o contrato principal de APIs e deve ser usado como referência para implementação.*