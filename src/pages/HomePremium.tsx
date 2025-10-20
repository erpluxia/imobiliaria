import { Link } from 'react-router-dom'
import { FEATURED_PROPERTIES, TESTIMONIALS, BLOG_POSTS, STATS, NEIGHBORHOODS } from '../data/homeMock'

export default function HomePremium() {
  const formatPrice = (price?: number) => {
    if (!price) return 'Consulte'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&auto=format&fit=crop&q=80"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-left">
          <div className="max-w-3xl">
            <div className="inline-block mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-sm font-bold px-6 py-2 rounded-full uppercase tracking-wider">
                Imóveis de Alto Padrão
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight animate-slide-up">
              Encontre o
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                Imóvel Perfeito
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
              Mais de 15 anos conectando pessoas aos seus sonhos. 
              Excelência, transparência e resultados excepcionais.
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Cidade, bairro ou endereço..."
                    className="w-full bg-white/90 text-black placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <select className="w-full bg-white/90 text-black rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option>Comprar</option>
                  <option>Alugar</option>
                </select>
                <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/50 hover:scale-105">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Imóveis', value: STATS.properties, icon: '🏢' },
              { label: 'Clientes Satisfeitos', value: STATS.clients, icon: '😊' },
              { label: 'Anos de Mercado', value: STATS.years, icon: '⭐' },
              { label: 'Satisfação', value: STATS.satisfaction, icon: '💯' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-500 font-semibold uppercase tracking-wider text-sm">
              Destaques
            </span>
            <h2 className="text-5xl font-bold text-white mt-3 mb-4">
              Imóveis em Destaque
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Seleção exclusiva dos melhores imóveis disponíveis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PROPERTIES.map((property) => (
              <Link
                key={property.id}
                to={`/imovel/${property.slug}`}
                className="group relative bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.cover_image_url}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  
                  {property.is_launch && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                        LANÇAMENTO
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      {formatPrice(property.price_sale || property.price_rent)}
                      {property.price_rent && <span className="text-sm font-normal">/mês</span>}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {property.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <svg className="w-4 h-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.neighborhood}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-800">
                    <span>{property.area_m2}m²</span>
                    <span>•</span>
                    <span>{property.bedrooms} quartos</span>
                    <span>•</span>
                    <span>{property.bathrooms} banh.</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/resultados"
              className="inline-flex items-center bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-amber-500/50 hover:scale-105"
            >
              Ver Todos os Imóveis
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-500 font-semibold uppercase tracking-wider text-sm">
              Localização
            </span>
            <h2 className="text-5xl font-bold text-white mt-3 mb-4">
              Bairros Populares
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore as regiões mais procuradas de São Paulo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {NEIGHBORHOODS.map((neighborhood, idx) => (
              <Link
                key={idx}
                to={`/resultados?city=${neighborhood.name}`}
                className="group relative h-48 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-amber-500/20 transition-all hover:-translate-y-1"
              >
                <img
                  src={neighborhood.image}
                  alt={neighborhood.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                    {neighborhood.name}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {neighborhood.count} imóveis
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-500 font-semibold uppercase tracking-wider text-sm">
              Depoimentos
            </span>
            <h2 className="text-5xl font-bold text-white mt-3 mb-4">
              O Que Dizem Nossos Clientes
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Histórias reais de quem realizou seus sonhos conosco
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 border border-gray-800 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-3 border-2 border-amber-500"
                  />
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-500 font-semibold uppercase tracking-wider text-sm">
              Blog
            </span>
            <h2 className="text-5xl font-bold text-white mt-3 mb-4">
              Últimas Notícias
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Fique por dentro das novidades do mercado imobiliário
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="group bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime} de leitura</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {post.excerpt}
                  </p>
                  <button className="text-amber-500 font-semibold hover:text-amber-400 transition-colors inline-flex items-center">
                    Ler mais
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-500 to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-black mb-6">
            Pronto para Encontrar seu Imóvel?
          </h2>
          <p className="text-xl text-black/80 mb-10">
            Nossa equipe está pronta para ajudar você a realizar seus sonhos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/resultados"
              className="inline-flex items-center justify-center bg-black hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Explorar Imóveis
            </Link>
            <a
              href="https://wa.me/5511940569156"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-black font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar com Corretor
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
