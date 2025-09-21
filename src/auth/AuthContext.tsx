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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Carrega sessão atual
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Observa mudanças de auth
    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      sess: Session | null,
    ) => {
      setSession(sess)
      setUser(sess?.user ?? null)
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

  const value = useMemo<AuthContextValue>(() => ({ user, session, loading, signInWithPassword, signUp, signOut }), [user, session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
