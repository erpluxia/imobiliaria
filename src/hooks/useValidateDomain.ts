import { useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useCompany } from '../contexts/CompanyContext'
import { useNavigate } from 'react-router-dom'

/**
 * Hook para validar se o usuário logado pertence à empresa do domínio atual.
 * Se não pertencer, faz logout automático e redireciona para login.
 */
export function useValidateDomain() {
  const { profile, user, signOut, isSuperAdmin } = useAuth()
  const { company } = useCompany()
  const navigate = useNavigate()

  useEffect(() => {
    // Aguardar carregamento
    if (!user || !profile || !company) return

    // Super admins podem acessar qualquer domínio
    if (isSuperAdmin) return

    // Validar se o company_id do usuário corresponde ao domínio
    if (profile.company_id !== company.id) {
      console.warn('[Domain Validation] Usuário não pertence a esta empresa. Fazendo logout...')
      
      signOut().then(() => {
        navigate('/login?error=domain_mismatch', { replace: true })
      })
    }
  }, [user, profile, company, isSuperAdmin, signOut, navigate])
}
