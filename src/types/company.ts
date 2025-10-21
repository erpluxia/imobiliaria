// Tipos TypeScript para o sistema multi-empresa

export interface Company {
  id: string
  name: string
  slug: string
  
  // Branding
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  
  // Contato
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  
  // Social Media
  youtube_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  
  // Configurações
  allow_user_listings: boolean
  require_admin_approval: boolean
  
  // Status
  is_active: boolean
  subscription_plan: 'basic' | 'premium' | 'enterprise'
  subscription_expires_at: string | null
  
  // Metadata
  created_at: string
  updated_at: string
}

export interface CompanyDomain {
  id: string
  company_id: string
  domain: string
  is_primary: boolean
  is_verified: boolean
  verification_token: string | null
  created_at: string
  company?: Company
}

export interface CompanySettings {
  company: Company
  domains: CompanyDomain[]
}
