# Sistema Multi-Empresa - Resumo

## 📋 Visão Geral

O projeto foi preparado para se tornar uma **plataforma multi-empresa (multi-tenant)** com **domínios personalizados**. Cada empresa terá:

- ✅ Domínio próprio (ex: `empresa1.com.br`, `empresa2.com.br`)
- ✅ Branding personalizado (logo, cores)
- ✅ Isolamento completo de dados
- ✅ Usuários e imóveis exclusivos
- ✅ Configurações independentes

## 📁 Arquivos Criados

### Documentação
- **`docs/MULTI_EMPRESA_ARQUITETURA.md`** - Arquitetura técnica detalhada
- **`docs/GUIA_IMPLEMENTACAO.md`** - Passo a passo para implementar
- **`docs/README_MULTI_EMPRESA.md`** - Este arquivo (resumo)

### SQL
- **`sql/20251020_multi_empresa.sql`** - Migration completa do banco de dados

### TypeScript/React
- **`src/types/company.ts`** - Tipos TypeScript para empresas
- **`src/lib/companyDetection.ts`** - Biblioteca de detecção e gerenciamento
- **`src/contexts/CompanyContext.tsx`** - Context Provider React

### Atualizações
- **`src/main.tsx`** - Adicionado CompanyProvider
- **`src/App.tsx`** - Branding dinâmico (logo, cores, WhatsApp, YouTube)
- **`src/pages/Home.tsx`** - Exemplo de filtro por empresa

## 🎯 Como Funciona

### 1. Detecção de Empresa

```
Usuário acessa → empresa1.com.br
                      ↓
Sistema busca domínio no banco
                      ↓
Encontra empresa associada
                      ↓
Aplica branding e filtra dados
```

### 2. Isolamento de Dados

Cada query inclui automaticamente `company_id`:

```typescript
const { company } = useCompany()

const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('company_id', company.id) // ← Filtro automático
  .eq('is_active', true)
```

### 3. Row Level Security (RLS)

O banco de dados garante isolamento através de policies:

```sql
-- Usuários só veem imóveis da própria empresa
CREATE POLICY properties_select ON properties
  FOR SELECT USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );
```

## 🚀 Próximos Passos

### Passo 1: Executar Migration SQL ⚠️

```sql
-- No Supabase SQL Editor, executar:
-- sql/20251020_multi_empresa.sql
```

Isso irá:
- Criar tabelas `companies` e `company_domains`
- Adicionar `company_id` em `profiles` e `properties`
- Criar empresa padrão "AdjaImobi"
- Migrar dados existentes
- Configurar RLS policies

### Passo 2: Atualizar Páginas Restantes

Páginas que ainda precisam ser atualizadas:

- [ ] `src/pages/Results.tsx`
- [ ] `src/pages/Launches.tsx`
- [ ] `src/pages/LaunchesPremium.tsx`
- [ ] `src/pages/PropertyDetails.tsx`
- [ ] `src/pages/MyListings.tsx`
- [ ] `src/pages/CreateListing.tsx`
- [ ] `src/pages/EditListing.tsx`
- [ ] `src/pages/admin/AdminListings.tsx`

