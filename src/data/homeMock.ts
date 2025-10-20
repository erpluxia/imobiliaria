export type FeaturedProperty = {
  id: string
  title: string
  description: string
  city: string
  neighborhood: string
  price_sale?: number
  price_rent?: number
  bedrooms: number
  bathrooms: number
  area_m2: number
  type: 'apartment' | 'house' | 'commercial'
  cover_image_url: string
  is_launch: boolean
  is_featured: boolean
  slug: string
}

export type Testimonial = {
  id: string
  name: string
  role: string
  content: string
  avatar: string
  rating: number
}

export type BlogPost = {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  date: string
  readTime: string
}

export const FEATURED_PROPERTIES: FeaturedProperty[] = [
  {
    id: '1',
    title: 'Cobertura Duplex Vista Panorâmica',
    description: 'Cobertura de luxo com 360m², terraço gourmet, piscina privativa e vista deslumbrante da cidade.',
    city: 'São Paulo',
    neighborhood: 'Jardins',
    price_sale: 4500000,
    bedrooms: 4,
    bathrooms: 5,
    area_m2: 360,
    type: 'apartment',
    cover_image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
    is_launch: true,
    is_featured: true,
    slug: 'cobertura-duplex-jardins'
  },
  {
    id: '2',
    title: 'Casa Moderna Condomínio Fechado',
    description: 'Casa de alto padrão com arquitetura contemporânea, 4 suítes, piscina aquecida e área gourmet completa.',
    city: 'São Paulo',
    neighborhood: 'Alphaville',
    price_sale: 3200000,
    bedrooms: 4,
    bathrooms: 5,
    area_m2: 450,
    type: 'house',
    cover_image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80',
    is_launch: false,
    is_featured: true,
    slug: 'casa-moderna-alphaville'
  },
  {
    id: '3',
    title: 'Apartamento Novo Próximo ao Metrô',
    description: 'Apartamento moderno de 3 dormitórios, varanda gourmet e vaga dupla. Pronto para morar.',
    city: 'São Paulo',
    neighborhood: 'Vila Mariana',
    price_sale: 980000,
    bedrooms: 3,
    bathrooms: 2,
    area_m2: 95,
    type: 'apartment',
    cover_image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
    is_launch: false,
    is_featured: true,
    slug: 'apartamento-vila-mariana'
  },
  {
    id: '4',
    title: 'Loft Industrial Reformado',
    description: 'Loft charmoso com pé-direito alto, acabamento premium e localização privilegiada.',
    city: 'São Paulo',
    neighborhood: 'Pinheiros',
    price_rent: 6500,
    bedrooms: 1,
    bathrooms: 1,
    area_m2: 75,
    type: 'apartment',
    cover_image_url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c08e?w=1200&auto=format&fit=crop&q=80',
    is_launch: false,
    is_featured: true,
    slug: 'loft-pinheiros'
  }
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Silva',
    role: 'Compradora',
    content: 'Experiência excepcional! A equipe foi extremamente profissional e me ajudou a encontrar o apartamento perfeito. Recomendo muito!',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5
  },
  {
    id: '2',
    name: 'João Santos',
    role: 'Investidor',
    content: 'Excelente atendimento e transparência em todo o processo. Consegui um ótimo investimento com a ajuda da AdjaImobi.',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5
  },
  {
    id: '3',
    name: 'Ana Costa',
    role: 'Locatária',
    content: 'Processo rápido e sem complicações. Encontrei meu apartamento ideal em menos de uma semana. Equipe muito atenciosa!',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    role: 'Vendedor',
    content: 'Vendi minha casa em tempo recorde! O trabalho de divulgação e o atendimento foram impecáveis.',
    avatar: 'https://i.pravatar.cc/150?img=13',
    rating: 5
  }
]

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Guia Completo: Como Comprar seu Primeiro Imóvel',
    excerpt: 'Descubra todos os passos necessários para realizar o sonho da casa própria com segurança e planejamento.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
    category: 'Dicas',
    date: '15 Out 2025',
    readTime: '8 min'
  },
  {
    id: '2',
    title: 'Tendências do Mercado Imobiliário em 2025',
    excerpt: 'Análise das principais tendências e oportunidades do mercado imobiliário para este ano.',
    image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&auto=format&fit=crop&q=80',
    category: 'Mercado',
    date: '10 Out 2025',
    readTime: '6 min'
  },
  {
    id: '3',
    title: 'Valorização Imobiliária: Regiões em Alta',
    excerpt: 'Conheça os bairros que estão em maior valorização e as melhores oportunidades de investimento.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    category: 'Investimento',
    date: '5 Out 2025',
    readTime: '10 min'
  }
]

export const STATS = {
  properties: '2.500+',
  clients: '5.000+',
  years: '15+',
  satisfaction: '98%'
}

export const NEIGHBORHOODS = [
  { name: 'Jardins', count: 245, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&auto=format&fit=crop&q=80' },
  { name: 'Vila Mariana', count: 189, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&auto=format&fit=crop&q=80' },
  { name: 'Pinheiros', count: 312, image: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=400&auto=format&fit=crop&q=80' },
  { name: 'Moema', count: 156, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&auto=format&fit=crop&q=80' },
  { name: 'Itaim Bibi', count: 198, image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&auto=format&fit=crop&q=80' },
  { name: 'Alphaville', count: 134, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=80' }
]
