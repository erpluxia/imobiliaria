-- Feature Admin: roles/status em profiles, app_settings e RLS policies

-- 1) Campos em profiles
alter table public.profiles
  add column if not exists role text not null default 'user' check (role in ('user','admin')),
  add column if not exists status text not null default 'active' check (status in ('active','blocked'));

-- 2) app_settings
create table if not exists public.app_settings (
  id int primary key,
  allow_signups boolean not null default false
);
insert into public.app_settings (id, allow_signups)
  values (1, false)
on conflict (id) do nothing;

-- 3) Índice
create index if not exists idx_properties_owner_id on public.properties(owner_id);

-- 4) Funções helper (SECURITY DEFINER) para evitar recursão em policies
-- Observação: o owner destas funções deve ser o owner das tabelas para que bypass de RLS funcione conforme esperado.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

create or replace function public.is_active(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and status = 'active'
  );
$$;

-- 5) RLS ON
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.app_settings enable row level security;

-- 6) Policies: profiles (evitar self-select nas policies)
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (
    auth.uid() = id
    or public.is_admin(auth.uid())
  );

-- Atualizações somente por admin (para simplificar). Se desejar permitir que o usuário edite apenas dados próprios não sensíveis, crie uma policy adicional específica.
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (
    public.is_admin(auth.uid())
  )
  with check (
    public.is_admin(auth.uid())
  );

-- 7) Policies: properties
drop policy if exists properties_select on public.properties;
create policy properties_select on public.properties
  for select using (
    owner_id = auth.uid()
    or public.is_admin(auth.uid())
  );

drop policy if exists properties_insert_active on public.properties;
create policy properties_insert_active on public.properties
  for insert with check (
    owner_id = auth.uid()
    and public.is_active(auth.uid())
  );

drop policy if exists properties_update on public.properties;
create policy properties_update on public.properties
  for update using (
    (owner_id = auth.uid() and public.is_active(auth.uid()))
    or public.is_admin(auth.uid())
  )
  with check (
    (owner_id = auth.uid() and public.is_active(auth.uid()))
    or public.is_admin(auth.uid())
  );

drop policy if exists properties_delete on public.properties;
create policy properties_delete on public.properties
  for delete using (
    (owner_id = auth.uid() and public.is_active(auth.uid()))
    or public.is_admin(auth.uid())
  );

-- 8) Policies: property_images
-- Ajuste nomes de colunas conforme seu schema.
drop policy if exists property_images_select on public.property_images;
create policy property_images_select on public.property_images
  for select using (
    exists (
      select 1
      from public.properties pr
      where pr.id = property_id
        and (
          pr.owner_id = auth.uid()
          or public.is_admin(auth.uid())
        )
    )
  );

drop policy if exists property_images_mutate on public.property_images;
create policy property_images_mutate on public.property_images
  for all using (
    exists (
      select 1
      from public.properties pr
      where pr.id = property_id
        and (
          (pr.owner_id = auth.uid() and public.is_active(auth.uid()))
          or public.is_admin(auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1
      from public.properties pr
      where pr.id = property_id
        and (
          (pr.owner_id = auth.uid() and public.is_active(auth.uid()))
          or public.is_admin(auth.uid())
        )
    )
  );

-- 9) Policies: app_settings
-- Leitura pública autenticada; escrita apenas por admin.
drop policy if exists app_settings_public_read on public.app_settings;
create policy app_settings_public_read on public.app_settings
  for select using (true);

drop policy if exists app_settings_admin_write on public.app_settings;
create policy app_settings_admin_write on public.app_settings
  for all using (
    public.is_admin(auth.uid())
  )
  with check (
    public.is_admin(auth.uid())
  );
