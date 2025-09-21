import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Ajuda a diagnosticar ambientes sem variáveis definidas
  // Evite logar a chave; apenas informe ausência
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Variáveis não configuradas: VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
