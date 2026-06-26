-- ============================================================
-- Migration 0001: esquema base
-- ============================================================
create extension if not exists pgcrypto;

create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null unique,
  phone        text,
  avatar_url   text,
  role         text not null default 'user',
  blocked      boolean not null default false,
  blocked_reason text,
  consent_accepted_at timestamptz,
  marketing_opt_in boolean not null default false,
  data_deletion_request timestamptz,
  referral_code text not null unique default substr(md5(random()::text), 1, 8),
  referred_by_id uuid references users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text,
  active      boolean not null default true,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists professionals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  bio             text,
  document        text,
  approval_status text not null default 'pending',
  approved_at     timestamptz,
  rejected_reason text,
  verified        boolean not null default false,
  rating          numeric(3,2) not null default 0,
  completed_jobs  integer not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists professional_categories (
  professional_id uuid not null references professionals(id) on delete cascade,
  category_id     uuid not null references categories(id) on delete cascade,
  primary key (professional_id, category_id)
);

create table if not exists service_requests (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references users(id),
  professional_id uuid references professionals(id),
  category_id     uuid not null references categories(id),
  title           text not null,
  description     text not null,
  address         text,
  status          text not null default 'open',
  budget_cents    integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists proposals (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references service_requests(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  price_cents     integer not null,
  message         text,
  accepted        boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_users_role on users(role);
create index if not exists idx_professionals_status on professionals(approval_status);
create index if not exists idx_requests_status on service_requests(status);
create index if not exists idx_requests_client on service_requests(client_id);
create index if not exists idx_proposals_request on proposals(request_id);

alter table users enable row level security;
alter table professionals enable row level security;
alter table categories enable row level security;
alter table service_requests enable row level security;
alter table proposals enable row level security;

create policy "users_self_read" on users for select using (email = auth.email());
create policy "users_self_update" on users for update using (email = auth.email());
create policy "categories_public_read" on categories for select using (true);
create policy "professionals_public_read" on professionals for select using (approval_status = 'approved');
create policy "requests_owner_or_pro" on service_requests for select using (
  client_id = (select id from users where email = auth.email() limit 1)
  or professional_id = (select id from professionals where user_id = (select id from users where email = auth.email() limit 1))
);
