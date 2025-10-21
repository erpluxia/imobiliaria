# Configurar Storage para Logos e Favicons

## 📦 Criar Bucket no Supabase

### 1. Acessar Storage

No Supabase Dashboard:
1. Ir em **Storage**
2. Clicar em **New bucket**

### 2. Criar Bucket `company-assets`

**Configurações:**
- **Name:** `company-assets`
- **Public bucket:** ✅ Sim (marcar)
- **File size limit:** 5 MB
- **Allowed MIME types:** Deixar vazio (permite todos)

### 3. Configurar Policies (RLS)

Execute no SQL Editor:

```sql
-- Policy: Qualquer pessoa pode ver os assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

-- Policy: Apenas super admins podem fazer upload
CREATE POLICY "Super Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-assets'
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'super_admin'
  )
);

-- Policy: Apenas super admins podem deletar
CREATE POLICY "Super Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-assets'
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'super_admin'
  )
);
```

## ✅ Pronto!

Agora você pode fazer upload de logos e favicons ao criar empresas.

## 📁 Estrutura de Pastas

O sistema organiza automaticamente:

```
company-assets/
├── companies/
│   ├── logos/
│   │   ├── uuid1.png
│   │   ├── uuid2.png
│   │   └── uuid3.png
│   └── favicons/
│       ├── uuid1.ico
│       ├── uuid2.png
│       └── uuid3.png
```

## 🖼️ Formatos Recomendados

### Logo
- **Formato:** PNG (transparente)
- **Tamanho:** 500x200px
- **Peso:** < 500KB

### Favicon
- **Formato:** ICO ou PNG
- **Tamanho:** 32x32px ou 64x64px
- **Peso:** < 100KB

## 🧪 Testar

1. Ir em `/super-admin/companies/create`
2. Fazer upload de logo e favicon
3. Criar empresa
4. Verificar se as imagens aparecem na lista de empresas