**Padrão a seguir:**

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
        .eq('company_id', company.id) // ← Adicionar este filtro
        // ... resto dos filtros
    }
    load()
  }, [company])
}
```

### Passo 3: Criar Páginas de Super Admin

Criar páginas para gerenciar empresas:

- [ ] `/super-admin/companies` - Listar empresas
- [ ] `/super-admin/companies/create` - Criar empresa
- [ ] `/super-admin/companies/:id/edit` - Editar empresa
- [ ] `/super-admin/companies/:id/domains` - Gerenciar domínios

Ver exemplos completos em `docs/GUIA_IMPLEMENTACAO.md`

### Passo 4: Configurar Domínios

Para cada nova empresa:

1. **Adicionar no banco:**
```sql
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-da-empresa', 'novodominio.com.br', true, true);
```

2. **Configurar DNS:**
```
novodominio.com.br    CNAME    seu-servidor.com
```

3. **Testar acesso:**
```
https://novodominio.com.br
```

## 📊 Estrutura do Banco de Dados

### Tabela `companies`
```
id, name, slug, logo_url, primary_color, secondary_color,
phone, whatsapp, email, address, youtube_url, facebook_url,
instagram_url, allow_user_listings, require_admin_approval,
is_active, subscription_plan, subscription_expires_at
```

### Tabela `company_domains`
```
id, company_id, domain, is_primary, is_verified, verification_token
```

### Alterações em `profiles`
```
+ company_id (UUID)
+ company_role ('user' | 'company_admin')
```

### Alterações em `properties`
```
+ company_id (UUID, NOT NULL)
```

## 🔐 Níveis de Acesso

### Super Admin (role = 'admin')
- Gerencia todas as empresas
- Cria/edita/desativa empresas
- Gerencia domínios
- Acessa dados de qualquer empresa

### Company Admin (company_role = 'company_admin')
- Gerencia usuários da própria empresa
- Configura branding
- Aprova/rejeita anúncios (se configurado)
- Vê estatísticas da empresa

### User (company_role = 'user')
- Cria e gerencia próprios anúncios
- Vê apenas dados da própria empresa

## 🎨 Branding Dinâmico

O sistema aplica automaticamente:

- **Logo:** `company.logo_url` no header
- **Cores:** CSS variables `--primary-color` e `--secondary-color`
- **Título:** `document.title = company.name`
- **WhatsApp:** Botão flutuante com `company.whatsapp`
- **YouTube:** Link no menu com `company.youtube_url`
- **Footer:** Nome da empresa

## 🧪 Testando

### Teste Local com Múltiplos Domínios

1. **Editar hosts** (Windows: `C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1    empresa1.local
127.0.0.1    empresa2.local
```

2. **Adicionar domínios no banco:**
```sql
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES 
  ('uuid-empresa-1', 'empresa1.local', true, true),
  ('uuid-empresa-2', 'empresa2.local', true, true);
```

3. **Acessar:**
```
http://empresa1.local:5173
http://empresa2.local:5173
```

## 📚 Documentação Completa

- **Arquitetura:** `docs/MULTI_EMPRESA_ARQUITETURA.md`
- **Implementação:** `docs/GUIA_IMPLEMENTACAO.md`
- **Migration SQL:** `sql/20251020_multi_empresa.sql`

## ⚠️ Importante

1. **Backup:** Sempre faça backup antes de executar a migration
2. **Testes:** Teste em ambiente de desenvolvimento primeiro
3. **RLS:** As policies garantem isolamento, mas teste bem
4. **DNS:** Propagação pode levar até 48h
5. **Cache:** Limpe cache do navegador ao testar domínios

## 🆘 Troubleshooting

### "Empresa não encontrada"
- Verificar se domínio está cadastrado e verificado
- Verificar se `is_verified = true`

### Usuário não vê seus imóveis
- Verificar se `company_id` do usuário corresponde aos imóveis
- Verificar RLS policies

### Erro ao criar imóvel
- Verificar se `company_id` está sendo incluído no insert
- Verificar se usuário tem `company_id` definido

Ver mais em `docs/GUIA_IMPLEMENTACAO.md` seção Troubleshooting

## 📞 Suporte

Para implementação completa ou dúvidas:
1. Consulte `docs/GUIA_IMPLEMENTACAO.md`
2. Revise `docs/MULTI_EMPRESA_ARQUITETURA.md`
3. Teste queries SQL no Supabase SQL Editor
4. Verifique logs do navegador (F12 > Console)

---

**Status:** ✅ Arquitetura pronta | ⏳ Implementação pendente

**Próximo passo:** Executar migration SQL e atualizar páginas restantes
