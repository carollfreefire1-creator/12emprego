-- ============================================================
-- Migration 0007: sistema de indicação (referral)
-- ============================================================

alter table users add column if not exists referral_code text unique default substr(md5(random()::text), 1, 8);
alter table users add column if not exists referred_by_id uuid references users(id);

create table if not exists referral_rewards (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references users(id) on delete cascade,
  referred_id   uuid not null references users(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending','rewarded','expired')),
  reward_cents  integer not null default 2000,
  rewarded_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (referrer_id, referred_id)
);

create index if not exists idx_referral_rewards_status on referral_rewards(status);
create index if not exists idx_users_referred_by on users(referred_by_id);

alter table referral_rewards enable row level security;

create policy "referral_rewards_own_or_admin" on referral_rewards for select
  using (
    referrer_id = (select id from users where email = auth.email() limit 1)
    or referred_id = (select id from users where email = auth.email() limit 1)
    or exists (select 1 from users where email = auth.email() and role = 'admin')
  );

create policy "admin_full_referral_rewards" on referral_rewards for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));
