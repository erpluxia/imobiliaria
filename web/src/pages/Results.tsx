import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getAllProperties, filterProperties, type Query } from '../data/properties'
import ListingRow from '../components/ListingRow'

export default function Results() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const query: Query = useMemo(() => ({
    q: params.get('q') ?? undefined,
    city: params.get('city') ?? undefined,
    business: (params.get('business') as Query['business']) ?? undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    bedrooms: params.get('bedrooms') ? Number(params.get('bedrooms')) : undefined,
  }), [params])

  const list = useMemo(() => filterProperties(getAllProperties(), query), [query])

  function updateParam(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value) next.delete(name)
    else next.set(name, value)
    navigate(`/resultados?${next.toString()}`)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      {/* Barra de controle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <input
            className="flex-1 border rounded-md px-3 py-2"
            placeholder="Cidade, bairro..."
            defaultValue={query.city ?? ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('city', (e.target as HTMLInputElement).value)
            }}
          />
          <div className="hidden md:flex items-center gap-2 text-sm">
            {['Mobiliado', 'Aceita pets', 'Piscina', 'Varanda'].map((chip) => (
              <button key={chip} className="px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50">{chip}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="border rounded-md px-3 py-2 text-sm" defaultValue="relevance" onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="relevance">Ordenar por: Relevância</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="area_desc">Maior área</option>
          </select>
          <button className="px-3 py-2 rounded-md border text-sm">🗺️ Mapa</button>
          <Link to="/" className="px-3 py-2 rounded-md border bg-white text-sm">Nova busca</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar de filtros */}
        <aside className="bg-white border rounded-2xl p-4 h-fit">
          <div className="flex gap-2 text-sm mb-4 border-b pb-2">
            {['sale', 'rent'].map((t) => (
              <button
                key={t}
                onClick={() => updateParam('business', t)}
                className={`px-3 py-1.5 rounded-md ${query.business === (t as any) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                {t === 'rent' ? 'Alugar' : 'Comprar'}
              </button>
            ))}
          </div>

          <div className="space-y-4 text-sm">
            <fieldset>
              <legend className="font-medium mb-2">Tipo de imóvel</legend>
              <div className="grid gap-2">
                {['Apartamento', 'Casa', 'Kitnet'].map((it) => (
                  <label key={it} className="inline-flex items-center gap-2">
                    <input type="checkbox" disabled className="accent-indigo-600" /> {it}
                  </label>
                ))}
              </div>
              <button className="mt-2 text-indigo-600 hover:underline" type="button">Todos os tipos de imóveis</button>
            </fieldset>

            <fieldset>
              <legend className="font-medium mb-2">Quartos</legend>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map((n) => (
                  <button key={n} onClick={() => updateParam('bedrooms', String(n))} className={`px-2 py-1.5 rounded-md border ${query.bedrooms === n ? 'bg-indigo-600 text-white' : ''}`}>{n}+</button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-medium mb-2">Banheiros</legend>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map((n) => (
                  <button key={n} className="px-2 py-1.5 rounded-md border" disabled>{n}+</button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-medium mb-2">Vagas</legend>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map((n) => (
                  <button key={n} className="px-2 py-1.5 rounded-md border" disabled>{n}+</button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-medium mb-2">Preço</legend>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="R$ mín" type="number" className="border rounded-md px-3 py-2" defaultValue={query.minPrice ?? ''} onBlur={(e) => updateParam('minPrice', e.target.value)} />
                <input placeholder="R$ máx" type="number" className="border rounded-md px-3 py-2" defaultValue={query.maxPrice ?? ''} onBlur={(e) => updateParam('maxPrice', e.target.value)} />
              </div>
            </fieldset>

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => navigate('/resultados')} className="text-gray-600">Limpar</button>
              <button onClick={() => { /* já aplica onBlur/onClick */ }} className="bg-indigo-600 text-white rounded-md px-3 py-2">Buscar Imóveis</button>
            </div>
          </div>
        </aside>

        {/* Lista */}
        <div className="space-y-4">
          {list.map((p) => (
            <ListingRow key={p.id} p={p} />
          ))}
          {list.length === 0 && (
            <div className="text-center text-gray-600">Nenhum imóvel encontrado.</div>
          )}
        </div>
      </div>
    </section>
  )
}
