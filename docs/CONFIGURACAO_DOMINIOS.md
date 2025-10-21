# Configuração de Domínios - Sistema Multi-Empresa

## 📋 Visão Geral

Este guia explica como adicionar e configurar domínios personalizados para cada empresa no sistema.

## 🎯 Pré-requisitos

- ✅ Migration SQL executada
- ✅ Empresa criada no banco de dados
- ✅ Acesso ao painel DNS do domínio

## 📝 Passo a Passo

### 1. Adicionar Domínio no Banco de Dados

#### Via SQL (Supabase SQL Editor)

```sql
-- Adicionar domínio para uma empresa
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES (
  'uuid-da-empresa',  -- ID da empresa (consultar tabela companies)
  'meudominio.com.br', -- Domínio completo
  true,                -- true se for o domínio principal
  false                -- Marcar como true após verificar DNS
);
```

#### Consultar ID da Empresa

```sql
-- Listar todas as empresas
SELECT id, name, slug FROM companies;

-- Buscar empresa específica
SELECT id, name, slug FROM companies WHERE slug = 'nome-da-empresa';
```

### 2. Configurar DNS

Você tem duas opções para apontar o domínio:

#### Opção A: CNAME (Recomendado)

Mais flexível, permite mudanças de IP sem reconfigurar DNS.

**No painel DNS do domínio:**
```
Tipo: CNAME
Nome: @ (ou deixe vazio para domínio raiz)
Valor: seu-servidor.com.br
TTL: 3600 (1 hora)
```

**Para subdomínio (ex: www):**
```
Tipo: CNAME
Nome: www
Valor: seu-servidor.com.br
TTL: 3600
```

#### Opção B: A Record

Aponta diretamente para o IP do servidor.

**No painel DNS do domínio:**
```
Tipo: A
Nome: @ (ou deixe vazio)
Valor: 123.456.789.0 (IP do servidor)
TTL: 3600
```

### 3. Aguardar Propagação DNS

- **Tempo médio:** 1-4 horas
- **Tempo máximo:** até 48 horas
- **Verificar propagação:** https://dnschecker.org

### 4. Verificar Domínio

Após propagação DNS, marcar domínio como verificado:

```sql
-- Marcar domínio como verificado
UPDATE company_domains
SET is_verified = true
WHERE domain = 'meudominio.com.br';
```

### 5. Testar Acesso

Acessar o domínio no navegador:
```
https://meudominio.com.br
```

O sistema deve:
- ✅ Detectar a empresa automaticamente
- ✅ Aplicar logo e cores da empresa
- ✅ Mostrar apenas imóveis da empresa
- ✅ Usar WhatsApp e contatos da empresa

## 🔧 Configurações Avançadas

### Múltiplos Domínios para Mesma Empresa

Uma empresa pode ter vários domínios (ex: com www e sem www):

```sql
-- Domínio principal
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-empresa', 'meudominio.com.br', true, true);

-- Domínio alternativo (www)
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-empresa', 'www.meudominio.com.br', false, true);
```

### Subdomínios

```sql
-- Subdomínio para empresa
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-empresa', 'imoveis.meudominio.com.br', true, true);
```

**Configuração DNS para subdomínio:**
```
Tipo: CNAME
Nome: imoveis
Valor: seu-servidor.com.br
TTL: 3600
```

### Domínio de Desenvolvimento (localhost)

Para testes locais:

```sql
-- Adicionar localhost para testes
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-empresa', 'localhost:5173', true, true);

-- Ou com porta diferente
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-empresa-2', 'localhost:5174', true, true);
```

## 🧪 Testando Localmente com Múltiplos Domínios

### Windows

Editar arquivo `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1    empresa1.local
127.0.0.1    empresa2.local
127.0.0.1    empresa3.local
```

Adicionar no banco:
```sql
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES 
  ('uuid-empresa-1', 'empresa1.local:5173', true, true),
  ('uuid-empresa-2', 'empresa2.local:5173', true, true),
  ('uuid-empresa-3', 'empresa3.local:5173', true, true);
```

Acessar:
- `http://empresa1.local:5173`
- `http://empresa2.local:5173`
- `http://empresa3.local:5173`

