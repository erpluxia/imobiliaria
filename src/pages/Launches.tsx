import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ListingRow from '../components/ListingRow'

export default function Launches() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [launches, setLaunches] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function fetchLaunches() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_active', true)
          .eq('is_launch', true)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (error) throw error
        if (active) setLaunches(data ?? [])
      } catch (e: any) {
        if (active) setError(e.message ?? 'Erro ao buscar lançamentos')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchLaunches()
    return () => { active = false }
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Lançamentos</h1>
        <p className="text-gray-600 mt-2">Confira os imóveis mais recentes e empreendimentos novos</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {!loading && !error && (
            <span>{launches.length} {launches.length === 1 ? 'lançamento encontrado' : 'lançamentos encontrados'}</span>
          )}
        </p>
        <Link to="/" className="px-4 py-2 rounded-md border bg-white text-sm hover:bg-gray-50">
          Nova busca
        </Link>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 mt-3">Carregando lançamentos...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 bg-red-50 rounded-lg p-4 inline-block">
              <p className="font-semibold">Erro ao carregar</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {!loading && !error && launches.map((p) => (
          <ListingRow key={p.id} p={p} />
        ))}
        
        {!loading && !error && launches.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block bg-gray-50 rounded-lg p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-600 font-medium mt-4">Nenhum lançamento disponível no momento</p>
              <p className="text-gray-500 text-sm mt-2">Volte em breve para conferir novos empreendimentos</p>
              <Link to="/resultados" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Ver todos os imóveis
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
