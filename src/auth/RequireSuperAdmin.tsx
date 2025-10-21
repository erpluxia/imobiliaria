import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

interface RequireSuperAdminProps {
  children: ReactNode
}

export function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const { user, isSuperAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você precisa ser Super Admin para acessar esta página.</p>
          <a href="/" className="text-indigo-600 hover:underline">Voltar para Home</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
