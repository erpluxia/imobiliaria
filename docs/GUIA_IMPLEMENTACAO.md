# Guia de Implementação - Sistema Multi-Empresa

## Resumo Executivo

Este guia descreve os passos necessários para implementar completamente o sistema multi-empresa no projeto imobiliário.

## Status Atual

✅ **Concluído:**
1. Documentação da arquitetura (`MULTI_EMPRESA_ARQUITETURA.md`)
2. Migration SQL (`sql/20251020_multi_empresa.sql`)
3. Tipos TypeScript (`src/types/company.ts`)
4. Biblioteca de detecção de empresa (`src/lib/companyDetection.ts`)
5. Context Provider (`src/contexts/CompanyContext.tsx`)
6. Atualização do `App.tsx` com branding dinâmico
7. Início da atualização das páginas

⏳ **Pendente:**
1. Atualizar todas as páginas para filtrar por `company_id`
2. Criar páginas de administração multi-empresa
3. Executar migration no banco de dados
4. Testar isolamento de dados

## Passo 1: Executar Migration SQL

### 1.1 Backup do Banco de Dados

Antes de executar a migration, faça backup:

```bash
# Via Supabase Dashboard
# Settings > Database > Backups
```

### 1.2 Executar Migration

No Supabase Dashboard:
1. Acesse **SQL Editor**
2. Abra o arquivo `sql/20251020_multi_empresa.sql`
3. Execute o script completo
4. Verifique se não há erros

### 1.3 Verificar Estrutura

```sql
-- Verificar tabelas criadas
SELECT * FROM companies LIMIT 5;
SELECT * FROM company_domains LIMIT 5;

-- Verificar dados migrados
SELECT COUNT(*) FROM properties WHERE company_id IS NOT NULL;
SELECT COUNT(*) FROM profiles WHERE company_id IS NOT NULL;
```

## Passo 2: Atualizar Páginas para Filtrar por Empresa

Todas as páginas que fazem queries de `properties` devem ser atualizadas para incluir o filtro `company_id`.

### 2.1 Padrão de Atualização

**Antes:**
```typescript
const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('is_active', true)
```

**Depois:**
```typescript
import { useCompany } from '../contexts/CompanyContext'

export default function MyPage() {
  const { company } = useCompany()
  
  useEffect(() => {
    if (!company) return
    
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
    }
    load()
  }, [company])
}
```

### 2.2 Páginas a Atualizar

- [x] `src/pages/Home.tsx` (parcialmente concluído)
- [ ] `src/pages/Results.tsx`
- [ ] `src/pages/Launches.tsx`
- [ ] `src/pages/LaunchesPremium.tsx`
- [ ] `src/pages/PropertyDetails.tsx`
- [ ] `src/pages/MyListings.tsx`
- [ ] `src/pages/CreateListing.tsx`
- [ ] `src/pages/EditListing.tsx`
- [ ] `src/pages/admin/AdminListings.tsx`

### 2.3 Exemplo Completo - Results.tsx

```typescript
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCompany } from '../contexts/CompanyContext'
import ListingCard from '../components/ListingCard'

export default function Results() {
  const { company } = useCompany()
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company) return

    async function loadProperties() {
      setLoading(true)
      
      let query = supabase
        .from('properties')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)

      // Aplicar filtros da URL
      const type = searchParams.get('type')
      if (type) query = query.eq('type', type)

      const city = searchParams.get('city')
      if (city) query = query.ilike('city', `%${city}%`)

      const { data, error } = await query.order('created_at', { ascending: false })

      if (!error) setProperties(data || [])
      setLoading(false)
    }

    loadProperties()
  }, [company, searchParams])

  if (!company) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Resultados da Busca</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <ListingCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2.4 Atualizar CreateListing.tsx

Ao criar um novo imóvel, incluir `company_id`:

```typescript
const { company } = useCompany()

