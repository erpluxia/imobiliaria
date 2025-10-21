-- Verificar domínios duplicados
SELECT 
  domain,
  COUNT(*) as quantidade,
  array_agg(id) as ids
FROM company_domains
GROUP BY domain
HAVING COUNT(*) > 1;

-- Ver todos os domínios de adjaimobiliaria.com.br
SELECT 
  cd.id,
  cd.domain,
  cd.is_primary,
  cd.is_verified,
  cd.created_at,
  c.name as empresa
FROM company_domains cd
LEFT JOIN companies c ON c.id = cd.company_id
WHERE cd.domain = 'adjaimobiliaria.com.br'
ORDER BY cd.created_at;

-- Se houver duplicados, deletar os mais antigos (manter apenas o mais recente)
-- CUIDADO: Só execute se confirmar que há duplicados!
/*
DELETE FROM company_domains
WHERE id IN (
  SELECT id 
  FROM company_domains
  WHERE domain = 'adjaimobiliaria.com.br'
  ORDER BY created_at ASC
  LIMIT (
    SELECT COUNT(*) - 1 
    FROM company_domains 
    WHERE domain = 'adjaimobiliaria.com.br'
  )
);
*/
