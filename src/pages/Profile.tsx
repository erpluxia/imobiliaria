import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)

  function normalizePhone(v: string) {
    return v.replace(/\D+/g, '')
  }

  function isValidBRPhone(digits: string) {
    // Aceita 10 (fixo com DDD) ou 11 (celular com DDD). Ex.: 1132654321 ou 11912345678
    return digits.length === 10 || digits.length === 11
  }

  function formatBR(digits: string) {
    // Formatação simples (11 dígitos): (11) 91234-5678 | (10 dígitos): (11) 3265-4321
    if (digits.length === 11) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
    }
    if (digits.length === 10) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
    }
    return digits
  }

  useEffect(() => {
    let active = true
    async function load() {
      if (!user) return
      setLoading(true)
      setError(null)
      setSuccess(null)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single()
        if (error) throw error
        if (active && data) {
          setFullName(data.full_name ?? '')
          setPhone(data.phone ?? '')
        }
      } catch (e: any) {
        if (active) setError(e.message ?? 'Erro ao carregar perfil')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const digits = normalizePhone(phone)
      if (!isValidBRPhone(digits)) {
        setPhoneError('Informe um telefone válido com DDD (ex.: 11912345678)')
        setSaving(false)
        return
      }
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName || null, phone: digits || null })
        .eq('id', user.id)
      if (error) throw error
      setSuccess('Perfil atualizado com sucesso!')
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
      </section>
    )
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Meu Perfil</h1>
      <p className="text-gray-600 mt-1 text-sm">Atualize seu nome e telefone. O telefone é usado para receber mensagens pelo WhatsApp.</p>

      {loading ? (
        <div className="mt-6 text-gray-600">Carregando...</div>
      ) : (
        <form onSubmit={onSave} className="mt-6 bg-white border rounded-2xl p-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Nome completo</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Telefone (WhatsApp)</label>
            <input
              value={formatBR(normalizePhone(phone))}
              onChange={(e) => {
                const digits = normalizePhone(e.target.value)
                setPhone(digits)
                setPhoneError(isValidBRPhone(digits) ? null : 'Informe um telefone válido com DDD (ex.: 11912345678)')
              }}
              className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="(11) 91234-5678"
            />
            <p className="text-xs text-gray-500 mt-1">Informe com DDD. Ex.: 11912345678</p>
            {phoneError && <p className="text-xs text-red-600 mt-1">{phoneError}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving || !!phoneError} className={`bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 ${(saving || !!phoneError) ? 'opacity-70 cursor-not-allowed' : ''}`}>{saving ? 'Salvando...' : 'Salvar perfil'}</button>
            {error && <span className="text-sm text-red-600">{error}</span>}
            {success && <span className="text-sm text-green-700">{success}</span>}
          </div>
        </form>
      )}
    </section>
  )
}
