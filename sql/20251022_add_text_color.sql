-- Adicionar coluna text_color na tabela companies
-- Data: 22/10/2025
-- Descrição: Adiciona campo para cor do texto customizável por empresa

-- Adicionar coluna text_color com valor padrão branco
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#FFFFFF';

-- Atualizar empresas existentes com cor de texto padrão
UPDATE public.companies 
SET text_color = '#FFFFFF' 
WHERE text_color IS NULL;

-- Comentário na coluna
COMMENT ON COLUMN public.companies.text_color IS 'Cor do texto usada no header e footer (hex color)';

-- Verificar resultado
SELECT id, name, primary_color, secondary_color, text_color 
FROM public.companies 
ORDER BY name;
