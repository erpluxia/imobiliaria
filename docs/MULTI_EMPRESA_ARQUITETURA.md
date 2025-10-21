# Arquitetura Multi-Empresa - Sistema Imobiliário

## Visão Geral

Este documento descreve a arquitetura para transformar o sistema imobiliário em uma plataforma **multi-empresa (multi-tenant)** com **domínios personalizados**.

## Objetivos

1. **Isolamento de Dados**: Cada empresa terá seus próprios imóveis, usuários e configurações
2. **Domínios Personalizados**: Cada empresa pode ter seu próprio domínio (ex: `empresa1.com`, `empresa2.com`)
3. **Branding Personalizado**: Logo, cores, informações de contato específicas por empresa
4. **Administração Centralizada**: Super admin pode gerenciar todas as empresas
5. **Escalabilidade**: Suportar múltiplas empresas sem degradação de performance

## Modelo de Dados

### Nova Estrutura de Tabelas

#### 1. Tabela `companies` (Empresas)
```sql
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  
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
  allow_user_listings BOOLEAN DEFAULT true, -- Usuários podem criar anúncios
  require_admin_approval BOOLEAN DEFAULT false, -- Anúncios precisam aprovação
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_companies_slug ON public.companies(slug);
CREATE INDEX idx_companies_is_active ON public.companies(is_active);
```

#### 2. Tabela `company_domains` (Domínios)
```sql
CREATE TABLE public.company_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL, -- ex: 'empresa1.com', 'www.empresa1.com'
  is_primary BOOLEAN DEFAULT false, -- Domínio principal
  is_verified BOOLEAN DEFAULT false, -- Verificação DNS
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_company_domains_company_id ON public.company_domains(company_id);
CREATE INDEX idx_company_domains_domain ON public.company_domains(domain);
CREATE UNIQUE INDEX idx_company_domains_primary ON public.company_domains(company_id, is_primary) 
  WHERE is_primary = true;
```

#### 3. Atualização da Tabela `profiles`
```sql
ALTER TABLE public.profiles
  ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN company_role TEXT DEFAULT 'user' CHECK (company_role IN ('user', 'company_admin'));

-- Índice
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
```

#### 4. Atualização da Tabela `properties`
```sql
ALTER TABLE public.properties
  ADD COLUMN company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE;

-- Índice
CREATE INDEX idx_properties_company_id ON public.properties(company_id);
```

## Fluxo de Identificação da Empresa

### 1. Detecção por Domínio (Frontend)

```typescript
// src/lib/companyDetection.ts
export async function detectCompanyByDomain(): Promise<Company | null> {
  const hostname = window.location.hostname;
  
  // Buscar empresa pelo domínio
  const { data, error } = await supabase
    .from('company_domains')
    .select('company_id, companies(*)')
    .eq('domain', hostname)
    .eq('is_verified', true)
    .single();
  
  if (error || !data) {
    // Fallback: usar empresa padrão ou mostrar erro
    return null;
  }
  
  return data.companies;
}
```

### 2. Context Provider (React)

```typescript
// src/contexts/CompanyContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface CompanyContextType {
  company: Company | null;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  loading: true
});

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadCompany() {
      const detected = await detectCompanyByDomain();
      setCompany(detected);
      setLoading(false);
      
      // Aplicar branding
      if (detected) {
        applyBranding(detected);
      }
    }
    loadCompany();
  }, []);
  
  return (
    <CompanyContext.Provider value={{ company, loading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => useContext(CompanyContext);
```

### 3. Aplicação de Branding Dinâmico

```typescript
// src/lib/branding.ts
export function applyBranding(company: Company) {
  // Atualizar CSS variables
  document.documentElement.style.setProperty('--primary-color', company.primary_color);
  document.documentElement.style.setProperty('--secondary-color', company.secondary_color);
  
  // Atualizar título e favicon
  document.title = company.name;
  
  // Atualizar meta tags
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', `Imóveis de ${company.name}`);
  }
}
```

## Row Level Security (RLS) Atualizado

### Políticas para `properties`

```sql
-- Leitura: apenas imóveis da mesma empresa
DROP POLICY IF EXISTS properties_select ON public.properties;
CREATE POLICY properties_select ON public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.company_id = properties.company_id
    )
    OR public.is_admin(auth.uid())
  );

-- Inserção: apenas na empresa do usuário
DROP POLICY IF EXISTS properties_insert_active ON public.properties;
CREATE POLICY properties_insert_active ON public.properties
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
    AND public.is_active(auth.uid())
    AND company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Atualização e Deleção: mesmas regras
DROP POLICY IF EXISTS properties_update ON public.properties;
CREATE POLICY properties_update ON public.properties
  FOR UPDATE USING (
    (owner_id = auth.uid() AND public.is_active(auth.uid()))
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );
```

### Políticas para `profiles`

```sql
-- Usuários só veem perfis da mesma empresa
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (
      company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.company_role = 'company_admin'
      )
    )
    OR public.is_admin(auth.uid())
  );
```

## Componentes React Atualizados

