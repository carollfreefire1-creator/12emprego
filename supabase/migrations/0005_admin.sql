-- ============================================================
-- Migration: painel administrativo
-- ============================================================

-- Papel de admin no usuário
alter table users add column if not exists role text not null default 'user';
alter table users add column if not exists blocked boolean not null default false;
alter table users add column if not exists blocked_reason text;

-- Status de aprovação dos profissionais
alter table professionals add column if not exists approval_status text not null default 'pending';
alter table professionals add column if not exists approved_at timestamptz;
alter table professionals add column if not exists rejected_reason text;

-- Categorias de serviço
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text,
  active      boolean not null default true,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Planos de assinatura
create table if not exists plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  price_cents   integer not null,
  interval      text not null default 'month',
  features      jsonb not null default '[]',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Assinaturas dos profissionais
create table if not exists subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  plan_id      uuid not null references plans(id),
  status       text not null default 'active',
  current_period_end timestamptz,
  created_at   timestamptz not null default now()
);

-- Pagamentos
create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  request_id   uuid references service_requests(id) on delete set null,
  amount_cents integer not null,
  status       text not null default 'pending',
  method       text,
  gateway_id   text,
  created_at   timestamptz not null default now()
);

-- Log de ações administrativas
create table if not exists admin_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references users(id),
  action      text not null,
  target_type text not null,
  target_id   uuid,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_categories_active on categories(active);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_created on payments(created_at desc);
create index if not exists idx_subscriptions_user on subscriptions(user_id);
create index if not exists idx_admin_logs_created on admin_logs(created_at desc);

alter table categories enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table admin_logs enable row level security;

create policy "categories_public_read" on categories for select using (true);
create policy "plans_public_read" on plans for select using (true);

create policy "admin_full_categories" on categories for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));

create policy "admin_full_plans" on plans for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));

create policy "admin_full_payments" on payments for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));

create policy "admin_full_logs" on admin_logs for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));

create policy "subscriptions_own_or_admin" on subscriptions for select
  using (
    user_id = (select id from users where email = auth.email() limit 1)
    or exists (select 1 from users where email = auth.email() and role = 'admin')
  );

create policy "admin_write_subscriptions" on subscriptions for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));

insert into categories (name, slug, icon, order_index) values
  ('Elétrica', 'eletrica', '⚡', 1),
  ('Hidráulica', 'hidraulica', '🚰', 2),
  ('Pintura', 'pintura', '🎨', 3),
  ('Limpeza', 'limpeza', '🧹', 4),
  ('Reformas', 'reformas', '🔨', 5),
  ('Jardinagem', 'jardinagem', '🌳', 6)
on conflict (slug) do nothing;

insert into plans (name, price_cents, interval, features) values
  ('Básico', 0, 'month', '["5 propostas por mês","Perfil padrão"]'),
  ('Profissional', 4990, 'month', '["Propostas ilimitadas","Selo verificado","Destaque na busca"]'),
  ('Premium', 9990, 'month', '["Tudo do Profissional","Suporte prioritário","Relatórios avançados"]')
on conflict do nothing;
