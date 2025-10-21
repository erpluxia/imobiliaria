import { supabase } from './supabaseClient'
import type { Company, CompanyDomain } from '../types/company'

const COMPANY_CACHE_KEY = 'current_company'
const CACHE_DURATION = 1000 * 60 * 60 // 1 hora

interface CachedCompany {
  company: Company
  timestamp: number
}

/**
 * Detecta a empresa baseado no domínio atual
 */
export async function detectCompanyByDomain(): Promise<Company | null> {
  try {
    // Verificar cache primeiro
    const cached = getCachedCompany()
    if (cached) {
      return cached
    }

    const hostname = window.location.hostname
    
    // Buscar empresa pelo domínio
    const { data, error } = await supabase
      .from('company_domains')
      .select(`
        company_id,
        companies (*)
      `)
      .eq('domain', hostname)
      .eq('is_verified', true)
      .single()

    if (error) {
      console.warn('[Company Detection] Erro ao buscar empresa:', error.message)
      return null
    }

    if (!data || !data.companies) {
      console.warn('[Company Detection] Nenhuma empresa encontrada para o domínio:', hostname)
      return null
    }

    const company = Array.isArray(data.companies) ? data.companies[0] : data.companies
    
    // Cachear resultado
    cacheCompany(company)
    
    return company
  } catch (error) {
    console.error('[Company Detection] Erro inesperado:', error)
    return null
  }
}

/**
 * Obtém empresa do cache se ainda válida
 */
function getCachedCompany(): Company | null {
  try {
    const cached = localStorage.getItem(COMPANY_CACHE_KEY)
    if (!cached) return null

    const parsed: CachedCompany = JSON.parse(cached)
    const now = Date.now()

    // Verificar se cache ainda é válido
    if (now - parsed.timestamp < CACHE_DURATION) {
      return parsed.company
    }

    // Cache expirado
    localStorage.removeItem(COMPANY_CACHE_KEY)
    return null
  } catch {
    return null
  }
}

/**
 * Cacheia empresa no localStorage
 */
function cacheCompany(company: Company): void {
  try {
    const cached: CachedCompany = {
      company,
      timestamp: Date.now()
    }
    localStorage.setItem(COMPANY_CACHE_KEY, JSON.stringify(cached))
  } catch (error) {
    console.warn('[Company Detection] Erro ao cachear empresa:', error)
  }
}

/**
 * Limpa cache da empresa (útil ao trocar de domínio)
 */
export function clearCompanyCache(): void {
  localStorage.removeItem(COMPANY_CACHE_KEY)
}

/**
 * Aplica branding da empresa ao site
 */
export function applyBranding(company: Company): void {
  try {
    // Atualizar CSS variables
    document.documentElement.style.setProperty('--primary-color', company.primary_color)
    document.documentElement.style.setProperty('--secondary-color', company.secondary_color)
    
    // Atualizar título da página
    document.title = company.name
    
    // Atualizar meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', `Imóveis de ${company.name} - Encontre seu imóvel ideal`)
    }

    // Atualizar og:title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', company.name)

    // Atualizar og:description
    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', `Imóveis de ${company.name}`)

    // Atualizar favicon
    if (company.favicon_url) {
      let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }
      favicon.href = company.favicon_url
    }

  } catch (error) {
    console.error('[Company Detection] Erro ao aplicar branding:', error)
  }
}

/**
 * Busca todas as empresas (apenas para super admin)
 */
export async function getAllCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  if (error) {
    console.error('[Company] Erro ao buscar empresas:', error)
    return []
  }

  return data || []
}

/**
 * Busca domínios de uma empresa
 */
export async function getCompanyDomains(companyId: string): Promise<CompanyDomain[]> {
  const { data, error } = await supabase
    .from('company_domains')
    .select('*')
    .eq('company_id', companyId)
    .order('is_primary', { ascending: false })

  if (error) {
    console.error('[Company] Erro ao buscar domínios:', error)
    return []
  }

  return data || []
}

/**
 * Cria nova empresa (apenas super admin)
 */
export async function createCompany(company: Partial<Company>): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .single()

  if (error) {
    console.error('[Company] Erro ao criar empresa:', error)
    return null
  }

  return data
}

/**
 * Atualiza empresa (apenas super admin)
 */
export async function updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[Company] Erro ao atualizar empresa:', error)
    return null
  }

  return data
}

/**
 * Adiciona domínio a uma empresa
 */
export async function addCompanyDomain(
  companyId: string,
  domain: string,
  isPrimary: boolean = false
): Promise<CompanyDomain | null> {
  const { data, error } = await supabase
    .from('company_domains')
    .insert({
      company_id: companyId,
      domain,
      is_primary: isPrimary,
      is_verified: false
    })
    .select()
    .single()

  if (error) {
    console.error('[Company] Erro ao adicionar domínio:', error)
    return null
  }

  return data
}

/**
 * Remove domínio de uma empresa
 */
export async function removeCompanyDomain(domainId: string): Promise<boolean> {
  const { error } = await supabase
    .from('company_domains')
    .delete()
    .eq('id', domainId)

  if (error) {
    console.error('[Company] Erro ao remover domínio:', error)
    return false
  }

  return true
}

/**
 * Marca domínio como verificado
 */
export async function verifyDomain(domainId: string): Promise<boolean> {
  const { error } = await supabase
    .from('company_domains')
    .update({ is_verified: true })
    .eq('id', domainId)

  if (error) {
    console.error('[Company] Erro ao verificar domínio:', error)
    return false
  }

  return true
}
