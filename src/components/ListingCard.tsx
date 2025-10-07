import { Link } from 'react-router-dom'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ListingCard({ p }: { p: any }) {
  const image = p.cover_image_url || p.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80'
  const area = p.area_m2 ?? p.area ?? '—'
  const parking = p.parking_spaces ?? p.parking ?? 0
  const priceSaleText = typeof p.price_sale === 'number' ? brl.format(p.price_sale) : '—'
  const priceRentText = typeof p.price_rent === 'number' ? brl.format(p.price_rent) : '—'
  const link = `/imovel/${p.slug || p.id}`
  const tipo = p.type === 'apartment' ? 'Apartamento' : p.type === 'house' ? 'Casa' : 'Comercial'
  const verb = p.is_for_rent && p.is_for_sale ? 'vender e alugar' : p.is_for_rent ? 'alugar' : 'comprar'
  const resumo = `${tipo} para ${verb} com ${area} m² · ${p.bedrooms ?? 0} quartos · ${p.bathrooms ?? 0} banheiros · ${parking} vagas em ${p.neighborhood}, ${p.city}`

  return (
    <article className="group bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagem com overlay e legenda */}
      <div className="relative aspect-[4/3] bg-gray-200">
        <img src={image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-[1.02]" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-black/70 text-white capitalize">
            {tipo}
          </span>
          {p.is_for_sale && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-600 text-white capitalize">Venda</span>
          )}
          {p.is_for_rent && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-600 text-white capitalize">Aluguel</span>
          )}
        </div>
        {/* Faixa descritiva na base da imagem */}
        <div className="absolute inset-x-0 bottom-0 p-2">
          <div className="rounded-md bg-black/60 text-white text-[12px] px-3 py-1.5 line-clamp-1">
            {resumo}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={link} className="font-semibold text-gray-900 hover:underline">
              {p.neighborhood}, {p.city}
            </Link>
            <div className="text-sm text-gray-500">{p.address}</div>
          </div>
          <button aria-label="Favoritar" className="text-gray-400 hover:text-indigo-600">♡</button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-gray-700">
          <span className="inline-flex items-center gap-1">📐 {area} m²</span>
          <span className="inline-flex items-center gap-1">🛏️ {p.bedrooms ?? 0}</span>
          <span className="inline-flex items-center gap-1">🛁 {p.bathrooms ?? 0}</span>
          <span className="inline-flex items-center gap-1">🚗 {parking}</span>
        </div>

        <div className="mt-3 font-bold text-gray-900 text-sm space-y-1">
          {p.is_for_sale && <div>Venda: <span className="text-base">{priceSaleText}</span></div>}
          {p.is_for_rent && <div>Aluguel: <span className="text-base">{priceRentText !== '—' ? `${priceRentText}/mês` : '—'}</span></div>}
          {!p.is_for_sale && !p.is_for_rent && <div className="text-base">—</div>}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Link to={link} className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700">Mensagem</Link>
          {/* Telefone removido do card; contato via detalhes/WhatsApp */}
        </div>
      </div>
    </article>
  )
}
