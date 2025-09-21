import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { findPropertyById } from '../data/properties'

export default function PropertyDetails() {
  const { id } = useParams()
  const p = id ? findPropertyById(id) : undefined

  if (!p) return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <p className="text-gray-600">Imóvel não encontrado.</p>
      <Link to="/resultados" className="text-indigo-600 hover:underline">Voltar</Link>
    </section>
  )

  const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)

  const [current, setCurrent] = useState(0)

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
        <Link to="/resultados" className="hover:text-gray-800">Imóveis</Link>
        <span>›</span>
        <span className="capitalize">{p.city}</span>
        <span>›</span>
        <span className="capitalize">{p.neighborhood}</span>
      </div>

      {/* Título e endereço */}
      <div className="mt-2 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">{p.title}</h1>
          <p className="text-gray-600">{p.address} — {p.neighborhood}, {p.city}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{p.business === 'rent' ? `${price}/mês` : price}</div>
          <div className="text-xs text-gray-500">{p.type === 'apartment' ? 'Apartamento' : p.type === 'house' ? 'Casa' : 'Comercial'} • {p.area} m²</div>
        </div>
      </div>

      {/* Galeria */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 rounded-xl overflow-hidden">
          <div className="relative aspect-[16/9] bg-gray-100">
            <img src={p.images[current] ?? p.images[0]} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          {/* Thumbs */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {p.images.slice(0, 8).map((src, idx) => (
              <button key={src+idx} onClick={() => setCurrent(idx)} className={`relative aspect-[4/3] rounded-lg overflow-hidden border ${current === idx ? 'ring-2 ring-indigo-600' : ''}`}>
                <img src={src} alt={p.title + ' thumb'} className="absolute inset-0 w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-rows-2 gap-3">
          <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 relative">
            <img src={p.images[1] ?? p.images[0]} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 relative">
            <img src={p.images[2] ?? p.images[0]} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white text-gray-700 hover:bg-gray-50">📷 30 fotos</button>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white text-gray-700 hover:bg-gray-50">🎬 Vídeo</button>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white text-gray-700 hover:bg-gray-50">🗺️ Mapa</button>
      </div>

      {/* Conteúdo principal */}
      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Valores */}
          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">Valores</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl border p-4">
                <div className="text-gray-500">Imóvel</div>
                <div className="text-xl font-bold">{p.business === 'rent' ? `${price}/mês` : price}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-gray-500">Condomínio</div>
                <div className="font-medium">Não informado</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-gray-500">IPTU</div>
                <div className="font-medium">Não informado</div>
              </div>
            </div>
          </section>

          {/* Características */}
          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">Características</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-800">
              <div className="flex items-center gap-2">🏠 <span>{p.area} m²</span></div>
              <div className="flex items-center gap-2">🛏️ <span>{p.bedrooms} quartos</span></div>
              <div className="flex items-center gap-2">🛁 <span>{p.bathrooms} banheiros</span></div>
              <div className="flex items-center gap-2">🚗 <span>{p.parking} vagas</span></div>
              {p.features.map((f) => (
                <div key={f} className="flex items-center gap-2">✅ <span>{f}</span></div>
              ))}
            </div>
          </section>

          {/* Localização */}
          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-1">Localização</h2>
            <p className="text-sm text-gray-600">{p.address} — {p.neighborhood}, {p.city}</p>
            <div className="mt-4 rounded-xl overflow-hidden border">
              <iframe
                title="mapa"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${p.latitude},${p.longitude}&hl=pt-BR&z=15&output=embed`}
              />
            </div>
          </section>

          {/* Descrição */}
          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3">Descrição</h2>
            <p className="text-gray-700 leading-relaxed">
              {p.description}
            </p>
          </section>
        </div>

        {/* Sidebar de contato */}
        <aside className="bg-white border rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold">RI</div>
            <div>
              <div className="font-semibold">Rofe Imóveis</div>
              <div className="text-xs text-gray-500">Creci: 0/00-0 — SP</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">★ ★ ★ ★ ☆ (2 avaliações) • 166 imóveis cadastrados</div>

          <form className="mt-5 grid gap-3">
            <input required placeholder="Seu nome" className="border rounded-md px-3 py-2" />
            <input required type="email" placeholder="Seu e-mail" className="border rounded-md px-3 py-2" />
            <input required placeholder="Seu telefone" className="border rounded-md px-3 py-2" />
            <textarea rows={4} defaultValue={`Olá, gostaria de ter mais informações sobre: ${p.title}, ${p.address} — ${p.neighborhood}, ${p.city}.`} className="border rounded-md px-3 py-2" />
            <label className="text-xs text-gray-600 flex items-start gap-2">
              <input type="checkbox" className="mt-1" /> Receber ofertas similares.
            </label>
            <button className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700">Enviar mensagem</button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            Ao clicar em "Enviar mensagem" você concorda com os Termos de uso e com a nossa Política de privacidade.
          </div>

          <div className="mt-4 border-t pt-4 text-sm">
            <div className="text-gray-600">Fale com o anunciante</div>
            <div className="mt-2 flex items-center gap-2">
              <span>📞</span>
              <a className="text-indigo-600 hover:underline" href="tel:+5511999999999">(11) 99999-9999</a>
            </div>
            <a className="mt-3 inline-flex items-center justify-center gap-2 w-full bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700" href="#">
              <span>🟢</span> WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </section>
  )
}
