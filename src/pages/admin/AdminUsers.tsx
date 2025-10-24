import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../auth/AuthContext'
import PageBreadcrumb from '../../../theme/src/components/common/PageBreadCrumb'
import ComponentCard from '../../../theme/src/components/common/ComponentCard'
import PageMeta from '../../../theme/src/components/common/PageMeta'

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: 'admin' | 'user'
  status: 'active' | 'blocked'
}

export default function AdminUsers() {
  const { profile, isSuperAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from('profiles')
          .select('id, full_name, phone, role, status')
        
        // Se não for super_admin, filtrar apenas usuários da mesma empresa
        if (!isSuperAdmin && profile?.company_id) {
          query = query.eq('company_id', profile.company_id)
        }
        
        const { data, error } = await query.order('full_name', { ascending: true })
        if (error) throw error
        if (active) setProfiles((data ?? []) as any)
      } catch (e: any) {
        if (active) setError(e.message ?? 'Erro ao carregar usuários')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [profile?.company_id, isSuperAdmin])

  async function updateRole(id: string, role: 'admin' | 'user') {
    setSavingId(id)
    try {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p))
    } catch (e: any) {
      alert(e.message ?? 'Erro ao atualizar role')
    } finally {
      setSavingId(null)
    }
  }

  async function updateStatus(id: string, status: 'active' | 'blocked') {
    setSavingId(id)
    try {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
      if (error) throw error
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    } catch (e: any) {
      alert(e.message ?? 'Erro ao atualizar status')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <PageMeta title="Lista de usuários" description="Gestão de usuários" />
      <PageBreadcrumb pageTitle="Lista de usuários" />
      {/* Notificação de sucesso ao criar */}
      <SuccessBanner />
      <div className="space-y-6">
        <div className="flex items-center justify-end mb-3">
          <Link to="/admin/users/create" className="inline-flex items-center h-9 border rounded-md px-3 bg-white hover:bg-gray-50">+ Criar usuário</Link>
        </div>
        <ComponentCard title="">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start">User</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start">Telefone</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start">Role</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start">Status</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr><td className="px-5 py-6 text-gray-600" colSpan={5}>Carregando...</td></tr>
                )}
                {error && !loading && (
                  <tr><td className="px-5 py-6 text-red-600" colSpan={5}>{error}</td></tr>
                )}
                {!loading && !error && profiles.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {(p.full_name||'U').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join('') || 'U'}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800">{p.full_name || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.phone || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">
                      <span className={`inline-flex px-2 py-1 rounded-full border text-xs ${p.role === 'admin' ? 'border-amber-600 text-amber-700 bg-amber-50' : 'border-gray-300 text-gray-700 bg-gray-50'}`}>{p.role}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <span className={`inline-flex px-2 py-1 rounded-full border text-xs ${p.status === 'active' ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-red-600 text-red-700 bg-red-50'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {p.role === 'user' ? (
                          <button disabled={savingId===p.id} onClick={() => updateRole(p.id, 'admin')} className="h-9 border rounded-md px-3 hover:bg-gray-100">Promover</button>
                        ) : (
                          <button disabled={savingId===p.id} onClick={() => updateRole(p.id, 'user')} className="h-9 border rounded-md px-3 hover:bg-gray-100">Remover admin</button>
                        )}
                        {p.status === 'active' ? (
                          <button disabled={savingId===p.id} onClick={() => updateStatus(p.id, 'blocked')} className="h-9 border rounded-md px-3 hover:bg-gray-100 text-red-700 border-red-300">Bloquear</button>
                        ) : (
                          <button disabled={savingId===p.id} onClick={() => updateStatus(p.id, 'active')} className="h-9 border rounded-md px-3 hover:bg-gray-100 text-emerald-700 border-emerald-300">Desbloquear</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && !error && profiles.length === 0 && (
                  <tr><td className="px-5 py-8 text-center text-gray-500" colSpan={5}>Nenhum usuário encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </section>
  )
}

function SuccessBanner() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (q.get('created') === '1') setVisible(true)
  }, [location.search])
  if (!visible) return null
  return (
    <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm flex items-center justify-between">
      <span>Usuário criado com sucesso.</span>
      <button onClick={() => setVisible(false)} className="text-emerald-800/70 hover:text-emerald-900">✕</button>
    </div>
  )
}
