import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Results from './pages/Results'
import PropertyDetails from './pages/PropertyDetails'
import CreateListing from './pages/CreateListing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { useAuth } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'

function App() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-indigo-600">Adja</span><span className="text-gray-900">Imobi</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <NavLink to="/" className={({isActive}) => `hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-semibold' : ''}`}>Home</NavLink>
            <NavLink to="/resultados" className={({isActive}) => `hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-semibold' : ''}`}>Resultados</NavLink>
          </nav>
          {/* Desktop (>= sm) ações à direita */}
          <div className="hidden sm:flex items-center gap-2">
            {!user && (
              <Link to="/login" className="inline-flex border border-indigo-600 text-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-50 text-xs sm:text-sm">Entrar</Link>
            )}
            {user && (
              <>
                <Link to="/perfil" className="inline-flex border border-gray-300 text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gray-50 text-xs sm:text-sm">Meu Perfil</Link>
                <Link to="/anunciar" className="inline-flex bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-700 text-xs sm:text-sm">Anunciar imóvel</Link>
                <button
                  title="Sair"
                  aria-label="Sair"
                  className="inline-flex items-center justify-center w-9 h-9 sm:w-9 sm:h-9 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
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
          <div className="flex sm:hidden items-center gap-2">
            {!user && (
              <Link to="/login" className="inline-flex border border-indigo-600 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-50 text-xs">Entrar</Link>
            )}
            {user && (
              <>
                <Link to="/anunciar" className="inline-flex bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-xs">Anunciar imóvel</Link>
                <div className="relative">
                  <button
                    aria-label="Menu"
                    title="Menu"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(v => !v)}
                  >
                    {/* Ícone Hamburguer */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </button>
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-md py-1 z-20">
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
          <Route path="/resultados" element={<Results />} />
          {/* Rota por slug (nova) e fallback por id (legado) */}
          <Route path="/imovel/:slug" element={<PropertyDetails />} />
          <Route path="/imovel/id/:id" element={<PropertyDetails />} />
          <Route path="/anunciar" element={<RequireAuth><CreateListing /></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/cadastro" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <footer className="border-t py-8 text-center text-sm text-gray-500 bg-white/60">© {new Date().getFullYear()} AdjaImobi — Todos os direitos reservados.</footer>
    </div>
  )
}

export default App
