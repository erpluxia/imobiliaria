-- Migration: Sistema Multi-Empresa
-- Data: 2025-10-20
-- Descrição: Adiciona suporte para múltiplas empresas com domínios personalizados

-- ============================================================================
-- 1. CRIAR TABELA DE EMPRESAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#D4AF37',
  secondary_color TEXT DEFAULT '#000000',
  
  -- Contato
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  
  -- Social Media
  youtube_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  
  -- Configurações
  allow_user_listings BOOLEAN DEFAULT true,
  require_admin_approval BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON public.companies(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. CRIAR TABELA DE DOMÍNIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para company_domains
CREATE INDEX IF NOT EXISTS idx_company_domains_company_id ON public.company_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_company_domains_domain ON public.company_domains(domain);

-- Garantir apenas um domínio primário por empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_domains_primary 
  ON public.company_domains(company_id, is_primary) 
  WHERE is_primary = true;

-- ============================================================================
-- 3. ATUALIZAR TABELA PROFILES
-- ============================================================================

-- Adicionar colunas de empresa aos perfis
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS company_role TEXT DEFAULT 'user' CHECK (company_role IN ('user', 'company_admin'));

-- Índice para company_id em profiles
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- ============================================================================
-- 4. ATUALIZAR TABELA PROPERTIES
-- ============================================================================

-- Adicionar company_id (temporariamente nullable para migração)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Índice para company_id em properties
CREATE INDEX IF NOT EXISTS idx_properties_company_id ON public.properties(company_id);

-- ============================================================================
-- 5. CRIAR EMPRESA PADRÃO E MIGRAR DADOS EXISTENTES
-- ============================================================================

-- Inserir empresa padrão (AdjaImobi)
INSERT INTO public.companies (
  id,
  name,
  slug,
  phone,
  whatsapp,
  youtube_url,
  primary_color,
  secondary_color,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'AdjaImobi',
  'adjaimobi',
  '5511940569156',
  '5511940569156',
  'https://www.youtube.com/@adjaimobiliariaeadministra7447',
  '#D4AF37',
  '#000000',
  true
) ON CONFLICT (id) DO NOTHING;

-- Adicionar domínio padrão
INSERT INTO public.company_domains (
  company_id,
  domain,
  is_primary,
  is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'localhost',
  true,
  true
) ON CONFLICT (domain) DO NOTHING;

-- Migrar todos os perfis existentes para a empresa padrão
UPDATE public.profiles
SET company_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE company_id IS NULL;

-- Migrar todos os imóveis existentes para a empresa padrão
UPDATE public.properties
SET company_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE company_id IS NULL;

-- Tornar company_id obrigatório em properties
ALTER TABLE public.properties
  ALTER COLUMN company_id SET NOT NULL;

-- ============================================================================
-- 6. FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter company_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Função para verificar se usuário é company_admin
CREATE OR REPLACE FUNCTION public.is_company_admin(uid uuid)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid 
      AND company_role = 'company_admin'
  );
$$;

-- ============================================================================
-- 7. ATUALIZAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_domains ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7.1 POLICIES PARA COMPANIES
-- ============================================================================

-- Leitura: usuários veem apenas sua empresa, admins veem todas
DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies
  FOR SELECT USING (
    id = public.get_user_company_id()
    OR public.is_admin(auth.uid())
  );

-- Escrita: apenas super admins
DROP POLICY IF EXISTS companies_insert ON public.companies;
CREATE POLICY companies_insert ON public.companies
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS companies_update ON public.companies;
CREATE POLICY companies_update ON public.companies
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS companies_delete ON public.companies;
CREATE POLICY companies_delete ON public.companies
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

-- ============================================================================
-- 7.2 POLICIES PARA COMPANY_DOMAINS
-- ============================================================================

-- Leitura pública (necessário para detectar empresa por domínio)
DROP POLICY IF EXISTS company_domains_select ON public.company_domains;
CREATE POLICY company_domains_select ON public.company_domains
  FOR SELECT USING (true);

-- Escrita: apenas super admins
DROP POLICY IF EXISTS company_domains_mutate ON public.company_domains;
CREATE POLICY company_domains_mutate ON public.company_domains
  FOR ALL USING (
    public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
  );

