import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { detectCompanyByDomain, applyBranding, clearCompanyCache } from '../lib/companyDetection'
import type { Company } from '../types/company'

interface CompanyContextType {
  company: Company | null
  loading: boolean
  error: string | null
  refetchCompany: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  loading: true,
  error: null,
  refetchCompany: async () => {}
})

interface CompanyProviderProps {
  children: ReactNode
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCompany = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const detected = await detectCompanyByDomain()
      
      if (!detected) {
        setError('Empresa não encontrada para este domínio')
        setCompany(null)
      } else {
        setCompany(detected)
        applyBranding(detected)
      }
    } catch (err) {
      console.error('[CompanyContext] Erro ao carregar empresa:', err)
      setError('Erro ao carregar informações da empresa')
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  const refetchCompany = async () => {
    clearCompanyCache()
    await loadCompany()
  }

  useEffect(() => {
    loadCompany()
  }, [])

  // Monitorar mudanças de domínio (útil em desenvolvimento)
  useEffect(() => {
    const handleLocationChange = () => {
      const currentHostname = window.location.hostname
      const cachedHostname = localStorage.getItem('last_hostname')
      
      if (cachedHostname && cachedHostname !== currentHostname) {
        clearCompanyCache()
        loadCompany()
      }
      
      localStorage.setItem('last_hostname', currentHostname)
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  return (
    <CompanyContext.Provider value={{ company, loading, error, refetchCompany }}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de CompanyProvider')
  }
  return context
}
