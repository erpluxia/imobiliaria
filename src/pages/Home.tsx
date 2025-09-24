import { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6)
        if (error) throw error
        if (active) setFeatured(data ?? [])

        // Removido: listagem de cidades sob os filtros
      } catch (e: any) {
        if (active) setError(e.message ?? 'Erro ao carregar destaques')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-sky-50" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Seu imóvel ideal está aqui</h1>
            <p className="text-lg text-gray-600 mt-3">Explore imóveis para comprar ou alugar nas melhores regiões do Brasil.</p>
          </div>
          <div className="mt-8 bg-white p-4 md:p-6 rounded-2xl shadow-lg border">
            <SearchBar />
          </div>
          {/* Removido: chips de cidades abaixo dos filtros */}
        </div>
      </section>

      {/* Destaques */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Destaques</h2>
          <a href="/resultados" className="text-sm text-indigo-600 hover:underline">Ver todos</a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && <div className="text-gray-600">Carregando...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && featured.map((p) => (
            <ListingCard key={p.id} p={p} />
          ))}
          {!loading && !error && featured.length === 0 && (
            <div className="text-gray-600">Nenhum destaque disponível no momento.</div>
          )}
        </div>
      </section>
    </>
  )
}
