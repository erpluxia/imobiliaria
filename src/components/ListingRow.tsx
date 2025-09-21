import { Link } from 'react-router-dom'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ListingRow({ p }: { p: any }) {
  const image = p.cover_image_url || p.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80'
  const priceText = typeof p.price === 'number' ? brl.format(p.price) : '—'
  return (
    <article className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[360px_1fr_220px]">
        {/* Imagem */}
        <div className="relative">
          <div className="relative aspect-[16/10] bg-gray-100">
            <img src={image} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-[11px] px-2 py-1 rounded-full bg-black/70 text-white capitalize">Super Destaque</span>
            <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-600 text-white capitalize">{p.business === 'rent' ? 'Aluguel' : 'Venda'}</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link to={`/imovel/${p.slug || p.id}`} className="font-semibold text-gray-900 hover:underline line-clamp-2">{p.title}</Link>
              <div className="text-sm text-gray-600">{p.neighborhood}, {p.city}</div>
            </div>
            <button aria-label="Favoritar" className="text-gray-400 hover:text-indigo-600">♡</button>
          </div>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="inline-flex items-center gap-1">📐 {p.area_m2 ?? '—'} m²</span>
            <span className="inline-flex items-center gap-1">🛏️ {p.bedrooms ?? 0}</span>
            <span className="inline-flex items-center gap-1">🛁 {p.bathrooms ?? 0}</span>
            <span className="inline-flex items-center gap-1">🚗 {p.parking_spaces ?? 0}</span>
          </div>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{p.description}</p>
        </div>

        {/* Ações/Preço */}
        <div className="border-t md:border-t-0 md:border-l p-4 flex md:flex-col items-center md:items-end justify-between gap-3">
          <div className="text-lg font-bold text-gray-900">
            {p.business === 'rent' ? `${priceText}/mês` : priceText}
          </div>
          <div className="flex items-center gap-2">
            <a className="hidden md:inline text-indigo-700 hover:underline text-sm" href="tel:+5511999999999">Telefone</a>
            <Link to={`/imovel/${p.slug || p.id}`} className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700">Mensagem</Link>
          </div>
        </div>
      </div>
    </article>
  )
}