const handleSubmit = async () => {
  if (!company) return

  const { data, error } = await supabase
    .from('properties')
    .insert({
      ...formData,
      company_id: company.id,
      owner_id: user.id
    })
}
```

## Passo 3: Criar Páginas de Administração

### 3.1 Super Admin - Gerenciar Empresas

**Arquivo:** `src/pages/super-admin/CompaniesManagement.tsx`

```typescript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCompanies } from '../../lib/companyDetection'
import type { Company } from '../../types/company'

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getAllCompanies()
      setCompanies(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Empresas</h1>
        <Link 
          to="/super-admin/companies/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nova Empresa
        </Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{company.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {company.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{company.subscription_plan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link to={`/super-admin/companies/${company.id}/edit`} className="text-blue-600 hover:underline mr-4">
                      Editar
                    </Link>
                    <Link to={`/super-admin/companies/${company.id}/domains`} className="text-blue-600 hover:underline">
                      Domínios
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

### 3.2 Adicionar Rotas no App.tsx

```typescript
import CompaniesManagement from './pages/super-admin/CompaniesManagement'
import CreateCompany from './pages/super-admin/CreateCompany'
import EditCompany from './pages/super-admin/EditCompany'
import ManageDomains from './pages/super-admin/ManageDomains'

// Dentro de <Routes>
<Route path="/super-admin/companies" element={<RequireAuth><RequireAdmin><CompaniesManagement /></RequireAdmin></RequireAuth>} />
<Route path="/super-admin/companies/create" element={<RequireAuth><RequireAdmin><CreateCompany /></RequireAdmin></RequireAuth>} />
<Route path="/super-admin/companies/:id/edit" element={<RequireAuth><RequireAdmin><EditCompany /></RequireAdmin></RequireAuth>} />
<Route path="/super-admin/companies/:id/domains" element={<RequireAuth><RequireAdmin><ManageDomains /></RequireAdmin></RequireAuth>} />
```

## Passo 4: Configurar Domínios

### 4.1 Adicionar Domínio no Banco

```sql
-- Exemplo: adicionar domínio para empresa
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES (
  'uuid-da-empresa',
  'meudominio.com.br',
  true,
  false -- Marcar como true após verificar DNS
);
```

### 4.2 Configurar DNS

No provedor de DNS do cliente:

**Opção 1: CNAME (recomendado)**
```
meudominio.com.br    CNAME    seu-servidor.com
```

**Opção 2: A Record**
```
meudominio.com.br    A    123.456.789.0
```

### 4.3 Verificar Domínio

Após configuração DNS, marcar como verificado:

```sql
UPDATE company_domains
SET is_verified = true
WHERE domain = 'meudominio.com.br';
```

## Passo 5: Testar Isolamento de Dados

### 5.1 Criar Empresa de Teste

```sql
-- Criar segunda empresa para teste
INSERT INTO companies (name, slug, phone, whatsapp)
VALUES ('Imobiliária Teste', 'teste', '11999999999', '11999999999');

-- Adicionar domínio localhost:3001 para teste
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES (
  (SELECT id FROM companies WHERE slug = 'teste'),
  'localhost:3001',
  true,
  true
);
```

### 5.2 Criar Usuário de Teste

```sql
-- Após criar usuário via interface, associar à empresa teste
UPDATE profiles
SET company_id = (SELECT id FROM companies WHERE slug = 'teste')
WHERE email = 'teste@example.com';
```

### 5.3 Verificar Isolamento

1. Acessar `localhost:3000` (empresa padrão)
2. Acessar `localhost:3001` (empresa teste)
3. Verificar que cada domínio mostra apenas imóveis da própria empresa
4. Tentar criar imóvel e verificar que `company_id` é atribuído corretamente

## Passo 6: Onboarding de Nova Empresa

### 6.1 Processo Completo

1. **Super Admin cria empresa**
   - Acessa `/super-admin/companies/create`
   - Preenche nome, slug, cores, logo, contatos
   - Sistema cria empresa no banco

2. **Adicionar domínio**
   - Acessa `/super-admin/companies/{id}/domains`
   - Adiciona domínio(s) da empresa
   - Sistema gera token de verificação

3. **Cliente configura DNS**
   - Cliente aponta domínio para servidor
   - Aguarda propagação DNS (até 48h)

4. **Verificar domínio**
   - Super admin marca domínio como verificado
   - OU implementar verificação automática via TXT record

5. **Primeiro acesso**
   - Cliente acessa seu domínio
   - Faz cadastro (primeiro usuário vira company_admin)
   - Começa a usar o sistema

## Checklist de Implementação

### Banco de Dados
- [ ] Executar migration `20251020_multi_empresa.sql`
- [ ] Verificar que empresa padrão foi criada
- [ ] Verificar que dados existentes foram migrados
- [ ] Testar RLS policies

### Frontend
- [ ] Atualizar todas as páginas com filtro `company_id`
- [ ] Criar páginas de super admin
- [ ] Testar branding dinâmico
- [ ] Testar isolamento de dados entre empresas

### Configuração
- [ ] Adicionar domínios no banco
- [ ] Configurar DNS
- [ ] Verificar domínios
- [ ] Testar acesso por diferentes domínios

### Testes
- [ ] Criar empresa de teste
- [ ] Criar usuários em diferentes empresas
- [ ] Verificar que usuário A não vê dados da empresa B
- [ ] Testar criação/edição/exclusão de imóveis
- [ ] Testar super admin pode ver tudo

## Troubleshooting

### Erro: "Empresa não encontrada"

**Causa:** Domínio não está cadastrado ou não está verificado

**Solução:**
```sql
-- Verificar se domínio existe
SELECT * FROM company_domains WHERE domain = 'seu-dominio.com';

-- Se não existe, adicionar
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-da-empresa', 'seu-dominio.com', true, true);
```

### Erro: "company_id violates not-null constraint"

**Causa:** Tentando criar imóvel sem company_id

**Solução:** Verificar que `CreateListing.tsx` está incluindo `company_id` no insert

### Usuário não vê seus próprios imóveis

**Causa:** `company_id` do usuário não corresponde ao `company_id` dos imóveis

**Solução:**
```sql
-- Verificar company_id do usuário
SELECT id, email, company_id FROM profiles WHERE email = 'usuario@example.com';

-- Verificar company_id dos imóveis
SELECT id, title, company_id FROM properties WHERE owner_id = 'uuid-do-usuario';

-- Se diferentes, corrigir
UPDATE properties
SET company_id = (SELECT company_id FROM profiles WHERE id = owner_id)
WHERE owner_id = 'uuid-do-usuario';
```

## Próximos Passos (Futuro)

1. **Verificação automática de domínios** via TXT records
2. **Painel de estatísticas** por empresa
3. **Limites por plano** (basic, premium, enterprise)
4. **Faturamento** integrado por empresa
5. **Temas personalizados** além de cores
6. **Subdomínios automáticos** (empresa.plataforma.com.br)
7. **API pública** para integrações
8. **Webhooks** para eventos importantes

## Suporte

Para dúvidas ou problemas na implementação:
- Consultar `MULTI_EMPRESA_ARQUITETURA.md` para detalhes técnicos
- Verificar logs do navegador (console)
- Verificar logs do Supabase
- Testar queries SQL diretamente no SQL Editor
