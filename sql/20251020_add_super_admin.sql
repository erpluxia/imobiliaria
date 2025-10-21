-- Migration: Adicionar role super_admin
-- Data: 2025-10-20
-- Descrição: Criar role separado para Super Admin (gerencia todas as empresas)

-- ============================================================================
-- 1. ATUALIZAR CONSTRAINT DA COLUNA ROLE
-- ============================================================================

-- Remover constraint antiga
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Adicionar nova constraint com super_admin
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- ============================================================================
-- 2. CRIAR FUNÇÃO PARA VERIFICAR SUPER ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin(uid uuid)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid 
      AND role = 'super_admin'
  );
$$;

-- ============================================================================
-- 3. ATUALIZAR POLICIES PARA SUPER ADMIN
-- ============================================================================

-- Companies: Super admin pode ver e gerenciar todas
DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies
  FOR SELECT USING (
    id = public.get_user_company_id()
    OR public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS companies_insert ON public.companies;
CREATE POLICY companies_insert ON public.companies
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS companies_update ON public.companies;
CREATE POLICY companies_update ON public.companies
  FOR UPDATE USING (
    public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS companies_delete ON public.companies;
CREATE POLICY companies_delete ON public.companies
  FOR DELETE USING (
    public.is_super_admin(auth.uid())
  );

-- Company Domains: Super admin gerencia
DROP POLICY IF EXISTS company_domains_mutate ON public.company_domains;
CREATE POLICY company_domains_mutate ON public.company_domains
  FOR ALL USING (
    public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.is_super_admin(auth.uid())
  );

-- Profiles: Super admin vê todos os perfis
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
    OR public.is_super_admin(auth.uid())
  );

-- Properties: Super admin vê todos os imóveis
DROP POLICY IF EXISTS properties_select ON public.properties;
CREATE POLICY properties_select ON public.properties
  FOR SELECT USING (
    company_id = public.get_user_company_id()
    OR public.is_admin(auth.uid())
    OR public.is_super_admin(auth.uid())
  );

-- ============================================================================
-- 4. COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION public.is_super_admin IS 'Verifica se usuário é super admin (gerencia todas as empresas)';

-- ============================================================================
-- 5. EXEMPLO: PROMOVER USUÁRIO A SUPER ADMIN
-- ============================================================================

-- Para promover um usuário a super admin, execute:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'seu-email@example.com';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
