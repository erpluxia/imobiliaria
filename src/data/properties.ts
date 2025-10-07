export type Property = {
  id: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  // novo modelo de preços/modalidades
  is_for_sale: boolean;
  is_for_rent: boolean;
  price_sale?: number; // à vista
  price_rent?: number; // por mês
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number; // m²
  type: 'apartment' | 'house' | 'commercial';
  latitude: number;
  longitude: number;
  images: string[];
  features: string[];
};

export const PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Apartamento moderno com varanda gourmet',
    description: 'Apartamento arejado, face norte, próximo ao metrô. Condomínio com lazer completo.',
    city: 'São Paulo',
    neighborhood: 'Vila Mariana',
    address: 'Rua Domingos de Morais, 1234',
    is_for_sale: true,
    is_for_rent: false,
    price_sale: 850000,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    area: 72,
    type: 'apartment',
    latitude: -23.588,
    longitude: -46.634,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c08e?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Varanda', 'Piscina', 'Academia']
  },
  {
    id: '2',
    title: 'Casa ampla com quintal e churrasqueira',
    description: 'Excelente incidência de luz natural, rua tranquila e arborizada.',
    city: 'Rio de Janeiro',
    neighborhood: 'Tijuca',
    address: 'Rua Conde de Bonfim, 500',
    is_for_sale: false,
    is_for_rent: true,
    price_rent: 4500,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 180,
    type: 'house',
    latitude: -22.925,
    longitude: -43.236,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154523-17ea44a9c413?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687920-4ce8c559d8df?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687920-11d0871f6d5f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154284-1e9a8f2adf49?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Quintal', 'Churrasqueira']
  },
  {
    id: '3',
    title: 'Studio mobiliado próximo à Faria Lima',
    description: 'Perfeito para quem busca praticidade e mobilidade. Pronto para morar.',
    city: 'São Paulo',
    neighborhood: 'Pinheiros',
    address: 'Av. Faria Lima, 2000',
    is_for_sale: false,
    is_for_rent: true,
    price_rent: 3800,
    bedrooms: 1,
    bathrooms: 1,
    parking: 1,
    area: 35,
    type: 'apartment',
    latitude: -23.570,
    longitude: -46.693,
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d95?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-c03a22713fd6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop&q=80',
    ],
    features: ['Mobiliado', 'Portaria 24h']
  }
];

export type Query = {
  q?: string;
  city?: string;
  business?: 'rent' | 'sale';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
};

export function filterProperties(list: Property[], query: Query): Property[] {
  return list.filter((p) => {
    if (query.q) {
      const t = (p.title + ' ' + p.description + ' ' + p.neighborhood + ' ' + p.city).toLowerCase();
      if (!t.includes(query.q.toLowerCase())) return false;
    }
    if (query.city && query.city !== '' && p.city !== query.city) return false;
    // Modalidades e faixa de preço
    if (query.business === 'sale') {
      if (!p.is_for_sale) return false;
      if (typeof query.minPrice === 'number' && (p.price_sale ?? Infinity) < query.minPrice) return false;
      if (typeof query.maxPrice === 'number' && (p.price_sale ?? -Infinity) > query.maxPrice) return false;
    } else if (query.business === 'rent') {
      if (!p.is_for_rent) return false;
      if (typeof query.minPrice === 'number' && (p.price_rent ?? Infinity) < query.minPrice) return false;
      if (typeof query.maxPrice === 'number' && (p.price_rent ?? -Infinity) > query.maxPrice) return false;
    } else {
      // Sem filtro: aceitar se bate em venda OU aluguel
      let ok = false;
      if (p.is_for_sale) {
        const ps = p.price_sale ?? Infinity;
        const okSale = (typeof query.minPrice !== 'number' || ps >= query.minPrice) && (typeof query.maxPrice !== 'number' || ps <= query.maxPrice);
        if (okSale) ok = true;
      }
      if (!ok && p.is_for_rent) {
        const pr = p.price_rent ?? Infinity;
        const okRent = (typeof query.minPrice !== 'number' || pr >= query.minPrice) && (typeof query.maxPrice !== 'number' || pr <= query.maxPrice);
        if (okRent) ok = true;
      }
      if (!ok) return false;
    }
    if (typeof query.bedrooms === 'number' && p.bedrooms < query.bedrooms) return false;
    return true;
  });
}

// ====== Helpers para anúncios locais (fake) ======
const STORAGE_KEY = 'user_properties';

export function getUserProperties(): Property[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as Property[];
  } catch {
    return [];
  }
}

export function saveUserProperty(p: Property) {
  if (typeof window === 'undefined') return;
  const curr = getUserProperties();
  const next = [...curr, p];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getAllProperties(): Property[] {
  return [...PROPERTIES, ...getUserProperties()];
}

export function findPropertyById(id: string): Property | undefined {
  return getAllProperties().find((x) => x.id === id);
}
