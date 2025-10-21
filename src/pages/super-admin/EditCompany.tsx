import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import type { Company } from '../../types/company'

export default function EditCompany() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  useEffect(() => {
    if (!id) return
    loadCompany()
  }, [id])

  async function loadCompany() {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setCompany(data)
      setLogoPreview(data.logo_url)
      setFaviconPreview(data.favicon_url)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar empresa')
    } finally {
      setLoading(false)
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || !company) return
    
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      let logoUrl = company.logo_url
      let faviconUrl = company.favicon_url

      // Upload novo logo se houver
      if (logoFile) {
        const logoExt = logoFile.name.split('.').pop()
        const logoPath = `companies/logos/${crypto.randomUUID()}.${logoExt}`
        const { error: logoError } = await supabase.storage
          .from('company-assets')
          .upload(logoPath, logoFile)
        
        if (logoError) throw new Error('Erro ao fazer upload do logo')
        
        const { data: logoData } = supabase.storage
          .from('company-assets')
          .getPublicUrl(logoPath)
        logoUrl = logoData.publicUrl
      }

      // Upload novo favicon se houver
      if (faviconFile) {
        const faviconExt = faviconFile.name.split('.').pop()
        const faviconPath = `companies/favicons/${crypto.randomUUID()}.${faviconExt}`
        const { error: faviconError } = await supabase.storage
          .from('company-assets')
          .upload(faviconPath, faviconFile)
        
        if (faviconError) throw new Error('Erro ao fazer upload do favicon')
        
        const { data: faviconData } = supabase.storage
          .from('company-assets')
          .getPublicUrl(faviconPath)
        faviconUrl = faviconData.publicUrl
      }

      // Atualizar empresa
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          phone: formData.get('phone') as string || null,
          whatsapp: formData.get('whatsapp') as string || null,
          email: formData.get('email') as string || null,
          address: formData.get('address') as string || null,
          youtube_url: formData.get('youtube_url') as string || null,
          facebook_url: formData.get('facebook_url') as string || null,
          instagram_url: formData.get('instagram_url') as string || null,
          primary_color: formData.get('primary_color') as string,
          secondary_color: formData.get('secondary_color') as string,
          subscription_plan: formData.get('subscription_plan') as any,
          allow_user_listings: formData.get('allow_user_listings') === 'on',
          require_admin_approval: formData.get('require_admin_approval') === 'on',
          is_active: formData.get('is_active') === 'on',
        })
        .eq('id', id)

      if (updateError) throw updateError

      navigate('/super-admin/companies')
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar empresa')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => navigate('/super-admin/companies')}
            className="text-red-600 hover:underline mt-2"
          >
            Voltar para empresas
          </button>
        </div>
      </div>
    )
  }

  if (!company) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Empresa</h1>
        <p className="text-gray-600 mt-2">{company.name}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Informações Básicas */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={company.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL) *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                pattern="[a-z0-9-]+"
                defaultValue={company.slug}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={company.phone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                defaultValue={company.whatsapp || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={company.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={company.address || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociais</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-1">
                YouTube
              </label>
              <input
                type="url"
                id="youtube_url"
                name="youtube_url"
                defaultValue={company.youtube_url || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="url"
                id="facebook_url"
                name="facebook_url"
                defaultValue={company.facebook_url || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                id="instagram_url"
                name="instagram_url"
                defaultValue={company.instagram_url || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
          
          {/* Logo e Favicon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Empresa
              </label>
              <div className="flex items-start gap-4">
                {logoPreview && (
                  <div className="flex-shrink-0">
                    <img 
                      src={logoPreview} 
                      alt="Preview logo" 
                      className="w-32 h-32 object-contain border border-gray-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Deixe em branco para manter o logo atual
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <div className="flex items-start gap-4">
                {faviconPreview && (
                  <div className="flex-shrink-0">
                    <img 
                      src={faviconPreview} 
                      alt="Preview favicon" 
                      className="w-16 h-16 object-contain border border-gray-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/x-icon,image/png"
                    onChange={handleFaviconChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Deixe em branco para manter o favicon atual
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-1">
                Cor Primária
              </label>
              <input
                type="color"
                id="primary_color"
                name="primary_color"
                defaultValue={company.primary_color}
                className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 mb-1">
                Cor Secundária
              </label>
              <input
                type="color"
                id="secondary_color"
                name="secondary_color"
                defaultValue={company.secondary_color}
                className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="subscription_plan" className="block text-sm font-medium text-gray-700 mb-1">
                Plano de Assinatura
              </label>
              <select
                id="subscription_plan"
                name="subscription_plan"
                defaultValue={company.subscription_plan}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                defaultChecked={company.is_active}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Empresa ativa
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allow_user_listings"
                name="allow_user_listings"
                defaultChecked={company.allow_user_listings}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allow_user_listings" className="ml-2 block text-sm text-gray-700">
                Permitir que usuários criem anúncios
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="require_admin_approval"
                name="require_admin_approval"
                defaultChecked={company.require_admin_approval}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="require_admin_approval" className="ml-2 block text-sm text-gray-700">
                Anúncios requerem aprovação do admin
              </label>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/super-admin/companies')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
