# Status de Bilhetes - ArenaTicket Frontend

## Valores Corretos do Enum StatusBilhete

O backend utiliza os seguintes status para bilhetes, conforme definido no enum `StatusBilhete`:

### 1. DISPONIVEL
- **Descrição**: Bilhetes disponíveis para venda
- **Uso**: Quando o bilhete foi criado mas ainda não foi vendido
- **API**: `/api/admin/bilhetes/contagem/DISPONIVEL`

### 2. RESERVADO  
- **Descrição**: Bilhetes reservados temporariamente
- **Uso**: Durante o processo de compra, para evitar venda dupla
- **API**: `/api/admin/bilhetes/contagem/RESERVADO`

### 3. VENDIDO
- **Descrição**: Bilhetes vendidos com sucesso
- **Uso**: Após confirmação do pagamento
- **API**: `/api/admin/bilhetes/contagem/VENDIDO`

### 4. USADO
- **Descrição**: Bilhetes já validados/utilizados
- **Uso**: Após validação na entrada do evento
- **API**: `/api/admin/bilhetes/contagem/USADO`

### 5. CANCELADO
- **Descrição**: Bilhetes cancelados
- **Uso**: Quando uma venda é cancelada ou reembolsada
- **API**: `/api/admin/bilhetes/contagem/CANCELADO`

## Mapeamento Frontend

No dashboard do frontend, utilizamos:
- **Bilhetes Disponíveis** → `DISPONIVEL`
- **Bilhetes Vendidos** → `VENDIDO` 
- **Bilhetes Usados** → `USADO`
- **Bilhetes Cancelados** → `CANCELADO`

## Endpoint de Verificação

Para verificar os status válidos: `GET /api/public/enums/status-bilhete`

## Correções Implementadas

1. ✅ Corrigido `ATIVO` → `VENDIDO` no dashboard
2. ✅ Adicionado card para `DISPONIVEL`
3. ✅ Atualizado store de tickets
4. ✅ Corrigido tipos TypeScript
5. ✅ Documentação atualizada

## Observação

O valor `RESERVADO` não é exibido no dashboard principal, mas pode ser usado em relatórios específicos se necessário.