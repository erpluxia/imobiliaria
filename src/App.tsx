import { Routes, Route, Link, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import HomePremium from './pages/HomePremium'
import Results from './pages/Results'
import Launches from './pages/Launches'
import LaunchesPremium from './pages/LaunchesPremium'
import PropertyDetails from './pages/PropertyDetails'
import CreateListing from './pages/CreateListing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Profile from './pages/Profile'
import MyListings from './pages/MyListings'
import EditListing from './pages/EditListing'
import { useAuth } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { RequireAdmin } from './auth/RequireAdmin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminListings from './pages/admin/AdminListings'
import AdminUsers from './pages/admin/AdminUsers'
import CreateUser from './pages/admin/CreateUser'
import { supabase } from './lib/supabaseClient'
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton'

function App() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [allowSignups, setAllowSignups] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('allow_signups')
          .eq('id', 1)
          .single()
        if (error) throw error
        if (active) setAllowSignups(Boolean(data?.allow_signups))
      } catch (_) {
        if (active) setAllowSignups(false)
      }
    }
    loadSettings()
    return () => { active = false }
  }, [])
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-black border-b border-black">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logonovo.png" alt="AdjaImobi" className="w-auto transform origin-left scale-[1.15] md:scale-[1.25]" style={{ height: '3rem' }} />
            <span className="sr-only">AdjaImobi</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-white">
            <NavLink
              to="/"
              className={({isActive}) => `hover:text-[#D4AF37] ${isActive ? 'text-[#D4AF37] font-semibold' : 'text-white'}`}
            >Home</NavLink>
            <NavLink
              to="/resultados"
              className={({isActive}) => `hover:text-[#D4AF37] ${isActive ? 'text-[#D4AF37] font-semibold' : 'text-white'}`}
            >Resultados</NavLink>
            <NavLink
              to="/lancamentos"
              className={({isActive}) => `hover:text-[#D4AF37] ${isActive ? 'text-[#D4AF37] font-semibold' : 'text-white'}`}
            >Lançamentos</NavLink>
            <a
              href="https://www.youtube.com/@adjaimobiliariaeadministra7447"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D4AF37] text-white"
            >Canal</a>
          </nav>
          {/* Desktop (>= sm) ações à direita */}
          <div className="hidden sm:flex items-center gap-2">
            {!user && (
              <Link
                to="/login"
                className="inline-flex border px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
              >Entrar</Link>
            )}
            {user && (
              <>
                <Link to="/perfil" className="inline-flex border border-gray-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gray-800 text-xs sm:text-sm">Meu Perfil</Link>
                <Link to="/meus-imoveis" className="inline-flex border border-gray-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gray-800 text-xs sm:text-sm">Meus Imóveis</Link>
                {isAdmin && (
                  <Link to="/admin" className="inline-flex border border-[#D4AF37] text-[#D4AF37] px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-[#D4AF37] hover:text-black text-xs sm:text-sm">Admin</Link>
                )}
                <Link to="/anunciar" className="inline-flex bg-[#D4AF37] text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-[#c7a233] text-xs sm:text-sm">Anunciar imóvel</Link>
                <button
                  title="Sair"
                  aria-label="Sair"
                  className="inline-flex items-center justify-center w-9 h-9 sm:w-9 sm:h-9 rounded-full border border-red-400 text-red-400 hover:bg-red-900/20"
                  onClick={async () => { await signOut(); navigate('/') }}
                >
                  {/* Ícone Logout (seta saindo da porta) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    {/* Porta */}
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                    {/* Seta saindo */}
                    <path d="M9 12h11" />
                    <path d="M17 8l4 4-4 4" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Mobile (< sm) ações à direita */}
          <div className="flex sm:hidden items-center gap-2 text-white">
            {!user && (
              <>
                <Link to="/login" className="inline-flex border border-[#D4AF37] text-[#D4AF37] px-3 py-1.5 rounded-md hover:bg-[#D4AF37] hover:text-black text-xs">Entrar</Link>
                <div className="relative">
                  <button
                    aria-label="Menu"
                    title="Menu"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-500 text-white hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(v => !v)}
                  >
                    {/* Ícone Hamburguer */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </button>
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-md py-1 z-20">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Home</Link>
                      <Link to="/resultados" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Resultados</Link>
                      <Link to="/lancamentos" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Lançamentos</Link>
                      <a href="https://www.youtube.com/@adjaimobiliariaeadministra7447" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Canal</a>
                    </div>
                  )}
                </div>
              </>
            )}
            {user && (
              <>
                <Link to="/anunciar" className="inline-flex bg-[#D4AF37] text-black px-3 py-1.5 rounded-md hover:bg-[#c7a233] text-xs">Anunciar imóvel</Link>
                <div className="relative">
                  <button
                    aria-label="Menu"
                    title="Menu"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-500 text-white hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(v => !v)}
                  >
                    {/* Ícone Hamburguer */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </button>
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-md py-1 z-20">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Home</Link>
                      <Link to="/resultados" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Resultados</Link>
                      <Link to="/lancamentos" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Lançamentos</Link>
                      <a href="https://www.youtube.com/@adjaimobiliariaeadministra7447" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Canal</a>
                      <div className="border-t my-1"></div>
                      <Link to="/meus-imoveis" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Meus Imóveis</Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-amber-700 hover:bg-amber-50">Admin</Link>
                      )}
                      <Link to="/perfil" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Meu Perfil</Link>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={async () => { setMobileMenuOpen(false); await signOut(); navigate('/') }}
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home-premium" element={<HomePremium />} />
          <Route path="/resultados" element={<Results />} />
          <Route path="/lancamentos" element={<Launches />} />
          <Route path="/lancamentos-premium" element={<LaunchesPremium />} />
          {/* Rota por slug (nova) e fallback por id (legado) */}
          <Route path="/imovel/:slug" element={<PropertyDetails />} />
          <Route path="/imovel/id/:id" element={<PropertyDetails />} />
          <Route path="/anunciar" element={<RequireAuth><CreateListing /></RequireAuth>} />
          <Route path="/meus-imoveis" element={<RequireAuth><MyListings /></RequireAuth>} />
          <Route path="/meus-imoveis/:id/editar" element={<RequireAuth><EditListing /></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/cadastro" element={allowSignups ? <SignUp /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          {/* Admin */}
          <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminDashboard /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/listings" element={<RequireAuth><RequireAdmin><AdminListings /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth><RequireAdmin><AdminUsers /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/users/create" element={<RequireAuth><RequireAdmin><CreateUser /></RequireAdmin></RequireAuth>} />
        </Routes>
      </main>
      <footer className="border-t border-black py-8 text-center text-sm bg-black text-white">
        © {new Date().getFullYear()} AdjaImobi — Todos os direitos reservados.
        {' '}• desenvolvido por{' '}
        <a
          href="https://erpluxia.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4AF37] hover:underline"
        >
          Erpluxia
        </a>
        .
      </footer>
      <FloatingWhatsAppButton phone="5511940569156" />
    </div>
  )
}

export default App
