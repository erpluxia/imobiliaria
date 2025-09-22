import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function MyListings() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [list, setList] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        if (!user) throw new Error('Você precisa estar logado.')
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, city, neighborhood, business, price, cover_image_url, slug, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)
        if (error) throw error
        if (active) setList(data ?? [])
      } catch (e: any) {
        if (active) setError(e.message ?? 'Erro ao carregar seus imóveis')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  async function handleDelete(property: any) {
    if (!confirm(`Tem certeza que deseja excluir o imóvel "${property.title}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(property.id)
    try {
      // 1) Carregar imagens relacionadas
      const { data: imgs, error: imgErr } = await supabase
        .from('property_images')
        .select('storage_path')
        .eq('property_id', property.id)
      if (imgErr) throw imgErr

      // 2) Remover do Storage, se houver paths
      const paths = (imgs ?? []).map((r) => r.storage_path).filter(Boolean) as string[]
      if (paths.length > 0) {
        const { error: stErr } = await supabase.storage.from('property-images').remove(paths)
        if (stErr) throw stErr
      }

      // 3) Remover linhas de imagens
      const { error: delImgsErr } = await supabase.from('property_images').delete().eq('property_id', property.id)
      if (delImgsErr) throw delImgsErr

      // 4) Remover o imóvel
      const { error: delPropErr } = await supabase.from('properties').delete().eq('id', property.id)
      if (delPropErr) throw delPropErr

      // 5) Atualizar lista local
      setList((prev) => prev.filter((it) => it.id !== property.id))
    } catch (e: any) {
      alert(e.message ?? 'Erro ao excluir imóvel')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Meus Imóveis</h1>
      </div>

      {loading && <div className="text-gray-600">Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && list.length === 0 && (
        <div className="text-gray-600">
          <p>Você ainda não anunciou nenhum imóvel.</p>
          <div className="mt-3">
            <Link to="/anunciar" className="inline-flex items-center gap-2 border rounded-md px-4 py-2 text-sm bg-white hover:bg-gray-50">
              + Criar anúncio
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {list.map((p) => (
          <article key={p.id} className="bg-white border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px]">
              <div className="relative">
                <div className="relative aspect-[16/10] bg-gray-100">
                  <img src={p.cover_image_url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80'} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-4">
                <Link to={`/imovel/${p.slug || p.id}`} className="font-semibold text-gray-900 hover:underline line-clamp-1">{p.title}</Link>
                <div className="text-sm text-gray-600 line-clamp-1">{p.neighborhood}, {p.city}</div>
                <div className="mt-2 text-[13px] text-gray-700 inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-white">{p.business === 'rent' ? 'Aluguel' : 'Venda'}</span>
                  <span className="font-semibold">{typeof p.price === 'number' ? brl.format(p.price) : '—'}</span>
                </div>
              </div>
              <div className="border-t md:border-t-0 md:border-l p-4 flex items-center md:items-end justify-between md:flex-col gap-3">
                <Link to={`/meus-imoveis/${p.id}/editar`} className="inline-flex items-center justify-center border rounded-md px-4 py-2 text-sm hover:bg-gray-50">Editar</Link>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm text-white ${deletingId === p.id ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {deletingId === p.id ? 'Excluindo...' : 'Excluir definitivamente'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
