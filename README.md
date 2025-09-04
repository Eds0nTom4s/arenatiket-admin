# ArenaTicket - Admin Panel

Painel administrativo profissional para o sistema ArenaTicket, desenvolvido em Vue.js 3 com design responsivo e funcionalidades PWA.

## 🚀 Tecnologias

- **Vue 3** + **Composition API**
- **TypeScript** para tipagem
- **Vite** para bundling e desenvolvimento
- **Pinia** para gerenciamento de estado
- **Vue Router** para roteamento
- **Tailwind CSS** para estilização
- **Axios** para requisições HTTP
- **PWA** (Progressive Web App)

## 📋 Funcionalidades

### Autenticação
- ✅ Login seguro com JWT
- ✅ Controle de sessão e redirecionamentos
- ✅ Guards de rota baseados em permissões

### Dashboard
- ✅ Visão geral do sistema
- ✅ Estatísticas de bilhetes em tempo real
- ✅ Eventos recentes
- ✅ Ações rápidas

### Gestão de Usuários (ADMIN)
- ✅ Listagem paginada de usuários
- ✅ Criação de novos usuários
- ✅ Edição de usuários existentes
- ✅ Exclusão de usuários
- ✅ Filtros por perfil (ADMIN, VENDEDOR, PORTEIRO)

### Gestão de Eventos
- ✅ Listagem de eventos com filtros
- ✅ Criação de eventos (ADMIN)
- ✅ Edição de eventos (ADMIN)
- ✅ Visualização de detalhes

### Gestão de Bilhetes
- ✅ Consulta por ID ou código QR
- ✅ Validação de bilhetes (PORTEIRO/ADMIN)
- ✅ Interface intuitiva para validação

### Relatórios (ADMIN)
- 🔄 Em desenvolvimento

### Recursos Técnicos
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ PWA com manifest e service worker
- ✅ Interceptadores HTTP para JWT
- ✅ Tratamento de erros com toasts
- ✅ Componentes reutilizáveis
- ✅ Navegação sem scrollbars visíveis

## 🎯 Permissões por Perfil

| Funcionalidade | ADMIN | VENDEDOR | PORTEIRO |
|----------------|-------|----------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Usuários | ✅ | ❌ | ❌ |
| Eventos | ✅ | ✅ | ❌ |
| Bilhetes | ✅ | ✅ | ✅ |
| Validação | ✅ | ❌ | ✅ |
| Relatórios | ✅ | ❌ | ❌ |

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 🌐 Configuração da API

Configure a URL base da API no arquivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📱 PWA

A aplicação é configurada como PWA e inclui:
- Manifest para instalação
- Service Worker para cache
- Funciona offline (parcialmente)
- Instalável em dispositivos móveis

## 🔐 Credenciais de Teste

Para teste da aplicação, use as seguintes credenciais:

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@arenaticket.com | senha123 |
| Vendedor | vendedor@arenaticket.com | senha123 |
| Porteiro | porteiro@arenaticket.com | senha123 |

## 🎨 Design System

### Cores Principais
- **Primary**: Blue (500-700)
- **Success**: Green (500-700)
- **Warning**: Yellow (500-700)
- **Danger**: Red (500-700)
- **Gray Scale**: Gray (50-900)

### Componentes Base
- `BaseButton` - Botões com variantes
- `BaseInput` - Inputs com validação
- `BaseModal` - Modais reutilizáveis
- `BaseTable` - Tabelas com paginação
- `ToastContainer` - Notificações

## 🔄 Estados de Loading

Todos os componentes incluem estados de carregamento apropriados e tratamento de erros para uma melhor experiência do usuário.

## 📚 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── base/           # Componentes base (Button, Input, etc.)
│   └── layout/         # Layout da aplicação
├── views/              # Páginas da aplicação
│   ├── auth/           # Autenticação
│   ├── dashboard/      # Dashboard
│   ├── users/          # Gestão de usuários
│   ├── events/         # Gestão de eventos
│   ├── tickets/        # Gestão de bilhetes
│   └── reports/        # Relatórios
├── stores/             # Estados Pinia
├── services/           # Serviços (API client)
├── router/             # Configuração de rotas
├── types/              # Tipos TypeScript
└── assets/             # Assets estáticos
```

## 🚦 API Integration

A aplicação está totalmente integrada com os endpoints da API ArenaTicket:

### Autenticação
- `POST /auth/login` - Login de usuário

### Usuários (ADMIN)
- `GET /admin/usuarios` - Listar usuários
- `POST /admin/usuarios` - Criar usuário
- `PUT /admin/usuarios/{id}` - Atualizar usuário
- `DELETE /admin/usuarios/{id}` - Excluir usuário

### Eventos
- `GET /eventos` - Listar eventos
- `GET /eventos/{id}` - Buscar evento
- `POST /admin/eventos` - Criar evento
- `PUT /admin/eventos/{id}` - Atualizar evento

### Bilhetes
- `GET /bilhetes/{id}` - Buscar bilhete
- `GET /bilhetes/qr/{codigoQR}` - Buscar por QR
- `POST /porteiro/bilhetes/validar` - Validar bilhete

### Relatórios
- `GET /admin/relatorios/vendas` - Relatório de vendas
- `GET /admin/bilhetes/contagem/{status}` - Contagem por status

## 🛡️ Segurança

- JWT tokens armazenados em localStorage
- Interceptadores para renovação automática
- Guards de rota baseados em permissões
- Validação de formulários
- Sanitização de inputs

## 📱 Responsividade

- **Mobile First**: Design otimizado para mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Sidebar**: Colapsível em dispositivos móveis
- **Tabelas**: Scroll horizontal em telas pequenas

## 🔧 Extensibilidade

O projeto foi estruturado para fácil extensão:
- Componentes base reutilizáveis
- Stores modulares
- Tipos TypeScript bem definidos
- Padrões consistentes

## 📄 Licença

Este projeto é parte do sistema ArenaTicket.