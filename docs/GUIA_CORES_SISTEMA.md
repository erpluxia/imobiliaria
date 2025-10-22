# 🎨 Guia de Cores do Sistema

Este documento descreve onde as cores primária e secundária de cada empresa são aplicadas no sistema.

## 📊 Estrutura de Cores

Cada empresa possui duas cores principais configuráveis:

- **Cor Primária** (`primary_color`): Cor principal da marca, usada em elementos de destaque
- **Cor Secundária** (`secondary_color`): Cor de suporte, usada em backgrounds

## 🎯 Uso da Cor Primária

### Header / Navegação
- ✅ Links de navegação **ativos** (Home, Resultados, Lançamentos, Canal)
- ✅ Links de navegação em **hover**
- ✅ Botão "Entrar" (borda e texto)
- ✅ Botão "Admin" (borda e texto)

### Botões Principais
- ✅ Botão "Anunciar imóvel" (background)
- ✅ Botão "Buscar" na barra de pesquisa (background)
- ✅ Botão "Mais detalhes" nos cards de imóveis (background)

### Cards de Imóveis
- ✅ Badge "Aluguel" (background)
- ✅ Ícone de favoritar ♡ (hover)

### Links e Textos
- ✅ Link "Ver todos" na seção de destaques
- ✅ Link "Erpluxia" no footer

### Formulários
- ✅ Borda de foco (focus ring) dos campos de busca
- ✅ Borda de foco em inputs de texto

## 🎯 Uso da Cor Secundária

### Estrutura
- ✅ Background do **Header** (cabeçalho)
- ✅ Background do **Footer** (rodapé)
- ⏳ Disponível para customizações futuras

## 🔧 Implementação Técnica

### CSS Variables
As cores são aplicadas através de CSS variables definidas em `src/index.css`:

```css
:root {
  --primary-color: #D4AF37;  /* Atualizado dinamicamente */
  --secondary-color: #000000; /* Atualizado dinamicamente */
}
```

### Classes Utilitárias
Classes CSS customizadas disponíveis:

- `.bg-primary` - Background com cor primária
- `.text-primary` - Texto com cor primária
- `.border-primary` - Borda com cor primária
- `.hover:bg-primary` - Background primário no hover
- `.hover:text-primary` - Texto primário no hover
- `.hover:bg-primary-dark` - Background primário mais escuro no hover

### Atualização Dinâmica
As cores são atualizadas automaticamente quando a empresa é detectada:

```typescript
// src/lib/companyDetection.ts - função applyBranding()
document.documentElement.style.setProperty('--primary-color', company.primary_color)
document.documentElement.style.setProperty('--secondary-color', company.secondary_color)
```

## 📍 Mapa de Arquivos

### Arquivos que usam cores dinâmicas:

1. **src/App.tsx**
   - Header completo
   - Navegação
   - Botões de ação
   - Footer

2. **src/pages/Home.tsx**
   - Link "Ver todos"

3. **src/components/ListingCard.tsx**
   - Badge "Aluguel"
   - Botão "Mais detalhes"
   - Ícone favoritar

4. **src/components/SearchBar.tsx**
   - Focus ring dos inputs
   - Botão "Buscar"

5. **src/index.css**
   - Definição das CSS variables
   - Classes utilitárias

## 🎨 Exemplos de Cores por Empresa

### AdjaImobi
- **Primária:** `#d4af37` (Dourado)
- **Secundária:** `#000000` (Preto)

### mkmaisimoveis
- **Primária:** `#ffbe59` (Laranja/Amarelo)
- **Secundária:** `#2c3d50` (Azul escuro)

### Imobi jEAN
- **Primária:** `#d4af37` (Dourado)
- **Secundária:** `#000000` (Preto)

## 🚀 Como Adicionar Novas Cores

Para adicionar mais cores customizáveis:

1. **Adicionar coluna no banco:**
   ```sql
   ALTER TABLE companies ADD COLUMN accent_color TEXT DEFAULT '#FF5733';
   ```

2. **Atualizar CSS variables:**
   ```typescript
   // src/lib/companyDetection.ts
   document.documentElement.style.setProperty('--accent-color', company.accent_color)
   ```

3. **Criar classes utilitárias:**
   ```css
   /* src/index.css */
   .bg-accent { background-color: var(--accent-color); }
   .text-accent { color: var(--accent-color); }
   ```

4. **Adicionar no formulário:**
   ```tsx
   // src/pages/super-admin/EditCompany.tsx
   <input type="color" name="accent_color" defaultValue={company.accent_color} />
   ```

## 📝 Notas Importantes

- ⚠️ **Contraste:** Sempre verifique o contraste entre texto e background para acessibilidade
- ⚠️ **Cores claras:** Se usar cor primária clara, ajuste a cor do texto para preto
- ⚠️ **Consistência:** Mantenha o uso das cores consistente em todo o sistema
- ✅ **Preview:** Use a página de edição de empresa para visualizar as cores antes de salvar

## 🔍 Testando Cores

Para testar as cores de uma empresa:

1. Acesse: `/super-admin/companies/{id}/edit`
2. Altere as cores usando os color pickers
3. Veja o preview em tempo real na seção "Preview de Elementos"
4. Salve e acesse o domínio da empresa para ver as mudanças aplicadas

---

**Última atualização:** 22/10/2025
**Versão:** 1.0
