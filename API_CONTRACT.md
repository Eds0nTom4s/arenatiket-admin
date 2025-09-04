# ArenaTicket - Contrato de APIs

## Visão Geral

Este documento define o contrato das APIs do sistema ArenaTicket, incluindo endpoints, payloads de requisição e resposta, códigos de status e exemplos práticos.

**Base URL:** `http://localhost:8080/api`
**Documentação Interativa:** `http://localhost:8080/swagger-ui.html`

---

## 🔐 Autenticação

### Cabeçalhos Obrigatórios
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Estrutura Padrão de Resposta
```json
{
  "sucesso": true,
  "mensagem": "Operação realizada com sucesso",
  "dados": { /* objeto ou array de dados */ },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 📋 Índice de Endpoints

### 🔑 Autenticação
- [POST /auth/login](#post-authlogin) - Login de usuário
- [POST /auth/register](#post-authregister) - Registro de usuário
- [POST /auth/refresh](#post-authrefresh) - Renovar token

### 👥 Usuários (ADMIN)
- [GET /admin/usuarios](#get-adminusuarios) - Listar usuários
- [POST /admin/usuarios](#post-adminusuarios) - Criar usuário
- [PUT /admin/usuarios/{id}](#put-adminusuariosid) - Atualizar usuário
- [DELETE /admin/usuarios/{id}](#delete-adminusuariosid) - Excluir usuário

### 🎭 Eventos
- [GET /eventos](#get-eventos) - Listar eventos
- [GET /eventos/{id}](#get-eventosid) - Buscar evento
- [POST /admin/eventos](#post-admineventos) - Criar evento (ADMIN)
- [PUT /admin/eventos/{id}](#put-admineventosid) - Atualizar evento (ADMIN)

### 🎫 Bilhetes
- [GET /bilhetes/{id}](#get-bilhetesid) - Buscar bilhete
- [GET /bilhetes/qr/{codigoQR}](#get-bilhetesqrcodigoqr) - Buscar por QR
- [POST /porteiro/bilhetes/validar](#post-porteirobilhetesvalidar) - Validar bilhete (PORTEIRO)

### 📊 Relatórios (ADMIN)
- [GET /admin/relatorios/vendas](#get-adminrelatoriosvendas) - Relatório de vendas
- [GET /admin/bilhetes/contagem/{status}](#get-adminbilhetescontagemstatus) - Contagem por status

---

## 🔑 Autenticação

### POST /auth/login
Autentica um usuário no sistema.

**Permissões:** Público

**Request:**
```json
{
  "email": "admin@arenaticket.com",
  "senha": "senha123"
}
```

**Response Success (200):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "dados": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tipo": "Bearer",
    "usuario": {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@arenaticket.com",
      "role": "ADMIN"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response Error (401):**
```json
{
  "sucesso": false,
  "mensagem": "Credenciais inválidas",
  "dados": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /auth/register
Registra um novo usuário no sistema.

**Permissões:** Público

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "role": "VENDEDOR"
}
```

**Response Success (201):**
```json
{
  "sucesso": true,
  "mensagem": "Usuário registrado com sucesso",
  "dados": {
    "id": 2,
    "nome": "João Silva",
    "email": "joao@email.com",
    "role": "VENDEDOR",
    "ativo": true
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 👥 Gestão de Usuários

### GET /admin/usuarios
Lista todos os usuários do sistema.

**Permissões:** ADMIN

**Query Parameters:**
- `page` (opcional): Número da página (default: 0)
- `size` (opcional): Tamanho da página (default: 20)
- `role` (opcional): Filtrar por role (ADMIN, VENDEDOR, PORTEIRO)

**Request:**
```http
GET /api/admin/usuarios?page=0&size=10&role=VENDEDOR
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "sucesso": true,
  "mensagem": "Usuários listados com sucesso",
  "dados": {
    "content": [
      {
        "id": 1,
        "nome": "João Vendedor",
        "email": "joao@email.com",
        "role": "VENDEDOR",
        "ativo": true,
        "dataCriacao": "2024-01-01T10:00:00Z"
      },
      {
        "id": 2,
        "nome": "Maria Vendedora",
        "email": "maria@email.com",
        "role": "VENDEDOR",
        "ativo": true,
        "dataCriacao": "2024-01-02T11:00:00Z"
      }
    ],
    "pageable": {
      "page": 0,
      "size": 10,
      "totalElements": 2,
      "totalPages": 1
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /admin/usuarios
Cria um novo usuário.

**Permissões:** ADMIN

**Request:**
```json
{
  "nome": "Carlos Porteiro",
  "email": "carlos@email.com",
  "senha": "senha123",
  "role": "PORTEIRO"
}
```

**Response Success (201):**
```json
{
  "sucesso": true,
  "mensagem": "Usuário criado com sucesso",
  "dados": {
    "id": 3,
    "nome": "Carlos Porteiro",
    "email": "carlos@email.com",
    "role": "PORTEIRO",
    "ativo": true,
    "dataCriacao": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🎭 Gestão de Eventos

### GET /eventos
Lista eventos disponíveis.

**Permissões:** Autenticado

**Query Parameters:**
- `page` (opcional): Número da página
- `size` (opcional): Tamanho da página
- `categoria` (opcional): Filtrar por categoria
- `status` (opcional): Filtrar por status (ATIVO, INATIVO, ESGOTADO)

**Request:**
```http
GET /api/eventos?page=0&size=5&status=ATIVO
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "sucesso": true,
  "mensagem": "Eventos listados com sucesso",
  "dados": {
    "content": [
      {
        "id": 1,
        "nome": "Jogo Benfica vs Porto",
        "descricao": "Clássico do futebol português",
        "dataEvento": "2024-02-15T20:00:00Z",
        "local": "Estádio da Luz",
        "categoria": "FUTEBOL",
        "status": "ATIVO",
        "capacidadeTotal": 65000,
        "bilhetesVendidos": 45000,
        "precoMinimo": 25.00,
        "precoMaximo": 150.00,
        "imagemUrl": "https://example.com/evento1.jpg"
      }
    ],
    "pageable": {
      "page": 0,
      "size": 5,
      "totalElements": 1,
      "totalPages": 1
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /admin/eventos
Cria um novo evento.

**Permissões:** ADMIN

**Request:**
```json
{
  "nome": "Final da Taça",
  "descricao": "Final da Taça de Portugal",
  "dataEvento": "2024-05-26T19:30:00Z",
  "local": "Estádio Nacional",
  "categoria": "FUTEBOL",
  "capacidadeTotal": 50000,
  "imagemUrl": "https://example.com/final-taca.jpg"
}
```

**Response Success (201):**
```json
{
  "sucesso": true,
  "mensagem": "Evento criado com sucesso",
  "dados": {
    "id": 2,
    "nome": "Final da Taça",
    "descricao": "Final da Taça de Portugal",
    "dataEvento": "2024-05-26T19:30:00Z",
    "local": "Estádio Nacional",
    "categoria": "FUTEBOL",
    "status": "ATIVO",
    "capacidadeTotal": 50000,
    "bilhetesVendidos": 0,
    "imagemUrl": "https://example.com/final-taca.jpg",
    "dataCriacao": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🎫 Gestão de Bilhetes

### GET /bilhetes/{id}
Busca um bilhete específico pelo ID.

**Permissões:** Autenticado

**Request:**
```http
GET /api/bilhetes/123
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "sucesso": true,
  "mensagem": "Bilhete encontrado",
  "dados": {
    "id": 123,
    "evento": {
      "id": 1,
      "nome": "Jogo Benfica vs Porto",
      "dataEvento": "2024-02-15T20:00:00Z",
      "local": "Estádio da Luz"
    },
    "categoriaBilhete": {
      "id": 1,
      "nome": "Bancada Central",
      "preco": 75.00,
      "setor": "A",
      "fila": 10,
      "assento": 15
    },
    "codigoQR": "QR_123456789",
    "status": "VENDIDO",
    "dataCompra": "2024-01-15T14:30:00Z",
    "dataValidacao": null,
    "nomeComprador": "João Silva",
    "emailComprador": "joao@email.com"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /porteiro/bilhetes/validar
Valida um bilhete através do código QR.

**Permissões:** PORTEIRO, ADMIN

**Request:**
```http
POST /api/porteiro/bilhetes/validar?codigoQR=QR_123456789
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "sucesso": true,
  "mensagem": "Validação realizada",
  "dados": {
    "bilheteId": 123,
    "valido": true,
    "status": "USADO",
    "evento": {
      "nome": "Jogo Benfica vs Porto",
      "dataEvento": "2024-02-15T20:00:00Z",
      "local": "Estádio da Luz"
    },
    "categoria": "Bancada Central - Setor A",
    "assento": "Fila 10, Assento 15",
    "nomeComprador": "João Silva",
    "dataValidacao": "2024-02-15T18:45:00Z",
    "validadoPor": "Carlos Porteiro"
  },
  "timestamp": "2024-02-15T18:45:00Z"
}
```

**Response - Bilhete Inválido (400):**
```json
{
  "sucesso": false,
  "mensagem": "Bilhete inválido ou já utilizado",
  "dados": {
    "bilheteId": 123,
    "valido": false,
    "motivo": "BILHETE_JA_USADO",
    "dataValidacaoAnterior": "2024-02-15T17:30:00Z"
  },
  "timestamp": "2024-02-15T18:45:00Z"
}
```

---

## 📊 Relatórios e Estatísticas

### GET /admin/relatorios/vendas
Gera relatório de vendas por período.

**Permissões:** ADMIN

**Query Parameters:**
- `dataInicio` (obrigatório): Data início (formato: YYYY-MM-DD)
- `dataFim` (obrigatório): Data fim (formato: YYYY-MM-DD)
- `eventoId` (opcional): Filtrar por evento específico

**Request:**
```http
GET /api/admin/relatorios/vendas?dataInicio=2024-01-01&dataFim=2024-01-31&eventoId=1
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "sucesso": true,
  "mensagem": "Relatório gerado com sucesso",
  "dados": {
    "periodo": {
      "dataInicio": "2024-01-01",
      "dataFim": "2024-01-31"
    },
    "resumo": {
      "totalBilhetesVendidos": 15000,
      "valorTotalVendas": 750000.00,
      "ticketMedio": 50.00,
      "eventosComVendas": 3
    },
    "vendasPorEvento": [
      {
        "eventoId": 1,
        "nomeEvento": "Jogo Benfica vs Porto",
        "bilhetesVendidos": 12000,
        "valorVendas": 600000.00,
        "percentualOcupacao": 85.5
      }
    ],
    "vendasPorDia": [
      {
        "data": "2024-01-15",
        "bilhetesVendidos": 500,
        "valorVendas": 25000.00
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🚨 Códigos de Status HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operação realizada com sucesso |
| 201 | Created | Recurso criado com sucesso |
| 204 | No Content | Operação realizada, sem conteúdo de resposta |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token inválido ou ausente |
| 403 | Forbidden | Usuário sem permissão para a operação |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito de dados (ex: email já existe) |
| 422 | Unprocessable Entity | Erro de validação de dados |
| 500 | Internal Server Error | Erro interno do servidor |

---

## 🔒 Níveis de Permissão

### ADMIN
- Acesso total ao sistema
- Gestão de usuários, eventos e relatórios
- Todas as operações CRUD

### VENDEDOR
- Consultar eventos e bilhetes
- Processar vendas
- Consultar relatórios próprios

### PORTEIRO
- Validar bilhetes
- Consultar informações de eventos
- Acesso somente leitura

---

## 📝 Validações de Dados

### Email
- Formato válido obrigatório
- Único no sistema

### Senha
- Mínimo 6 caracteres
- Não pode ser vazia

### Datas
- Formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- Eventos não podem ser criados no passado

### Preços
- Valores positivos
- Máximo 2 casas decimais

---

## 🔧 Configuração do Cliente

### Headers Padrão
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Interceptador de Resposta (JavaScript)
```javascript
// Tratamento automático de respostas
axios.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
```

---

## 📞 Suporte

Para dúvidas sobre este contrato de API:
- **Documentação Interativa:** http://localhost:8080/swagger-ui.html
- **Console H2 (Dev):** http://localhost:8080/h2-console
- **Logs da Aplicação:** Verificar console da aplicação Spring Boot

---

*Documento gerado automaticamente para ArenaTicket v1.0.0*
*Última atualização: Janeiro 2024*