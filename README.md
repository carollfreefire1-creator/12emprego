# SOS Serviços

Plataforma de intermediação entre clientes e profissionais de serviços residenciais (elétrica, hidráulica, pintura, limpeza, etc). Inclui app público, painel administrativo completo, PWA instalável, cupons, programa de indicação, LGPD e proteções de segurança.

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Prisma** + **PostgreSQL** (Supabase)
- **Supabase Auth** (autenticação e sessão via cookies SSR)
- **Tailwind CSS** (dark mode via classe)
- **Zod** (validação de payloads)
- Deploy: **Vercel**

## Funcionalidades

### Públicas
- Listagem de categorias e profissionais aprovados
- Solicitação de serviços com formulário protegido contra spam
- Cadastro/login (cliente ou profissional) com aceite de termos LGPD
- Programa de indicação com link único e recompensa em crédito
- Aplicação de cupons de desconto
- Exportação e exclusão de dados pessoais (LGPD, self-service)
- PWA instalável com modo offline
- Dark mode com persistência via cookie (sem flash de tema)
- Skeleton loading em todas as rotas com carregamento de dados
- Error boundaries por rota e globais

### Painel administrativo (`/admin`)
- Dashboard com métricas e gráfico de receita
- Gestão de usuários, profissionais (aprovação/rejeição), categorias
- Gestão de pedidos de serviço e pagamentos
- Sistema de cupons (CRUD completo)
- Acompanhamento do programa de indicação
- Relatórios com filtro de período
- Painel de segurança: requisições marcadas por rate limit/anti-spam
- Logs de auditoria de todas as ações administrativas

### Segurança e conformidade
- Rate limiting por IP em rotas sensíveis (login, cadastro, contato, pedidos, cupons)
- Honeypot + heurísticas anti-spam em todos os formulários públicos
- Logs de requisição com flag de atividade suspeita
- Headers de segurança (HSTS, X-Frame-Options, etc.)
- RLS (Row Level Security) habilitado em todas as tabelas do Supabase
- Conformidade com LGPD: consentimento, exportação e exclusão de dados, retenção configurável

## Configuração local

```bash
npm install
cp .env.example .env.local
# preencha as variáveis do Supabase no .env.local

npm run db:push      # aplica o schema Prisma ao banco
npm run db:seed      # popula dados fictícios de demonstração

npm run dev
```

## Migrations SQL (Supabase)

As migrations em `supabase/migrations/` são idempotentes e podem ser aplicadas via Supabase CLI ou direto no SQL Editor do painel Supabase, em ordem numérica:

1. `0001_base.sql` — esquema base (usuários, categorias, profissionais, pedidos, propostas)
2. `0005_admin.sql` — papéis administrativos, planos, índices
3. `0006_coupons.sql` — sistema de cupons
4. `0007_referral.sql` — programa de indicação
5. `0008_push.sql` — push notifications
6. `0009_logs_lgpd.sql` — logs de requisição e conformidade LGPD

> Alternativamente, use `npm run db:push` (Prisma) para sincronizar o schema diretamente — as migrations SQL servem como referência e para configurar políticas RLS específicas do Supabase.

## Variáveis de ambiente obrigatórias

Veja `.env.example`. Resumo do essencial para produção:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Conexão com o Postgres (Supabase) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Operações de servidor que ignoram RLS |
| `CRON_SECRET` | Protege os endpoints `/api/cron/*` |
| `NEXT_PUBLIC_APP_URL` | URL pública do app (usada em SEO, sitemap, links de indicação) |

## Deploy na Vercel

1. Conecte o repositório na Vercel.
2. Configure as variáveis de ambiente acima em **Settings → Environment Variables**.
3. O `vercel.json` já define os cron jobs (`expire-coupons` diário, `cleanup-logs` semanal) — a Vercel os agenda automaticamente.
4. `npm run build` executa `prisma generate` antes do build do Next.js.
5. Configure o domínio e atualize `NEXT_PUBLIC_APP_URL`.

## Estrutura de pastas

```
app/                 # rotas (App Router)
  admin/              # painel administrativo
  api/                # route handlers (cupons, LGPD, cron, requests)
  conta/              # área logada do usuário
components/           # componentes compartilhados
  admin/               # componentes específicos do painel
actions/admin.ts      # Server Actions do painel administrativo
lib/                  # lógica de negócio e utilitários de servidor
hooks/                # hooks client-side (install prompt)
prisma/               # schema + seed
supabase/migrations/  # SQL versionado
public/               # manifest, service worker, ícones PWA
```

## Dados fictícios

O `prisma/seed.ts` cria: 8 categorias, ~25 clientes, ~18 profissionais (aprovados/pendentes/rejeitados), planos, cupons, ~40 pedidos de serviço com propostas e pagamentos, indicações e notificações de exemplo. Um usuário admin é criado em `admin@sosservicos.com.br` — defina a senha dele diretamente no painel de autenticação do Supabase.
