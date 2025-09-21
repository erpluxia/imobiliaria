import { Link } from 'react-router-dom'
import type { Property } from '../data/properties'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ListingCard({ p }: { p: Property }) {
  const resumo = `${p.type === 'apartment' ? 'Apartamento' : p.type === 'house' ? 'Casa' : 'Comercial'} para ${p.business === 'rent' ? 'alugar' : 'comprar'} com ${p.area} m² · ${p.bedrooms} quartos · ${p.bathrooms} banheiros · ${p.parking} vagas em ${p.neighborhood}, ${p.city}`

  return (
    <article className="group bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagem com overlay e legenda */}
      <div className="relative aspect-[4/3] bg-gray-200">
        <img src={p.images[0]} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-[1.02]" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-black/70 text-white capitalize">
            {p.type === 'apartment' ? 'Apartamento' : p.type === 'house' ? 'Casa' : 'Comercial'}
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-600 text-white capitalize">
            {p.business === 'rent' ? 'Aluguel' : 'Venda'}
          </span>
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
            <Link to={`/imovel/${p.id}`} className="font-semibold text-gray-900 hover:underline">
              {p.neighborhood}, {p.city}
            </Link>
            <div className="text-sm text-gray-500">{p.address}</div>
          </div>
          <button aria-label="Favoritar" className="text-gray-400 hover:text-indigo-600">♡</button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-gray-700">
          <span className="inline-flex items-center gap-1">📐 {p.area} m²</span>
          <span className="inline-flex items-center gap-1">🛏️ {p.bedrooms}</span>
          <span className="inline-flex items-center gap-1">🛁 {p.bathrooms}</span>
          <span className="inline-flex items-center gap-1">🚗 {p.parking}</span>
        </div>

        <div className="mt-3 font-bold text-gray-900">
          {p.business === 'rent' ? `${brl.format(p.price)}/mês` : brl.format(p.price)}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Link to={`/imovel/${p.id}`} className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700">Mensagem</Link>
          <a href="tel:+5511999999999" className="text-blue-700 hover:underline text-sm">Telefone</a>
        </div>
      </div>
    </article>
  )
}