### Linux/Mac

Editar arquivo `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

Adicionar:
```
127.0.0.1    empresa1.local
127.0.0.1    empresa2.local
```

## 🔍 Verificação e Troubleshooting

### Verificar se Domínio Está Configurado

```sql
-- Listar todos os domínios
SELECT 
  cd.domain,
  cd.is_primary,
  cd.is_verified,
  c.name as company_name,
  c.slug
FROM company_domains cd
JOIN companies c ON c.id = cd.company_id
ORDER BY c.name, cd.is_primary DESC;
```

### Verificar Propagação DNS

**Via Terminal (Windows):**
```cmd
nslookup meudominio.com.br
```

**Via Terminal (Linux/Mac):**
```bash
dig meudominio.com.br
```

**Via Web:**
- https://dnschecker.org
- https://www.whatsmydns.net

### Problemas Comuns

#### 1. "Empresa não encontrada"

**Causa:** Domínio não está cadastrado ou não está verificado

**Solução:**
```sql
-- Verificar se domínio existe
SELECT * FROM company_domains WHERE domain = 'meudominio.com.br';

-- Se não existe, adicionar
INSERT INTO company_domains (company_id, domain, is_primary, is_verified)
VALUES ('uuid-empresa', 'meudominio.com.br', true, true);

-- Se existe mas não está verificado
UPDATE company_domains
SET is_verified = true
WHERE domain = 'meudominio.com.br';
```

#### 2. DNS não propaga

**Causas possíveis:**
- Configuração DNS incorreta
- TTL muito alto (cache DNS)
- Propagação ainda em andamento

**Soluções:**
1. Verificar configuração no painel DNS
2. Reduzir TTL para 300 (5 minutos)
3. Limpar cache DNS local:
   - Windows: `ipconfig /flushdns`
   - Linux: `sudo systemd-resolve --flush-caches`
   - Mac: `sudo dscacheutil -flushcache`

#### 3. Mostra empresa errada

**Causa:** Múltiplos domínios apontando para mesma empresa ou cache

**Solução:**
```sql
-- Verificar qual empresa está associada ao domínio
SELECT c.name, cd.domain, cd.is_verified
FROM company_domains cd
JOIN companies c ON c.id = cd.company_id
WHERE cd.domain = 'meudominio.com.br';
```

Limpar cache do navegador (Ctrl+Shift+Delete)

#### 4. SSL/HTTPS não funciona

**Causa:** Certificado SSL não configurado para o domínio

**Solução:**
- Configurar certificado SSL no servidor (Let's Encrypt, Cloudflare, etc.)
- Verificar se domínio está incluído no certificado

## 📊 Consultas Úteis

### Listar Domínios por Empresa

```sql
SELECT 
  c.name as empresa,
  cd.domain,
  cd.is_primary as principal,
  cd.is_verified as verificado,
  cd.created_at as criado_em
FROM companies c
LEFT JOIN company_domains cd ON cd.company_id = c.id
ORDER BY c.name, cd.is_primary DESC;
```

### Contar Domínios por Empresa

```sql
SELECT 
  c.name as empresa,
  COUNT(cd.id) as total_dominios,
  COUNT(CASE WHEN cd.is_verified THEN 1 END) as verificados
FROM companies c
LEFT JOIN company_domains cd ON cd.company_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
```

### Domínios Não Verificados

```sql
SELECT 
  c.name as empresa,
  cd.domain,
  cd.created_at
FROM company_domains cd
JOIN companies c ON c.id = cd.company_id
WHERE cd.is_verified = false
ORDER BY cd.created_at DESC;
```

## 🚀 Próximos Passos

Após configurar domínios:

1. ✅ Testar acesso pelo domínio
2. ✅ Verificar branding (logo, cores)
3. ✅ Testar criação de imóveis
4. ✅ Verificar isolamento de dados
5. ✅ Configurar SSL/HTTPS
6. ✅ Treinar usuários da empresa

## 📞 Suporte

Para problemas na configuração:
1. Verificar logs do navegador (F12 > Console)
2. Verificar queries SQL no Supabase
3. Consultar documentação completa em `MULTI_EMPRESA_ARQUITETURA.md`
