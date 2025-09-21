import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import PropertyDetails from './pages/PropertyDetails'
import CreateListing from './pages/CreateListing'

function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-indigo-600">Imobi</span><span className="text-gray-900">Finder</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" className={({isActive}) => `hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-semibold' : ''}`}>Home</NavLink>
            <NavLink to="/resultados" className={({isActive}) => `hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-semibold' : ''}`}>Resultados</NavLink>
          </nav>
          <Link to="/anunciar" className="inline-flex bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-700 text-xs sm:text-sm">Anunciar imóvel</Link>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resultados" element={<Results />} />
          <Route path="/imovel/:id" element={<PropertyDetails />} />
          <Route path="/anunciar" element={<CreateListing />} />
        </Routes>
      </main>
      <footer className="border-t py-8 text-center text-sm text-gray-500 bg-white/60">© {new Date().getFullYear()} ImobiFinder — Todos os direitos reservados.</footer>
    </div>
  )
}

export default App
