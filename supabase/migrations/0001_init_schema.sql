-- ============================================================
-- CasaOS — Migração inicial
-- Schema, índices, triggers e RLS
-- ============================================================
-- Como usar: cole este arquivo inteiro no Supabase Dashboard
-- (SQL Editor > New query) e clique em Run.
-- ============================================================


-- ---------- TABELAS ----------
-- auth.users já é gerenciado pelo Supabase Auth, não recriamos aqui.

create table if not exists homes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references homes(id) on delete cascade,
  name text not null,
  category text,
  purchase_date date,
  value numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists warranties (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  provider text,
  expires_at date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists maintenances (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  description text not null,
  due_date date,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ---------- ÍNDICES ----------
-- Toda foreign key usada em política de RLS precisa de índice,
-- senão cada checagem de autorização vira um full scan.

create index if not exists idx_homes_user_id on homes(user_id);
create index if not exists idx_items_home_id on items(home_id);
create index if not exists idx_warranties_item_id on warranties(item_id);
create index if not exists idx_maintenances_item_id on maintenances(item_id);


-- ---------- updated_at AUTOMÁTICO ----------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_homes_updated_at
  before update on homes
  for each row execute function set_updated_at();

create trigger trg_items_updated_at
  before update on items
  for each row execute function set_updated_at();

create trigger trg_warranties_updated_at
  before update on warranties
  for each row execute function set_updated_at();

create trigger trg_maintenances_updated_at
  before update on maintenances
  for each row execute function set_updated_at();


-- ---------- FUNÇÕES DE AUTORIZAÇÃO ----------
-- Centralizam a checagem "esse recurso pertence ao usuário logado?"
-- para não repetir a mesma lógica em oito políticas diferentes.
-- security definer + search_path fixo evita que a função seja
-- manipulada por um schema malicioso.

create or replace function owns_home(_home_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from homes
    where homes.id = _home_id
      and homes.user_id = auth.uid()
  );
$$;

create or replace function owns_item(_item_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from items
    join homes on homes.id = items.home_id
    where items.id = _item_id
      and homes.user_id = auth.uid()
  );
$$;


-- ---------- ROW LEVEL SECURITY ----------

alter table homes enable row level security;
alter table items enable row level security;
alter table warranties enable row level security;
alter table maintenances enable row level security;

-- homes: propriedade direta (user_id)
create policy "homes_select_own" on homes
  for select using (auth.uid() = user_id);
create policy "homes_insert_own" on homes
  for insert with check (auth.uid() = user_id);
create policy "homes_update_own" on homes
  for update using (auth.uid() = user_id);
create policy "homes_delete_own" on homes
  for delete using (auth.uid() = user_id);

-- items: propriedade via home
create policy "items_select_own" on items
  for select using (owns_home(home_id));
create policy "items_insert_own" on items
  for insert with check (owns_home(home_id));
create policy "items_update_own" on items
  for update using (owns_home(home_id));
create policy "items_delete_own" on items
  for delete using (owns_home(home_id));

-- warranties: propriedade via item -> home
create policy "warranties_select_own" on warranties
  for select using (owns_item(item_id));
create policy "warranties_insert_own" on warranties
  for insert with check (owns_item(item_id));
create policy "warranties_update_own" on warranties
  for update using (owns_item(item_id));
create policy "warranties_delete_own" on warranties
  for delete using (owns_item(item_id));

-- maintenances: propriedade via item -> home
create policy "maintenances_select_own" on maintenances
  for select using (owns_item(item_id));
create policy "maintenances_insert_own" on maintenances
  for insert with check (owns_item(item_id));
create policy "maintenances_update_own" on maintenances
  for update using (owns_item(item_id));
create policy "maintenances_delete_own" on maintenances
  for delete using (owns_item(item_id));
