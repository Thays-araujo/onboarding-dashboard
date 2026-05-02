# Dashboard de Onboarding

Dashboard para métricas mensais de onboarding, alimentado via webhook do CRM.

---

## Instalação

### 1. Instale o Node.js
Baixe em: https://nodejs.org (versão LTS recomendada)

### 2. Instale as dependências
```bash
cd onboarding-dashboard
npm install
```

### 3. Inicie o servidor
```bash
npm start
```

O dashboard estará em: **http://localhost:3000**

---

## Estrutura de arquivos

```
onboarding-dashboard/
├── server.js          ← backend (Express)
├── package.json
├── data.json          ← criado automaticamente ao receber o 1º evento
└── public/
    └── index.html     ← dashboard (aberto via http://localhost:3000)
```

---

## Webhook — como enviar eventos do CRM

Faça um **POST** para `http://localhost:3000/webhook/onboarding`

### Corpo (JSON)

```json
{
  "name":   "Nome do Cliente",
  "status": "agendado",
  "date":   "15/05/2025",
  "owner":  "Carlos",
  "month":  4,
  "year":   2025
}
```

| Campo    | Obrigatório | Valores aceitos                          |
|----------|-------------|------------------------------------------|
| `name`   | ✅ sim      | qualquer texto                           |
| `status` | ✅ sim      | `agendado` \| `concluido` \| `cancelado` |
| `date`   | não         | dd/mm/aaaa (padrão: data de hoje)        |
| `owner`  | não         | nome do responsável                      |
| `month`  | não         | 0–11 (Janeiro=0, padrão: mês atual)      |
| `year`   | não         | ex: 2025 (padrão: ano atual)             |

### Exemplo com cURL

```bash
curl -X POST http://localhost:3000/webhook/onboarding \
  -H "Content-Type: application/json" \
  -d '{"name":"Empresa Exemplo","status":"concluido","owner":"Ana"}'
```

---

## Funcionalidades do dashboard

- **Cards de resumo**: agendados, concluídos, cancelados e taxa de conversão
- **Comparação automática** com o mês anterior
- **Gráfico de rosca** — distribuição do mês atual
- **Gráfico de barras** — comparativo dos últimos 6 meses
- **Tabela de clientes** com filtro por status e opção de remover
- **Navegação por mês** — histórico completo
- **Auto-atualização** a cada 30 segundos
- **Tema claro/escuro** automático (segue o sistema)

---

## Expor para a internet (opcional)

Para que o CRM acesse o webhook de fora da sua rede local, use o **ngrok**:

```bash
# Instale: https://ngrok.com
ngrok http 3000
```

O ngrok fornecerá uma URL pública (ex: `https://abc123.ngrok.io`).  
Configure no CRM como: `POST https://abc123.ngrok.io/webhook/onboarding`

---

## API interna

| Método   | Rota                  | Descrição              |
|----------|-----------------------|------------------------|
| `POST`   | `/webhook/onboarding` | Recebe evento do CRM   |
| `GET`    | `/api/events`         | Lista todos os eventos |
| `DELETE` | `/api/events/:id`     | Remove um evento       |
