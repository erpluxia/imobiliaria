# 🔍 Debug: Detecção de Domínio

## 1. Abrir Console no Navegador

Acesse `https://adjaimobiliaria.com.br` e abra o console (F12).

## 2. Executar Scripts de Debug

### A. Verificar Domínio Detectado

```javascript
console.log('Hostname:', window.location.hostname)
// Deve mostrar: adjaimobiliaria.com.br
```

### B. Verificar Cache

```javascript
// Ver cache atual
const cache = localStorage.getItem('current_company')
console.log('Cache:', cache ? JSON.parse(cache) : 'Vazio')

// Limpar cache
localStorage.removeItem('current_company')
console.log('Cache limpo! Recarregue a página.')
```

### C. Testar Query Manual no Supabase

```javascript
// Importar supabase (já está disponível globalmente)
const { createClient } = window.supabase || {}

// Ou usar o que já está importado
const supabase = window.supabase

// Testar query
const hostname = window.location.hostname
console.log('Buscando domínio:', hostname)

const { data, error } = await supabase
  .from('company_domains')
  .select(`
    domain,
    is_verified,
    company_id,
    companies (*)
  `)
  .eq('domain', hostname)
  .eq('is_verified', true)
  .single()

console.log('Resultado:', data)
console.log('Erro:', error)
```

### D. Testar Query Sem Filtro

```javascript
// Ver TODOS os domínios cadastrados
const { data: allDomains } = await supabase
  .from('company_domains')
  .select('*')

console.log('Todos os domínios:', allDomains)
```

## 3. Verificações no Banco de Dados

Execute no SQL Editor do Supabase:

```sql
-- Ver domínio específico
SELECT 
  cd.*,
  c.name as empresa_nome,
  c.is_active as empresa_ativa
FROM company_domains cd
JOIN companies c ON c.id = cd.company_id
WHERE cd.domain = 'adjaimobiliaria.com.br';

-- Ver se RLS está bloqueando
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('company_domains', 'companies');

-- Ver policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('company_domains', 'companies');
```

## 4. Possíveis Problemas

### A. RLS (Row Level Security) Bloqueando

Se RLS estiver ativo e não houver policy pública:

```sql
-- Desabilitar RLS temporariamente (APENAS PARA TESTE)
ALTER TABLE company_domains DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Depois de testar, REABILITAR:
ALTER TABLE company_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
```

### B. Criar Policy Pública

```sql
-- Policy para permitir SELECT público em company_domains
CREATE POLICY "public_read_company_domains"
ON company_domains FOR SELECT
TO public
USING (true);

-- Policy para permitir SELECT público em companies
CREATE POLICY "public_read_companies"
ON companies FOR SELECT
TO public
USING (true);
```

### C. Domínio com Caracteres Especiais

Verificar se não há espaços ou caracteres invisíveis:

```sql
-- Ver exatamente o que está salvo
SELECT 
  domain,
  length(domain) as tamanho,
  encode(domain::bytea, 'hex') as hex
FROM company_domains
WHERE domain LIKE '%adjaimobiliaria%';
```

## 5. Solução Rápida

Se nada funcionar, recrie o domínio:

```sql
-- Deletar domínio antigo
DELETE FROM company_domains 
WHERE domain = 'adjaimobiliaria.com.br';

-- Inserir novamente
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES (
  (SELECT id FROM companies WHERE slug = 'adjaimobi'),
  'adjaimobiliaria.com.br',
  true,
  true
);
```

## 6. Verificar Variáveis de Ambiente

Na Vercel, confirmar que as variáveis estão corretas:

```
VITE_SUPABASE_URL=https://uxhzuxdribiffjxjtyle.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

## 7. Forçar Rebuild

```bash
# Local
npm run build

# Vercel
# Settings → Deployments → Redeploy
```
