import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCompany } from '../contexts/CompanyContext'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithPassword, signOut } = useAuth()
  const { company } = useCompany()
  const [allowSignups, setAllowSignups] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('allow_signups')
          .eq('id', 1)
          .single()
        if (error) throw error
        if (active) setAllowSignups(Boolean(data?.allow_signups))
      } catch (_) {
        if (active) setAllowSignups(false)
      }
    }
    loadSettings()
    return () => { active = false }
  }, [])

  // Verificar se há erro de domínio na URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('error') === 'domain_mismatch') {
      setSubmitError(`Você foi desconectado porque este domínio não corresponde à sua imobiliária. Por favor, acesse o domínio correto.`)
    }
  }, [location.search])

  function validate() {
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Informe seu e-mail'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'E-mail inválido'

    if (!password) next.password = 'Informe sua senha'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)
    
    const { error } = await signInWithPassword({ email, password })
    
    if (error) {
      setSubmitting(false)
      setSubmitError(error)
      return
    }

    // Validar se o usuário pertence à empresa do domínio atual
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id, role')
          .eq('id', user.id)
          .single()

        // Super admins podem acessar qualquer domínio
        if (profile?.role === 'super_admin') {
          const params = new URLSearchParams(location.search)
          const next = params.get('next') || '/'
          navigate(next)
          return
        }

        // Verificar se o company_id do usuário corresponde ao domínio
        if (company && profile?.company_id !== company.id) {
          await signOut()
          setSubmitError(`Este usuário não tem permissão para acessar ${company.name}. Por favor, acesse o domínio correto da sua imobiliária.`)
          setSubmitting(false)
          return
        }
      }

      const params = new URLSearchParams(location.search)
      const next = params.get('next') || '/'
      navigate(next)
    } catch (err: any) {
      await signOut()
      setSubmitError('Erro ao validar acesso. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Entrar</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="seu@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-sky-600 text-white rounded-md px-4 py-2 font-medium hover:bg-sky-700 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>

        {submitError && <p className="text-center text-sm text-red-600 mt-2">{submitError}</p>}
        </form>

        <div className="text-center text-sm mt-6">
          <button className="text-sky-700 hover:underline" type="button" onClick={() => alert('Em breve: fluxo de recuperação de senha')}>Esqueci minha senha</button>
        </div>

        {allowSignups && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Não possui uma conta?{' '}
            <Link to="/cadastro" className="text-sky-700 hover:underline">Cadastre-se aqui</Link>
          </p>
        )}
      </div>
    </div>
  )
}
