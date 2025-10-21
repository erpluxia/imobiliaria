import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithPassword: (params: { email: string; password: string }) => Promise<{ error?: string }>
  signUp: (params: { email: string; password: string; fullName?: string; phone?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  // extras
  profile: { role?: 'admin' | 'user' | 'super_admin'; status?: 'active' | 'blocked'; full_name?: string | null; phone?: string | null } | null
  isAdmin: boolean
  isSuperAdmin: boolean
  isBlocked: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ role?: 'admin' | 'user' | 'super_admin'; status?: 'active' | 'blocked'; full_name?: string | null; phone?: string | null } | null>(null)

  useEffect(() => {
    let mounted = true

    // Carrega sessão atual
    supabase.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      // carregar profile se logado
      if (data.session?.user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role, status, full_name, phone')
          .eq('id', data.session.user.id)
          .maybeSingle()
        if (mounted) setProfile(prof ?? null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    // Observa mudanças de auth
    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      sess: Session | null,
    ) => {
      setSession(sess)
      setUser(sess?.user ?? null)
      // quando sessão muda, recarrega profile
      if (!sess?.user?.id) {
        setProfile(null)
      } else {
        supabase
          .from('profiles')
          .select('role, status, full_name, phone')
          .eq('id', sess.user.id)
          .maybeSingle()
          .then(({ data }) => setProfile(data ?? null))
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signInWithPassword(params: { email: string; password: string }) {
    const { error } = await supabase.auth.signInWithPassword(params)
    if (error) return { error: error.message }
    return {}
  }

  async function signUp(params: { email: string; password: string; fullName?: string; phone?: string }) {
    // Verifica feature flag de cadastro
    try {
      const { data: settings, error: setErr } = await supabase
        .from('app_settings')
        .select('allow_signups')
        .eq('id', 1)
        .single()
      if (setErr) {
        // se tabela/flag não existir, por segurança bloqueia
        return { error: 'Cadastros temporariamente desativados.' }
      }
      if (!settings?.allow_signups) {
        return { error: 'Cadastros desativados. Solicite acesso ao administrador.' }
      }
    } catch (_) {
      return { error: 'Cadastros temporariamente desativados.' }
    }

    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName ?? null,
          phone: params.phone ?? null,
        },
        emailRedirectTo: window.location.origin + '/login',
      },
    })
    if (error) return { error: error.message }

    // Preenche/garante perfil na tabela public.profiles
    try {
      const userId = data.user?.id
      if (userId) {
        await supabase
          .from('profiles')
          .upsert({ id: userId, full_name: params.fullName ?? null, phone: (params.phone ?? '').replace(/\D+/g, '') || null }, { onConflict: 'id' })
      }
    } catch (_) {
      // Silencioso: em caso de double-write com trigger, ignorar
    }
    return {}
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isAdmin = (profile?.role ?? 'user') === 'admin'
  const isSuperAdmin = (profile?.role ?? 'user') === 'super_admin'
  const isBlocked = (profile?.status ?? 'active') === 'blocked'

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    signInWithPassword,
    signUp,
    signOut,
    profile,
    isAdmin,
    isSuperAdmin,
    isBlocked,
  }), [user, session, loading, profile, isAdmin, isSuperAdmin, isBlocked])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
