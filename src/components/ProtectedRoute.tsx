import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Isto é conveniência de UX, não segurança: a proteção de verdade
// está na Row Level Security do banco. Mesmo que alguém force a
// exibição desta rota no navegador, nenhuma query volta com dados.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="page-loading">Carregando...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
