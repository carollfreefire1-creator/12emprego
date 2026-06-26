-- ============================================================
-- Migration 0006: sistema de cupons
-- ============================================================

create table if not exists coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  type             text not null check (type in ('percent','fixed')),
  value            integer not null,
  max_uses         integer,
  used_count       integer not null default 0,
  min_amount_cents integer,
  active           boolean not null default true,
  starts_at        timestamptz,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

create table if not exists coupon_redemptions (
  id         uuid primary key default gen_random_uuid(),
  coupon_id  uuid not null references coupons(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (coupon_id, user_id)
);

alter table payments add column if not exists discount_cents integer not null default 0;
alter table payments add column if not exists coupon_id uuid references coupons(id);

create index if not exists idx_coupons_active on coupons(active);
create index if not exists idx_coupons_code on coupons(code);

alter table coupons enable row level security;
alter table coupon_redemptions enable row level security;

create policy "coupons_public_read_active" on coupons for select using (active = true);

create policy "admin_full_coupons" on coupons for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));

create policy "redemptions_own_or_admin" on coupon_redemptions for select
  using (
    user_id = (select id from users where email = auth.email() limit 1)
    or exists (select 1 from users where email = auth.email() and role = 'admin')
  );

create policy "redemptions_insert_own" on coupon_redemptions for insert
  with check (user_id = (select id from users where email = auth.email() limit 1));

-- Cupons fictícios de exemplo
insert into coupons (code, type, value, max_uses, min_amount_cents, expires_at) values
  ('BEMVINDO10', 'percent', 10, 500, 0, now() + interval '180 days'),
  ('SOS20OFF', 'fixed', 2000, 200, 5000, now() + interval '60 days'),
  ('INDIQUE15', 'percent', 15, null, 0, now() + interval '365 days')
on conflict (code) do nothing;
