export type LaunchProperty = {
  id: string
  title: string
  description: string
  city: string
  neighborhood: string
  address: string
  price_sale?: number
  price_rent?: number
  bedrooms: number
  bathrooms: number
  parking_spaces: number
  area_m2: number
  type: 'apartment' | 'house' | 'commercial'
  cover_image_url: string
  images: string[]
  features: string[]
  delivery_date?: string
  construction_company?: string
  status: 'pre-launch' | 'launching' | 'under-construction'
}

export const MOCK_LAUNCHES: LaunchProperty[] = [
  {
    id: '1',
    title: 'Residencial Golden Tower',
    description: 'Empreendimento de alto padrão com acabamento premium, localizado na região mais valorizada da cidade. Apartamentos com vista panorâmica, pé-direito duplo e tecnologia de automação residencial.',
    city: 'São Paulo',
    neighborhood: 'Jardim Europa',
    address: 'Rua Gabriel Monteiro da Silva, 1500',
    price_sale: 2850000,
    bedrooms: 4,
    bathrooms: 5,
    parking_spaces: 3,
    area_m2: 280,
    type: 'apartment',
    cover_image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Piscina Infinity', 'Spa', 'Wine Bar', 'Coworking', 'Cinema Privativo', 'Quadra Poliesportiva'],
    delivery_date: 'Dezembro 2026',
    construction_company: 'Cyrela',
    status: 'launching'
  },
  {
    id: '2',
    title: 'Condomínio Essence Park',
    description: 'Lançamento exclusivo com apenas 8 unidades por andar. Projeto assinado por renomado arquiteto, com foco em sustentabilidade e bem-estar. Localização privilegiada próximo ao Parque Ibirapuera.',
    city: 'São Paulo',
    neighborhood: 'Moema',
    address: 'Av. Ibirapuera, 2800',
    price_sale: 1950000,
    bedrooms: 3,
    bathrooms: 3,
    parking_spaces: 2,
    area_m2: 165,
    type: 'apartment',
    cover_image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Jardim Vertical', 'Pet Place', 'Bike Sharing', 'Rooftop Lounge', 'Academia Premium'],
    delivery_date: 'Junho 2027',
    construction_company: 'Tecnisa',
    status: 'pre-launch'
  },
  {
    id: '3',
    title: 'Mansão Contemporânea Vista Verde',
    description: 'Casa de luxo em condomínio fechado de alto padrão. Arquitetura contemporânea com amplos espaços integrados, piscina aquecida, sauna e área gourmet completa. Segurança 24h e infraestrutura completa.',
    city: 'São Paulo',
    neighborhood: 'Alphaville',
    address: 'Alameda dos Maracatins, 450',
    price_sale: 4200000,
    bedrooms: 5,
    bathrooms: 6,
    parking_spaces: 4,
    area_m2: 520,
    type: 'house',
    cover_image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Piscina Aquecida', 'Home Theater', 'Adega Climatizada', 'Elevador Privativo', 'Gerador'],
    delivery_date: 'Março 2026',
    construction_company: 'Brookfield',
    status: 'under-construction'
  },
  {
    id: '4',
    title: 'Corporate Plaza Premium',
    description: 'Empreendimento comercial AAA com certificação LEED. Lajes corporativas de alto padrão com infraestrutura completa para empresas de tecnologia e serviços. Heliponto e estacionamento com carregadores elétricos.',
    city: 'São Paulo',
    neighborhood: 'Faria Lima',
    address: 'Av. Brigadeiro Faria Lima, 3500',
    price_sale: 8500000,
    bedrooms: 0,
    bathrooms: 8,
    parking_spaces: 20,
    area_m2: 850,
    type: 'commercial',
    cover_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Heliponto', 'Auditório', 'Restaurante', 'Carregadores Elétricos', 'Segurança 24h', 'LEED Platinum'],
    delivery_date: 'Setembro 2025',
    construction_company: 'Tishman Speyer',
    status: 'launching'
  },
  {
    id: '5',
    title: 'Residencial Harmonia Zen',
    description: 'Conceito inovador de moradia sustentável com foco em qualidade de vida. Apartamentos com varandas amplas, horta comunitária orgânica e espaços de convivência integrados à natureza.',
    city: 'São Paulo',
    neighborhood: 'Vila Madalena',
    address: 'Rua Harmonia, 850',
    price_sale: 1250000,
    bedrooms: 2,
    bathrooms: 2,
    parking_spaces: 1,
    area_m2: 95,
    type: 'apartment',
    cover_image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Horta Orgânica', 'Yoga Deck', 'Bicicletário', 'Composteira', 'Energia Solar'],
    delivery_date: 'Novembro 2026',
    construction_company: 'Even',
    status: 'pre-launch'
  },
  {
    id: '6',
    title: 'Skyline Residence',
    description: 'Apartamentos de ultra luxo com vista 360° da cidade. Unidades de 3 e 4 suítes com acabamento importado, pé-direito de 3,5m e terraços privativos. O mais alto padrão de São Paulo.',
    city: 'São Paulo',
    neighborhood: 'Itaim Bibi',
    address: 'Rua Pedroso Alvarenga, 1200',
    price_sale: 3650000,
    bedrooms: 4,
    bathrooms: 5,
    parking_spaces: 4,
    area_m2: 320,
    type: 'apartment',
    cover_image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Concierge 24h', 'Sky Lounge', 'Piscina Coberta', 'Spa Completo', 'Adega Climatizada', 'Salão de Festas'],
    delivery_date: 'Agosto 2027',
    construction_company: 'Gafisa',
    status: 'launching'
  }
]
