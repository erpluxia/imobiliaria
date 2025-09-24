import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CreateUser() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'user'|'admin'>('user')
  const [status, setStatus] = useState<'active'|'blocked'>('active')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.functions.invoke('admin-create-user', {
        body: { email, password, fullName, phone, role, status },
      })
      if (error) throw new Error(error.message || 'Falha ao criar usuário')
      setEmail('')
      setPassword('')
      setFullName('')
      setPhone('')
      setRole('user')
      setStatus('active')
      // Redireciona para a lista com aviso de sucesso
      navigate('/admin/users?created=1', { replace: true })
    } catch (e: any) {
      setError(e.message ?? 'Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Admin · Criar usuário</h1>
      <form onSubmit={onSubmit} className="bg-white border rounded-2xl p-5 grid gap-4">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="email@exemplo.com" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Senha</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Nome completo</label>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nome" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Telefone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="(00) 90000-0000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value as any)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="active">active</option>
              <option value="blocked">blocked</option>
            </select>
          </div>
        </div>
        <div>
          <button type="submit" disabled={loading} className={`bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>{loading ? 'Criando...' : 'Criar usuário'}</button>
        </div>
      </form>
      <p className="mt-3 text-xs text-gray-500">Esta ação chama a Edge Function <code>admin-create-user</code>. Certifique-se de tê-la implantado no Supabase e configurado as variáveis de ambiente.</p>
    </section>
  )
}
