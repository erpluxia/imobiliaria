import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCompanyDomains, addCompanyDomain, removeCompanyDomain, verifyDomain } from '../../lib/companyDetection'
import type { Company, CompanyDomain } from '../../types/company'

export default function ManageDomains() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [domains, setDomains] = useState<CompanyDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  async function loadData() {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Buscar empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) throw companyError
      setCompany(companyData)

      // Buscar domínios
      const domainsData = await getCompanyDomains(id)
      setDomains(domainsData)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !newDomain.trim()) return

    setAdding(true)
    try {
      const domain = await addCompanyDomain(id, newDomain.trim(), isPrimary)
      if (domain) {
        setDomains([...domains, domain])
        setNewDomain('')
        setIsPrimary(false)
        setShowAddForm(false)
      } else {
        alert('Erro ao adicionar domínio')
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar domínio')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveDomain(domainId: string, domainName: string) {
    if (!confirm(`Tem certeza que deseja remover o domínio "${domainName}"?`)) return

    const success = await removeCompanyDomain(domainId)
    if (success) {
      setDomains(domains.filter(d => d.id !== domainId))
    } else {
      alert('Erro ao remover domínio')
    }
  }

  async function handleVerifyDomain(domainId: string) {
    const success = await verifyDomain(domainId)
    if (success) {
      setDomains(domains.map(d => 
        d.id === domainId ? { ...d, is_verified: true } : d
      ))
      alert('Domínio marcado como verificado!')
    } else {
      alert('Erro ao verificar domínio')
    }
  }

  async function handleSetPrimary(domainId: string, domainName: string) {
    if (!confirm(`Deseja tornar "${domainName}" o domínio principal?`)) return

    try {
      if (!id) return

      // 1. Remover primário de todos os domínios da empresa
      const { error: removeError } = await supabase
        .from('company_domains')
        .update({ is_primary: false })
        .eq('company_id', id)

      if (removeError) throw removeError

      // 2. Marcar o novo como primário
      const { error: setPrimaryError } = await supabase
        .from('company_domains')
        .update({ is_primary: true })
        .eq('id', domainId)

      if (setPrimaryError) throw setPrimaryError

      // 3. Atualizar estado local
      setDomains(domains.map(d => ({
        ...d,
        is_primary: d.id === domainId
      })))

      alert('Domínio principal atualizado!')
    } catch (err: any) {
      alert(err.message || 'Erro ao definir domínio principal')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Empresa não encontrada'}</p>
          <Link to="/super-admin/companies" className="text-red-600 hover:underline mt-2 inline-block">
            Voltar para empresas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/super-admin/companies" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Voltar para empresas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-gray-600 mt-1">Gerenciar domínios</p>
      </div>

      {/* Botão Adicionar */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Domínio'}
        </button>
      </div>

      {/* Formulário Adicionar */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Adicionar Novo Domínio</h2>
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Domínio *
              </label>
              <input
                type="text"
                id="domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="exemplo.com.br"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Não incluir http:// ou https://. Para localhost, use: localhost:5173
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                Marcar como domínio principal
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={adding}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {adding ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Domínios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domínio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Principal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domains.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <p className="mt-2 font-medium">Nenhum domínio configurado</p>
                    <p className="text-sm">Adicione um domínio para que a empresa possa ser acessada</p>
                  </div>
                </td>
              </tr>
            ) : (
              domains.map((domain) => (
                <tr key={domain.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {domain.is_verified ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Verificado
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Não verificado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {domain.is_primary ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Principal
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetPrimary(domain.id, domain.domain)}
                        className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      >
                        Tornar principal
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!domain.is_verified && (
                      <button
                        onClick={() => handleVerifyDomain(domain.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Verificar
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveDomain(domain.id, domain.domain)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Instruções */}
      <div className="mt-6 space-y-4">
        {/* Dica Domínio Principal */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">💡 Domínio Principal</h3>
          <p className="text-sm text-purple-800">
            Clique em <strong>"Tornar principal"</strong> para definir qual domínio será o principal da empresa. 
            Apenas um domínio pode ser principal por vez.
          </p>
        </div>

        {/* Instruções DNS */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Configuração DNS</h3>
          <p className="text-sm text-blue-800 mb-3">
            Para que o domínio funcione, configure no painel DNS:
          </p>
          <div className="bg-white rounded p-4 font-mono text-sm">
            <div className="grid grid-cols-3 gap-4 mb-2 font-semibold">
              <div>Tipo</div>
              <div>Nome</div>
              <div>Valor</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>CNAME</div>
              <div>@</div>
              <div>seu-servidor.com.br</div>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-3">
            Após configurar o DNS, aguarde a propagação (1-48h) e clique em "Verificar"
          </p>
        </div>
      </div>
    </div>
  )
}
