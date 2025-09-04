# ArenaTicket Admin - Instruções de Execução

## Pré-requisitos
1. Node.js 18+ instalado
2. Backend ArenaTicket rodando em http://localhost:8080

## Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Verifique o arquivo `.env` e ajuste a URL da API se necessário:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Executar em modo desenvolvimento
```bash
npm run dev
```
O servidor será iniciado em http://localhost:3000

### 4. Build para produção
```bash
npm run build
```

### 5. Preview da build
```bash
npm run preview
```

## Credenciais para Teste

| Perfil    | Email                     | Senha    |
|-----------|---------------------------|----------|
| Admin     | admin@arenaticket.com     | senha123 |
| Vendedor  | vendedor@arenaticket.com  | senha123 |
| Porteiro  | porteiro@arenaticket.com  | senha123 |

## Funcionalidades Implementadas

✅ **Sistema de Autenticação**
- Login com JWT
- Controle de sessão
- Redirecionamentos automáticos

✅ **Dashboard Responsivo**
- Estatísticas em tempo real
- Visão geral do sistema
- Ações rápidas

✅ **Gestão de Usuários** (ADMIN)
- CRUD completo
- Paginação
- Filtros por perfil

✅ **Gestão de Eventos**
- Listagem com filtros
- Criação/edição (ADMIN)
- Visualização de detalhes

✅ **Gestão de Bilhetes**
- Consulta por ID/QR
- Validação (PORTEIRO/ADMIN)
- Interface intuitiva

✅ **PWA (Progressive Web App)**
- Instalável
- Service Worker
- Manifest configurado

✅ **Design System**
- Componentes reutilizáveis
- Responsivo (mobile-first)
- Sem scrollbars visíveis
- Toasts para feedback

## Estrutura de Permissões

- **ADMIN**: Acesso total
- **VENDEDOR**: Eventos e bilhetes
- **PORTEIRO**: Apenas validação

## Tecnologias Utilizadas

- Vue 3 + TypeScript
- Vite + Tailwind CSS
- Pinia + Vue Router
- Axios + PWA

## Troubleshooting

Se houver problemas:
1. Verifique se o backend está rodando
2. Confirme a URL da API no .env
3. Limpe o cache: `npm run dev -- --force`
4. Reinstale dependências: `rm -rf node_modules && npm install`