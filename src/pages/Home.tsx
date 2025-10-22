import { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { supabase } from '../lib/supabaseClient'
import { useCompany } from '../contexts/CompanyContext'

export default function Home() {
  const { company } = useCompany()
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!company) return
    
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('company_id', company!.id)
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
  }, [company])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Banner full-width com textos sobrepostos */}
        <div className="relative">
          <img
            src="/banner.png"
            alt="Banner imobiliária"
            className="w-full h-[240px] md:h-[360px] xl:h-[460px] object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0">
            {/* overlay sutil para reforçar contraste do texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/35" />
            <div className="relative max-w-7xl mx-auto h-full px-4 flex items-center justify-center">
              <div className="max-w-3xl text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">Seu imóvel ideal está aqui</h1>
                <p className="text-lg md:text-2xl font-medium text-white/95 mt-4 drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)]">Explore imóveis para comprar ou alugar nas melhores regiões do Brasil.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros abaixo do banner, dentro do container */}
        <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-8">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <SearchBar />
          </div>
        </div>
      </section>

      {/*Destaques */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Destaques</h2>
          <a href="/resultados" className="text-sm text-primary hover:underline">Ver todos</a>
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