-- ============================================================================
-- 7.3 ATUALIZAR POLICIES DE PROFILES
-- ============================================================================

-- Usuários veem apenas perfis da mesma empresa (ou próprio perfil)
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (
      company_id = public.get_user_company_id()
      AND (
        public.is_company_admin(auth.uid())
        OR public.is_admin(auth.uid())
      )
    )
    OR public.is_admin(auth.uid())
  );

-- Atualização: apenas admins ou company_admins da mesma empresa
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR (
      company_id = public.get_user_company_id()
      AND public.is_company_admin(auth.uid())
    )
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    -- Não permitir mudança de empresa exceto por super admin
    (company_id = public.get_user_company_id() OR public.is_admin(auth.uid()))
  );

-- ============================================================================
-- 7.4 ATUALIZAR POLICIES DE PROPERTIES
-- ============================================================================

-- Leitura: apenas imóveis da mesma empresa
DROP POLICY IF EXISTS properties_select ON public.properties;
CREATE POLICY properties_select ON public.properties
  FOR SELECT USING (
    company_id = public.get_user_company_id()
    OR public.is_admin(auth.uid())
  );

-- Inserção: apenas na empresa do usuário
DROP POLICY IF EXISTS properties_insert_active ON public.properties;
CREATE POLICY properties_insert_active ON public.properties
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
    AND public.is_active(auth.uid())
    AND company_id = public.get_user_company_id()
  );

-- Atualização: owner ou admin da mesma empresa
DROP POLICY IF EXISTS properties_update ON public.properties;
CREATE POLICY properties_update ON public.properties
  FOR UPDATE USING (
    (
      owner_id = auth.uid() 
      AND public.is_active(auth.uid())
      AND company_id = public.get_user_company_id()
    )
    OR (
      public.is_company_admin(auth.uid())
      AND company_id = public.get_user_company_id()
    )
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_admin(auth.uid())
  );

-- Deleção: owner ou admin da mesma empresa
DROP POLICY IF EXISTS properties_delete ON public.properties;
CREATE POLICY properties_delete ON public.properties
  FOR DELETE USING (
    (
      owner_id = auth.uid() 
      AND public.is_active(auth.uid())
      AND company_id = public.get_user_company_id()
    )
    OR (
      public.is_company_admin(auth.uid())
      AND company_id = public.get_user_company_id()
    )
    OR public.is_admin(auth.uid())
  );

-- ============================================================================
-- 7.5 ATUALIZAR POLICIES DE PROPERTY_IMAGES
-- ============================================================================

DROP POLICY IF EXISTS property_images_select ON public.property_images;
CREATE POLICY property_images_select ON public.property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.properties pr
      WHERE pr.id = property_id
        AND (
          pr.company_id = public.get_user_company_id()
          OR public.is_admin(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS property_images_mutate ON public.property_images;
CREATE POLICY property_images_mutate ON public.property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.properties pr
      WHERE pr.id = property_id
        AND (
          (
            pr.owner_id = auth.uid() 
            AND public.is_active(auth.uid())
            AND pr.company_id = public.get_user_company_id()
          )
          OR (
            public.is_company_admin(auth.uid())
            AND pr.company_id = public.get_user_company_id()
          )
          OR public.is_admin(auth.uid())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.properties pr
      WHERE pr.id = property_id
        AND (
          (
            pr.owner_id = auth.uid() 
            AND public.is_active(auth.uid())
            AND pr.company_id = public.get_user_company_id()
          )
          OR (
            public.is_company_admin(auth.uid())
            AND pr.company_id = public.get_user_company_id()
          )
          OR public.is_admin(auth.uid())
        )
    )
  );

-- ============================================================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.companies IS 'Empresas/imobiliárias na plataforma multi-tenant';
COMMENT ON TABLE public.company_domains IS 'Domínios personalizados associados a cada empresa';
COMMENT ON COLUMN public.profiles.company_id IS 'Empresa à qual o usuário pertence';
COMMENT ON COLUMN public.profiles.company_role IS 'Papel do usuário dentro da empresa (user ou company_admin)';
COMMENT ON COLUMN public.properties.company_id IS 'Empresa proprietária do imóvel';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
