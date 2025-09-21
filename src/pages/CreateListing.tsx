import type { FormEvent } from 'react'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

type Preview = { name: string; dataUrl: string; file?: File }

export default function CreateListing() {
  const navigate = useNavigate()
  const [previews, setPreviews] = useState<Preview[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successSlug, setSuccessSlug] = useState<string | null>(null)
  const [priceDigits, setPriceDigits] = useState<string>('') // somente dígitos em centavos

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const priceDisplay = priceDigits ? brl.format(Number(priceDigits) / 100) : ''
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D+/g, '')
    setPriceDigits(digits)
  }

  const readFilesAsDataUrl = useCallback(async (files: FileList | null) => {
    if (!files) return [] as Preview[]
    const readers = Array.from(files).map(
      (file) =>
        new Promise<Preview>((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve({ name: file.name, dataUrl: String(fr.result), file })
          fr.onerror = () => reject(fr.error)
          fr.readAsDataURL(file)
        })
    )
    return Promise.all(readers)
  }, [])

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const items = await readFilesAsDataUrl(e.dataTransfer.files)
    setPreviews((prev) => [...prev, ...items])
  }, [readFilesAsDataUrl])

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const items = await readFilesAsDataUrl(e.target.files)
    setPreviews((prev) => [...prev, ...items])
    if (inputRef.current) inputRef.current.value = ''
  }, [readFilesAsDataUrl])

  function removePreview(name: string) {
    setPreviews((prev) => prev.filter((p) => p.name !== name))
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSuccessSlug(null)

    const fd = new FormData(e.currentTarget)

    const price = priceDigits ? Number(priceDigits) / 100 : 0
    const bedrooms = Number(fd.get('bedrooms') || 0)
    const bathrooms = Number(fd.get('bathrooms') || 0)
    const parking = Number(fd.get('parking') || 0)
    const area = Number(fd.get('area') || 0)

    try {
      // 1) Valida usuário logado
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Você precisa estar logado para anunciar.')

      // 2) Criar imóvel
      const insertRes = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          title: String(fd.get('title') || ''),
          description: String(fd.get('description') || ''),
          city: String(fd.get('city') || ''),
          neighborhood: String(fd.get('neighborhood') || ''),
          address: String(fd.get('address') || ''),
          price: isNaN(price) ? null : price,
          bedrooms: isNaN(bedrooms) ? null : bedrooms,
          bathrooms: isNaN(bathrooms) ? null : bathrooms,
          parking_spaces: isNaN(parking) ? null : parking,
          area_m2: isNaN(area) ? null : area,
          type: String(fd.get('type') || ''),
          business: String(fd.get('business') || 'sale'),
          is_active: true,
        })
        .select('id, slug')
        .single()

      if (insertRes.error) throw insertRes.error
      const propertyId = insertRes.data.id as string
      const slug = insertRes.data.slug as string

      // 3) Upload múltiplo de arquivos selecionados
      const uploadedUrls: string[] = []
      for (const p of previews) {
        if (!p.file) continue
        const ext = p.file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${user.id}/${propertyId}/${crypto.randomUUID()}.${ext}`
        const up = await supabase.storage.from('property-images').upload(path, p.file, {
          cacheControl: '3600', upsert: false,
        })
        if (up.error) throw up.error
        const { data: pub } = supabase.storage.from('property-images').getPublicUrl(path)
        const publicUrl = pub.publicUrl
        uploadedUrls.push(publicUrl)
        const insImg = await supabase.from('property_images').insert({
          property_id: propertyId,
          storage_path: path,
          url: publicUrl,
          position: 0,
        })
        if (insImg.error) throw insImg.error
      }

      // 5) Definir capa
      if (uploadedUrls.length > 0) {
        const cover = uploadedUrls[0]
        const upCov = await supabase.from('properties').update({ cover_image_url: cover }).eq('id', propertyId)
        if (upCov.error) throw upCov.error
      }

      // 6) Redirecionar automaticamente para o link por slug
      setSuccessSlug(slug)
      navigate(`/imovel/${slug}`)
    } catch (err: any) {
      setSubmitError(err.message ?? 'Erro ao publicar anúncio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Anunciar imóvel</h1>
      {successSlug ? (
        <div className="mt-2 p-3 rounded-md bg-green-50 text-green-800 text-sm">
          Anúncio publicado! Link: <a className="underline" href={`/imovel/${successSlug}`}>{window.location.origin}/imovel/{successSlug}</a>
        </div>
      ) : (
        <p className="text-gray-600 mt-1 text-sm">Preencha os dados e publique seu anúncio.</p>
      )}

      {/* Bloco: Descrição do imóvel */}
      <div className="mt-6 max-w-3xl mx-auto rounded-2xl shadow-sm overflow-hidden bg-white">
        <div className="px-6 py-4 md:py-5 bg-gray-50 font-semibold text-lg md:text-xl text-center">Dados do imóvel</div>
        <form onSubmit={onSubmit} className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 md:gap-y-8">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Título</label>
            <input name="title" required className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ex.: Apartamento moderno com varanda" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Cidade</label>
            <input name="city" required className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="São Paulo" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Bairro</label>
            <input name="neighborhood" required className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Moema" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Endereço</label>
            <input name="address" required className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Rua Exemplo, 123" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Negócio</label>
            <select name="business" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="sale">Venda</option>
              <option value="rent">Aluguel</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Tipo</label>
            <select name="type" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Preço (R$)</label>
            <input
              name="price"
              value={priceDisplay}
              onChange={handlePriceChange}
              inputMode="numeric"
              className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="R$ 320.000,00"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Área (m²)</label>
            <input name="area" type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="75" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Quartos</label>
            <input name="bedrooms" type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Banheiros</label>
            <input name="bathrooms" type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Vagas</label>
            <input name="parking" type="number" className="mt-2 w-full h-11 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="1" />
          </div>

          

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Descrição</label>
            <textarea name="description" rows={5} className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Destaques do imóvel..." />
          </div>

          {/* Bloco: Imagens */}
          <div className="md:col-span-2 mt-6 rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="px-6 py-4 md:py-5 bg-gray-50 font-semibold text-lg md:text-xl text-center">Imagens do imóvel</div>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="m-6 rounded-xl border border-dashed bg-white min-h-[160px] grid place-items-center p-8 text-center text-gray-600"
            >
              <div>
                <div className="text-3xl mb-1">⬆️</div>
                <div className="text-sm">Clique para enviar ou arraste e solte aqui (PNG, JPG)</div>
                <div className="mt-3">
                  <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
                  <button type="button" onClick={() => inputRef.current?.click()} className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm">Selecionar imagens</button>
                </div>
              </div>
            </div>

            {/* Pré-visualização */}
            {previews.length > 0 && (
              <div className="px-6 pb-6">
                <div className="text-sm font-medium mb-2">Pré-visualização</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previews.map((p) => (
                    <div key={p.name} className="relative rounded-lg overflow-hidden border bg-gray-50 aspect-[4/3]">
                      <img src={p.dataUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                      <button type="button" onClick={() => removePreview(p.name)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full px-2 py-0.5 text-xs">remover</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-4 pt-4 md:pt-6">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md border">Cancelar</button>
            <button type="submit" disabled={submitting} className={`bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}>{submitting ? 'Publicando...' : 'Publicar anúncio'}</button>
          </div>
        </form>
      </div>
      {submitError && <p className="mt-4 text-red-600 text-sm">{submitError}</p>}
    </section>
  )
}
