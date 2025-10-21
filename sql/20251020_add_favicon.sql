-- Migration: Adicionar campo favicon_url
-- Data: 2025-10-20
-- Descrição: Adiciona coluna para armazenar URL do favicon da empresa

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS favicon_url TEXT;

COMMENT ON COLUMN public.companies.favicon_url IS 'URL do favicon da empresa (ICO ou PNG, 32x32px ou 64x64px)';
