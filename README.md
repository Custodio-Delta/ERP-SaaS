# ERP SaaS Moderno (Premium)

Este é um ERP SaaS de altíssimo nível, desenvolvido com design minimalista escuro (inspirado em Stripe, Linear e Vercel) e arquitetura modular profissional. Ele oferece controle completo de Clientes (CRM), Vendas, Produtos (Estoque), Financeiro (Fluxo de Caixa) e Assinaturas (Billing).

---

## 🚀 Tecnologias Utilizadas

* **Frontend**: Next.js 15+, React 19, TypeScript, TailwindCSS v4, Framer Motion, Recharts.
* **Componentes**: Lucide Icons, Zod (validações), TanStack Query v5.
* **Backend**: Next.js App Router, Server Actions transacionais.
* **Banco de Dados & ORM**: PostgreSQL, Prisma ORM.
* **Autenticação**: Sessões baseadas em banco de dados com Cookies seguros (arquitetura customizada e segura).
* **Infraestrutura**: Docker & Docker Compose.

---

## 🛠️ Funcionalidades Principais

1. **Multi-Tenancy Isolado**: Cada empresa possui seus próprios membros, configurações, registros financeiros, estoque e faturamento, sem risco de cruzamento de dados.
2. **Dashboard de Performance**: Indicadores de Faturamento, Vendas, Clientes Ativos e Alertas de Estoque Baixo, acompanhados de gráficos interativos (Recharts) e logs de auditoria.
3. **Módulo Financeiro (Fluxo de Caixa)**: Controle de entradas/saídas por categoria com simulador de **AI Financial Insights** (Inteligência Artificial que gera diagnósticos financeiros dos dados operacionais da empresa).
4. **CRM & Funil de Vendas**: Pipeline visual (Kanban) para gerenciar Leads, Contatos em Negociação e Clientes Ativos com filtros por tags.
5. **Controle de Estoque & SKUs**: Controle automático de níveis de estoque com logs de inventário detalhados e alertas de reposição.
6. **Módulo de Vendas**: Integração em tempo real que deduz itens do estoque e lança receitas no fluxo de caixa assim que os pedidos são faturados.
7. **Command Menu (Cmd+K / Ctrl+K)**: Menu de comando instantâneo para pesquisa global, ações rápidas (lançar receita, cadastrar cliente) e navegação ágil.
8. **Gestão de Planos & Faturamento**: Visualização e upgrade de assinaturas simulando integrações com Stripe Checkout e webhooks.

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter instalado:
* **Node.js 18+** e **npm**
* **Docker** e **Docker Desktop** rodando na sua máquina

### 2. Subir o Banco de Dados PostgreSQL
Na raiz do projeto, execute o comando para iniciar o contêiner do PostgreSQL:
```bash
docker-compose up -d
```

### 3. Configurar as Variáveis de Ambiente
O projeto já vem pré-configurado com o arquivo `.env`. Caso queira alterar portas ou senhas, configure com base no `.env.example`:
```bash
cp .env.example .env
```

### 4. Rodar as Migrações e o Seed
Crie a estrutura de tabelas no banco de dados e insira os dados realistas de demonstração (leads, faturamento e produtos):
```bash
npx prisma db push
npx prisma db seed
```

### 5. Executar o Servidor de Desenvolvimento
Inicie o servidor local do Next.js:
```bash
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

---

## 🔑 Credenciais Padrão de Teste (Seed)

Use a conta administrativa gerada automaticamente pelo Seed para fazer o primeiro login e visualizar o dashboard populado:

* **E-mail**: `admin@erp-saas.com`
* **Senha**: `admin123`

---

## 📂 Estrutura do Diretório Principal

* `src/app`: Rotas da aplicação Next.js (Autenticação e Dashboard administrativo).
* `src/components`: Componentes visuais reutilizáveis (Sidebar, Gráficos, Command Menu e UI padrão).
* `src/actions`: Lógica do servidor do Next.js (Server Actions) encapsulando validações Zod e mutações no banco de dados.
* `src/lib`: Singletons e conexões (Banco de dados, gerenciador de sessões e formatação).
* `prisma`: Arquivo de schema do banco de dados e script de seed.
