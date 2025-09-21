import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { PROPERTIES } from '../data/properties'

export default function Home() {
  const featured = PROPERTIES.slice(0, 6)

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
          <div className="mt-6 flex flex-wrap gap-3">
            {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'].map((c) => (
              <a key={c} href={`/resultados?city=${encodeURIComponent(c)}`} className="inline-flex items-center gap-2 bg-white border text-gray-700 px-3 py-2 rounded-full hover:bg-gray-50 text-sm shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" /> {c}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Destaques</h2>
          <a href="/resultados" className="text-sm text-indigo-600 hover:underline">Ver todos</a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p) => (
            <ListingCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </>
  )
}
