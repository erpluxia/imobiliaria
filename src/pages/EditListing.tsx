import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Campos
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [type, setType] = useState<'apartment' | 'house' | 'commercial'>('apartment')
  const [business, setBusiness] = useState<'sale' | 'rent'>('sale')
  const [area, setArea] = useState<number | ''>('')
  const [bedrooms, setBedrooms] = useState<number | ''>('')
  const [bathrooms, setBathrooms] = useState<number | ''>('')
  const [parking, setParking] = useState<number | ''>('')

  // Preço com máscara BRL
  const [priceDigits, setPriceDigits] = useState<string>('') // em centavos
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const priceDisplay = priceDigits ? brl.format(Number(priceDigits) / 100) : ''
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D+/g, '')
    setPriceDigits(digits)
  }

  // Imagens
  type Img = { id: string; url: string; storage_path: string | null; position: number }
  const [images, setImages] = useState<Img[]>([])
  const maxPos = useMemo(() => images.reduce((m, it) => Math.max(m, it.position ?? 0), -1), [images])

  useEffect(() => {
    let active = true
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        if (!user) throw new Error('Você precisa estar logado.')

        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        if (!data) throw new Error('Imóvel não encontrado')
        if (data.owner_id !== user.id && !isAdmin) throw new Error('Você não tem permissão para editar este imóvel.')

        if (!active) return
        setTitle(data.title ?? '')
        setDescription(data.description ?? '')
        setAddress(data.address ?? '')
        setCity(data.city ?? '')
        setNeighborhood(data.neighborhood ?? '')
        setType(data.type ?? 'apartment')
        setBusiness(data.business ?? 'sale')
        setArea(typeof data.area_m2 === 'number' ? data.area_m2 : '')
        setBedrooms(typeof data.bedrooms === 'number' ? data.bedrooms : '')
        setBathrooms(typeof data.bathrooms === 'number' ? data.bathrooms : '')
        setParking(typeof data.parking_spaces === 'number' ? data.parking_spaces : '')
        if (typeof data.price === 'number') setPriceDigits(String(Math.round(data.price * 100)))

        // Carregar imagens
        const { data: imgs, error: imgErr } = await supabase
          .from('property_images')
          .select('id, url, storage_path, position')
          .eq('property_id', data.id)
          .order('position', { ascending: true })
        if (imgErr) throw imgErr
        if (active) setImages((imgs ?? []).map((r) => ({ id: r.id as any, url: r.url as any, storage_path: r.storage_path as any, position: (r.position as any) ?? 0 })))
      } catch (e: any) {
        if (active) setError(e.message ?? 'Erro ao carregar imóvel')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      const price = priceDigits ? Number(priceDigits) / 100 : 0
      const { error } = await supabase
        .from('properties')
        .update({
          title: title || null,
          description: description || null,
          address: address || null,
          city: city || null,
          neighborhood: neighborhood || null,
          type,
          business,
          area_m2: typeof area === 'number' ? area : null,
          bedrooms: typeof bedrooms === 'number' ? bedrooms : null,
          bathrooms: typeof bathrooms === 'number' ? bathrooms : null,
          parking_spaces: typeof parking === 'number' ? parking : null,
          price,
        })
        .eq('id', id)
      if (error) throw error
      navigate(isAdmin ? '/admin/listings?updated=1' : '/meus-imoveis')
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  // Upload de novas imagens
  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id) return
    const files = e.target.files
    if (!files || files.length === 0) return
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Você precisa estar logado.')

      let pos = maxPos + 1
      for (const file of Array.from(files)) {
        const path = `${user.id}/${id}/${Date.now()}_${file.name}`
        const up = await supabase.storage.from('property-images').upload(path, file, { upsert: false })
        if (up.error) throw up.error
        const { data: pub } = supabase.storage.from('property-images').getPublicUrl(path)
        const ins = await supabase.from('property_images').insert({ property_id: id, storage_path: path, url: pub.publicUrl, position: pos })
        if (ins.error) throw ins.error
        pos += 1
      }
      // Recarregar imagens
      const { data: imgs, error: imgErr } = await supabase
        .from('property_images')
        .select('id, url, storage_path, position')
        .eq('property_id', id)
        .order('position', { ascending: true })
      if (imgErr) throw imgErr
      setImages((imgs ?? []).map((r: any) => ({ id: r.id, url: r.url, storage_path: r.storage_path, position: r.position ?? 0 })))
      // limpa input
      e.target.value = ''
    } catch (err: any) {
      alert(err.message ?? 'Erro ao enviar imagens')
    }
  }

  // Remover imagem selecionada
  async function removeImage(img: { id: string; storage_path: string | null }) {
    if (!id) return
    if (!confirm('Remover esta imagem?')) return
    try {
      if (img.storage_path) {
        const rm = await supabase.storage.from('property-images').remove([img.storage_path])
        if (rm.error) throw rm.error
      }
      const del = await supabase.from('property_images').delete().eq('id', img.id)
      if (del.error) throw del.error
      setImages((prev) => prev.filter((it) => it.id !== img.id))
    } catch (err: any) {
      alert(err.message ?? 'Erro ao remover imagem')
    }
  }

  // Reordenar imagem localmente
  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev]
      const j = index + dir
      if (j < 0 || j >= next.length) return prev
      const tmp = next[index]
      next[index] = next[j]
      next[j] = tmp
      return next
    })
  }

  // Persistir ordem atual no banco
  async function saveOrder() {
    if (!id) return
    try {
      for (let i = 0; i < images.length; i++) {
        const it = images[i]
        if (it.position !== i) {
          const up = await supabase.from('property_images').update({ position: i }).eq('id', it.id)
          if (up.error) throw up.error
        }
      }
      // Recarrega
      const { data: imgs, error: imgErr } = await supabase
        .from('property_images')
        .select('id, url, storage_path, position')
        .eq('property_id', id)
        .order('position', { ascending: true })
      if (imgErr) throw imgErr
      setImages((imgs ?? []).map((r: any) => ({ id: r.id, url: r.url, storage_path: r.storage_path, position: r.position ?? 0 })))
      alert('Ordem salva!')
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar ordem')
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Editar Imóvel</h1>
      {loading ? (
        <div className="text-gray-600">Carregando...</div>
      ) : (
        <form onSubmit={onSave} className="grid gap-6 bg-white border rounded-2xl p-5">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="commercial">Comercial</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Negócio</label>
              <select value={business} onChange={(e) => setBusiness(e.target.value as any)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="sale">Venda</option>
                <option value="rent">Aluguel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Título do anúncio" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Descreva o imóvel" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Endereço</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Rua, número" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Cidade</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Cidade" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Bairro</label>
              <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Bairro" />
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Área (m²)</label>
              <input value={area} onChange={(e) => setArea(e.target.value ? Number(e.target.value) : '')} type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="75" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Quartos</label>
              <input value={bedrooms} onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : '')} type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="2" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Banheiros</label>
              <input value={bathrooms} onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : '')} type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Vagas</label>
              <input value={parking} onChange={(e) => setParking(e.target.value ? Number(e.target.value) : '')} type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Preço (R$)</label>
            <input
              value={priceDisplay}
              onChange={handlePriceChange}
              inputMode="numeric"
              className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="R$ 320.000,00"
            />
          </div>

          {/* Gerenciamento de fotos */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Fotos</div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 border rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50 cursor-pointer">
                  <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" />
                  Enviar imagens
                </label>
                <button type="button" onClick={saveOrder} className="border rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50">Salvar ordem</button>
              </div>
            </div>
            {images.length === 0 ? (
              <div className="text-sm text-gray-600">Nenhuma imagem enviada.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden border bg-gray-50 aspect-[4/3]">
                    <img src={img.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between gap-2 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveImage(idx, -1)} className="text-white/90 hover:text-white text-xs px-2 py-1 rounded-md border border-white/30">◀</button>
                        <button type="button" onClick={() => moveImage(idx, +1)} className="text-white/90 hover:text-white text-xs px-2 py-1 rounded-md border border-white/30">▶</button>
                      </div>
                      <button type="button" onClick={() => removeImage(img)} className="text-white/90 hover:text-white text-xs px-2 py-1 rounded-md border border-white/30">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className={`bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
            <button
              type="button"
              onClick={() => navigate(isAdmin ? '/admin/listings' : '/meus-imoveis')}
              className="border rounded-md px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