### 1. Header Dinâmico

```typescript
// src/components/Header.tsx
import { useCompany } from '../contexts/CompanyContext';

export function Header() {
  const { company } = useCompany();
  
  if (!company) return null;
  
  return (
    <header>
      <Link to="/">
        <img src={company.logo_url || '/logo-default.png'} alt={company.name} />
      </Link>
      {/* ... resto do header */}
    </header>
  );
}
```

### 2. Queries Filtradas por Empresa

```typescript
// src/pages/Home.tsx
import { useCompany } from '../contexts/CompanyContext';

export default function Home() {
  const { company } = useCompany();
  const [properties, setProperties] = useState([]);
  
  useEffect(() => {
    if (!company) return;
    
    async function loadProperties() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      setProperties(data || []);
    }
    
    loadProperties();
  }, [company]);
  
  // ... resto do componente
}
```

## Administração Multi-Empresa

### Super Admin

- Pode criar, editar e desativar empresas
- Gerenciar domínios de cada empresa
- Ver estatísticas globais
- Acessar dados de qualquer empresa

### Company Admin

- Gerenciar usuários da própria empresa
- Configurar branding e informações
- Aprovar/rejeitar anúncios (se configurado)
- Ver estatísticas da empresa

### Páginas Necessárias

1. **`/super-admin/companies`** - Listar todas as empresas
2. **`/super-admin/companies/create`** - Criar nova empresa
3. **`/super-admin/companies/:id/edit`** - Editar empresa
4. **`/super-admin/companies/:id/domains`** - Gerenciar domínios
5. **`/company-admin/settings`** - Configurações da empresa
6. **`/company-admin/users`** - Gerenciar usuários da empresa

## Configuração de Domínios

### DNS Setup

Para cada domínio personalizado:

1. Cliente configura CNAME ou A record apontando para o servidor
2. Adicionar domínio na tabela `company_domains`
3. Verificar propriedade do domínio (via TXT record ou arquivo)
4. Marcar como `is_verified = true`

### Exemplo de Verificação

```typescript
// src/lib/domainVerification.ts
export async function verifyDomain(domain: string, companyId: string): Promise<boolean> {
  // Verificar se existe TXT record: _imobiliaria-verify=<token>
  const token = generateVerificationToken(companyId);
  const txtRecords = await fetchDNSTxtRecords(domain);
  
  return txtRecords.includes(`_imobiliaria-verify=${token}`);
}
```

## Migração de Dados Existentes

### Script de Migração

```sql
-- 1. Criar empresa padrão
INSERT INTO public.companies (id, name, slug, phone, whatsapp)
VALUES (
  'default-company-uuid',
  'AdjaImobi',
  'adjaimobi',
  '5511940569156',
  '5511940569156'
);

-- 2. Adicionar domínio padrão
INSERT INTO public.company_domains (company_id, domain, is_primary, is_verified)
VALUES (
  'default-company-uuid',
  'adjaimobi.com.br',
  true,
  true
);

-- 3. Associar todos os usuários existentes à empresa padrão
UPDATE public.profiles
SET company_id = 'default-company-uuid'
WHERE company_id IS NULL;

-- 4. Associar todos os imóveis existentes à empresa padrão
UPDATE public.properties
SET company_id = 'default-company-uuid'
WHERE company_id IS NULL;
```

## Considerações de Performance

### 1. Índices Importantes
- `company_id` em todas as tabelas principais
- `domain` na tabela `company_domains`
- Índices compostos para queries frequentes

### 2. Cache
- Cachear informações da empresa no localStorage
- Invalidar cache ao detectar mudança de domínio

### 3. Queries Otimizadas
- Sempre incluir `company_id` nos filtros
- Usar `select` específico ao invés de `*`
- Implementar paginação em listagens

## Segurança

### 1. Isolamento de Dados
- RLS garante que usuários só acessem dados da própria empresa
- Validação de `company_id` em todas as operações

### 2. Autenticação
- Usuários autenticam normalmente via Supabase Auth
- `company_id` é atribuído no momento do cadastro baseado no domínio

### 3. Autorização
- Super Admin: role = 'admin' (global)
- Company Admin: company_role = 'company_admin' (por empresa)
- User: company_role = 'user'

## Próximos Passos

1. ✅ Criar migrations SQL
2. ✅ Implementar CompanyContext
3. ✅ Atualizar componentes para usar company
4. ✅ Criar páginas de administração
5. ✅ Implementar verificação de domínios
6. ✅ Migrar dados existentes
7. ✅ Testar isolamento de dados
8. ✅ Documentar processo de onboarding de novas empresas

## Exemplo de Onboarding

### Adicionar Nova Empresa

1. Super admin acessa `/super-admin/companies/create`
2. Preenche informações da empresa
3. Sistema cria empresa e gera slug único
4. Admin adiciona domínio(s) personalizado(s)
5. Cliente configura DNS
6. Sistema verifica domínio
7. Empresa ativa e pronta para uso
8. Primeiro usuário se cadastra e vira company_admin
