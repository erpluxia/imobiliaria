import { Link } from 'react-router-dom'

function Card({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-gray-200 bg-white hover:shadow-sm transition-shadow"
    >
      <div className="p-5">
        <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 w-12 h-12">
          {icon}
        </div>
        <div className="text-[15px] font-semibold text-gray-900 mb-1">{title}</div>
        <div className="text-sm text-gray-600 leading-5">{desc}</div>
      </div>
    </Link>
  )
}

const icons = {
  listings: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home w-6 h-6">
      <path d="M3 9.5L12 3l9 6.5" />
      <path d="M19 10.5V20a1 1 0 0 1-1 1h-4v-5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v5H6a1 1 0 0 1-1-1v-9.5" />
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users-icon lucide-users w-6 h-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M16 3.128a4 4 0 0 1 0 7.744" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  ),
  addUser: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus w-6 h-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
}

export default function AdminDashboard() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Admin</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          to="/admin/listings"
          icon={icons.listings}
          title="Imóveis"
          desc="Listar e gerenciar todos os anúncios publicados na plataforma."
        />
        <Card
          to="/admin/users"
          icon={icons.users}
          title="Usuários"
          desc="Listar, promover/demover administradores e bloquear/desbloquear contas."
        />
        <Card
          to="/admin/users/create"
          icon={icons.addUser}
          title="Criar usuário"
          desc="Cadastrar um novo usuário (cadastro público desativado)."
        />
      </div>
    </section>
  )
}
