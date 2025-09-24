import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function PropertyDetails() {
  const { slug, id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [p, setP] = useState<any | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [current, setCurrent] = useState(0)
  const thumbsRef = useRef<HTMLDivElement | null>(null)
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null)
  const { user } = useAuth()
  const next1 = useMemo(() => {
    if (images.length === 0) return 0
    return (current + 1) % images.length
  }, [current, images.length])
  const next2 = useMemo(() => {
    if (images.length === 0) return 0
    return (current + 2) % images.length
  }, [current, images.length])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let property: any | null = null
        if (slug) {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('slug', slug)
            .single()
          if (error) throw error
          property = data
        } else if (id) {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single()
          if (error) throw error
          property = data
        }
        if (!property) {
          if (active) { setP(null) }
          return
        }
        // imagens
        const imgs: string[] = []
        if (property.cover_image_url) imgs.push(property.cover_image_url)
        const { data: moreImgs, error: imgErr } = await supabase
          .from('property_images')
          .select('url')
          .eq('property_id', property.id)
          .order('position', { ascending: true })
          
        if (imgErr) throw imgErr
        if (moreImgs) {
          for (const it of moreImgs) {
            if (it.url && !imgs.includes(it.url)) imgs.push(it.url)
          }
        }
        // buscar telefone do proprietário no perfil
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', property.owner_id)
            .single()
          if (active) setOwnerPhone(prof?.phone ?? null)
        } catch (_) {
          if (active) setOwnerPhone(null)
        }

        if (active) {
          setP(property)
          setImages(imgs)
        }
      } catch (e: any) {
        if (active) setError(e.message ?? 'Erro ao carregar imóvel')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [slug, id])

  // Garante que a miniatura ativa fique visível no carrossel
  useEffect(() => {
    const cont = thumbsRef.current
    if (!cont) return
    const el = cont.querySelector<HTMLButtonElement>(`[data-index="${current}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [current])

  const priceText = useMemo(() => {
    if (!p?.price) return undefined
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)
  }, [p])

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-600">Carregando...</p>
      </section>
    )
  }

  if (error || !p) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-600">Imóvel não encontrado.</p>
        <Link to="/resultados" className="text-indigo-600 hover:underline">Voltar</Link>
      </section>
    )
  }

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
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{p.business === 'rent' ? `${priceText ?? '—'}/mês` : (priceText ?? '—')}</div>
          <div className="text-xs text-gray-500">{p.type === 'apartment' ? 'Apartamento' : p.type === 'house' ? 'Casa' : 'Comercial'} • {p.area_m2 ?? '—'} m²</div>
        </div>
      </div>

      {/* Galeria */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <div className="rounded-xl overflow-hidden">
            <div className="relative aspect-[16/9] bg-gray-100">
              <img src={images[current] ?? images[0]} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
          {/* Thumbs em carrossel deslizante */}
          <div className="mt-3">
            <div className="relative">
              <div ref={thumbsRef} className="flex gap-2 overflow-x-auto px-2 no-scrollbar scroll-smooth snap-x">
                {images.map((src, idx) => (
                  <button
                    key={src+idx}
                    data-index={idx}
                    onClick={() => setCurrent(idx)}
                    className={`relative rounded-lg overflow-hidden border min-w-[96px] w-28 aspect-[4/3] snap-center ${current === idx ? 'ring-2 ring-indigo-600' : ''}`}
                    title={`Imagem ${idx + 1}`}
                  >
                    <img src={src} alt={p.title + ' thumb'} className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {images.length > 8 && (
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const cont = thumbsRef.current
                      if (!cont) return
                      cont.scrollBy({ left: -cont.clientWidth * 0.9, behavior: 'smooth' })
                    }}
                    className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => {
                      const cont = thumbsRef.current
                      if (!cont) return
                      cont.scrollBy({ left: cont.clientWidth * 0.9, behavior: 'smooth' })
                    }}
                    className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="hidden lg:grid grid-rows-2 gap-3">
          <button
            type="button"
            onClick={() => setCurrent(next1)}
            className="rounded-xl overflow-hidden aspect-video bg-gray-100 relative"
            title="Próxima imagem"
          >
            <img src={images[next1] ?? images[0]} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent(next2)}
            className="rounded-xl overflow-hidden aspect-video bg-gray-100 relative"
            title="Imagem seguinte"
          >
            <img src={images[next2] ?? images[0]} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          </button>
        </div>
      </div>
      <div className="mt-2">
        <span className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border bg-white text-gray-700">
          📷 {images.length} {images.length === 1 ? 'foto' : 'fotos'}
        </span>
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
                <div className="text-xl font-bold">{p.business === 'rent' ? `${priceText ?? '—'}/mês` : (priceText ?? '—')}</div>
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
              <div className="flex items-center gap-2">🏠 <span>{p.area_m2 ?? '—'} m²</span></div>
              <div className="flex items-center gap-2">🛏️ <span>{p.bedrooms ?? 0} quartos</span></div>
              <div className="flex items-center gap-2">🛁 <span>{p.bathrooms ?? 0} banheiros</span></div>
              <div className="flex items-center gap-2">🚗 <span>{p.parking_spaces ?? 0} vagas</span></div>
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
                src={`https://www.google.com/maps?q=${encodeURIComponent('São Paulo, SP')}&hl=pt-BR&z=12&output=embed`}
              />
            </div>
          </section>

          {/* Descrição */}
          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3">Descrição</h2>
            <p className="text-gray-700 leading-relaxed">{p.description}</p>
          </section>
        </div>

        {/* Sidebar de contato */}
        <aside className="bg-white border rounded-2xl p-5 h-fit">

          <form
            className="grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const name = String(fd.get('name') || '')
              const email = String(fd.get('email') || '')
              const phone = String(fd.get('phone') || '')
              const content = String(fd.get('message') || '')

              // construir link do imóvel
              const base = typeof window !== 'undefined' ? window.location.origin : 'https://imobiliaria.example'
              const link = p.slug ? `${base}/imovel/${p.slug}` : `${base}/imovel/id/${p.id}`

              // telefone do dono
              let target = ownerPhone || ''
              // sanear para dígitos e tentar formatação BR
              const digits = target.replace(/\D+/g, '')
              if (digits.startsWith('55')) target = digits
              else if (digits.length === 11) target = `55${digits}`
              else target = digits

              // salvar mensagem no Supabase
              try {
                await supabase.from('messages').insert({
                  property_id: p.id,
                  owner_id: p.owner_id,
                  sender_id: user?.id ?? null,
                  sender_name: name || null,
                  sender_email: email || null,
                  sender_phone: phone || null,
                  content: content || null,
                })
              } catch (_) {
                // mantém silencioso para não bloquear o WhatsApp
              }

              const text = `Olá! Meu nome é ${name}.\nE-mail: ${email}\nTelefone: ${phone}\n\nTenho interesse no anúncio: ${p.title}\nLink: ${link}\n\nMensagem: ${content}`
              const url = `https://wa.me/${encodeURIComponent(target)}?text=${encodeURIComponent(text)}`
              window.open(url, '_blank')
            }}
          >
            <input name="name" required placeholder="Seu nome" className="border rounded-md px-3 py-2" />
            <input name="email" required type="email" placeholder="Seu e-mail" className="border rounded-md px-3 py-2" />
            <input name="phone" required placeholder="Seu telefone" className="border rounded-md px-3 py-2" />
            <textarea name="message" rows={4} defaultValue={`Olá, gostaria de ter mais informações sobre: ${p.title}, ${p.address} — ${p.neighborhood}, ${p.city}.`} className="border rounded-md px-3 py-2" />
            <button type="submit" className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700">Enviar mensagem</button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            Ao clicar em "Enviar mensagem" você concorda com os Termos de uso e com a nossa Política de privacidade.
          </div>
        </aside>
      </div>
    </section>
  )
}
