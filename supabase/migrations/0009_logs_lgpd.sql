-- ============================================================
-- Migration 0009: logs de requisição, anti-spam e LGPD
-- ============================================================

create table if not exists request_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  ip          text not null,
  path        text not null,
  method      text not null,
  status_code integer,
  user_agent  text,
  flagged     boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists consent_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  action     text not null,
  ip         text,
  created_at timestamptz not null default now()
);

-- Campos de LGPD no usuário (idempotente, caso 0001 não tenha sido aplicada)
alter table users add column if not exists consent_accepted_at timestamptz;
alter table users add column if not exists marketing_opt_in boolean not null default false;
alter table users add column if not exists data_deletion_request timestamptz;

create index if not exists idx_request_logs_ip_created on request_logs(ip, created_at);
create index if not exists idx_request_logs_flagged on request_logs(flagged);
create index if not exists idx_consent_logs_user on consent_logs(user_id);

-- Auto-limpeza: índice para permitir exclusão eficiente de logs antigos (job cron)
create index if not exists idx_request_logs_created on request_logs(created_at);

alter table request_logs enable row level security;
alter table consent_logs enable row level security;

create policy "admin_full_request_logs" on request_logs for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));

create policy "consent_logs_own_or_admin" on consent_logs for select
  using (
    user_id = (select id from users where email = auth.email() limit 1)
    or exists (select 1 from users where email = auth.email() and role = 'admin')
  );

create policy "consent_logs_insert_own" on consent_logs for insert
  with check (user_id = (select id from users where email = auth.email() limit 1));
