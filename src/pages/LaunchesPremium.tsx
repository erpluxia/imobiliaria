import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_LAUNCHES, type LaunchProperty } from '../data/launchesMock'

export default function LaunchesPremium() {
  const [filter, setFilter] = useState<'all' | 'pre-launch' | 'launching' | 'under-construction'>('all')
  const [selectedProperty, setSelectedProperty] = useState<LaunchProperty | null>(null)

  const filteredLaunches = filter === 'all' 
    ? MOCK_LAUNCHES 
    : MOCK_LAUNCHES.filter(p => p.status === filter)

  const formatPrice = (price?: number) => {
    if (!price) return 'Consulte'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'pre-launch': 'Pré-Lançamento',
      'launching': 'Lançamento',
      'under-construction': 'Em Construção'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pre-launch': 'from-purple-600 to-purple-800',
      'launching': 'from-amber-500 to-yellow-600',
      'under-construction': 'from-blue-600 to-blue-800'
    }
    return colors[status as keyof typeof colors] || 'from-gray-600 to-gray-800'
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&auto=format&fit=crop&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-block mb-6">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              Exclusivo
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Lançamentos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              Premium
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Descubra os empreendimentos mais exclusivos e sofisticados. 
            Oportunidades únicas para investidores exigentes.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                {MOCK_LAUNCHES.length}
              </div>
              <div className="text-sm text-gray-400 mt-2 uppercase tracking-wide">Lançamentos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                R$ 2.8M
              </div>
              <div className="text-sm text-gray-400 mt-2 uppercase tracking-wide">Preço Médio</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                100%
              </div>
              <div className="text-sm text-gray-400 mt-2 uppercase tracking-wide">Alto Padrão</div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </section>

      {/* Filters */}
      <section className="border-y border-gray-800 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'pre-launch', label: 'Pré-Lançamento' },
              { value: 'launching', label: 'Lançamento' },
              { value: 'under-construction', label: 'Em Construção' }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as any)}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  filter === item.value
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLaunches.map((property) => (
            <div
              key={property.id}
              className="group relative bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.cover_image_url}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-block bg-gradient-to-r ${getStatusColor(property.status)} text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg`}>
                    {getStatusLabel(property.status)}
                  </span>
                </div>

                {/* Price */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(property.price_sale)}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {property.area_m2}m² • {property.bedrooms} quartos
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {property.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.neighborhood}, {property.city}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Delivery */}
                {property.delivery_date && (
                  <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-800">
                    <span className="text-gray-400">Entrega prevista:</span>
                    <span className="text-amber-400 font-semibold">{property.delivery_date}</span>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => setSelectedProperty(property)}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-105"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLaunches.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block bg-gray-900 rounded-2xl p-12 border border-gray-800">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Nenhum lançamento encontrado</h3>
              <p className="text-gray-400 mb-6">Ajuste os filtros ou volte em breve para novos empreendimentos</p>
              <button
                onClick={() => setFilter('all')}
                className="inline-block bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all"
              >
                Ver Todos
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-800 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Não encontrou o que procura?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Nossa equipe está pronta para apresentar oportunidades exclusivas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/resultados"
              className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl transition-all border border-gray-700"
            >
              Ver Todos os Imóveis
            </Link>
            <a
              href="https://wa.me/5511940569156"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-amber-500/50"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar com Especialista
            </a>
          </div>
        </div>
      </section>

      {/* Modal de Detalhes */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedProperty(null)}>
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-80">
              <img src={selectedProperty.cover_image_url} alt={selectedProperty.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedProperty.title}</h2>
                <p className="text-amber-400 text-xl font-bold">{formatPrice(selectedProperty.price_sale)}</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-3xl font-bold text-amber-400">{selectedProperty.area_m2}m²</div>
                  <div className="text-sm text-gray-400 mt-1">Área Total</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-3xl font-bold text-amber-400">{selectedProperty.bedrooms}</div>
                  <div className="text-sm text-gray-400 mt-1">Quartos</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-3xl font-bold text-amber-400">{selectedProperty.parking_spaces}</div>
                  <div className="text-sm text-gray-400 mt-1">Vagas</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Sobre o Empreendimento</h3>
                <p className="text-gray-300 leading-relaxed">{selectedProperty.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Diferenciais</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedProperty.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="https://wa.me/5511940569156"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold py-4 rounded-xl transition-all text-center"
                >
                  Agendar Visita
                </a>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all border border-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
