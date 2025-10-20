-- Migração: adicionar campo is_launch (lançamento)
-- Data: 2025-10-20
-- Descrição: Indica se o imóvel é um lançamento/empreendimento novo

-- 1) Adicionar coluna is_launch
alter table public.properties
  add column if not exists is_launch boolean not null default false;

-- 2) Comentário para documentação
comment on column public.properties.is_launch is 'Indica se o imóvel é um lançamento ou empreendimento novo';

-- 3) Índice para facilitar filtros de lançamentos
create index if not exists idx_properties_is_launch on public.properties(is_launch) where is_launch = true;
