import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useHome } from '../hooks/useHome'

const navItems = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/minha-casa', label: 'Minha casa', end: false },
  { to: '/app/bens', label: 'Bens', end: false },
  { to: '/app/garantias', label: 'Garantias', end: false },
  { to: '/app/manutencoes', label: 'Manutenções', end: false },
]

const MINHA_CASA_PATH = '/app/minha-casa'

export function PrivateLayout() {
  const { signOut } = useAuth()
  const { home, loading } = useHome()
  const location = useLocation()

  // Onboarding: sem casa cadastrada, qualquer área privada leva para
  // criar uma primeiro. É aqui que "criar sua casa" vira pré-requisito
  // para usar o resto do sistema, sem precisar de um assistente à parte.
  const needsOnboarding = !loading && !home && location.pathname !== MINHA_CASA_PATH

  return (
    <div className="private-layout">
      <aside className="sidebar">
        <span className="brand">CasaOS</span>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn-ghost" onClick={signOut}>
          Sair
        </button>
      </aside>
      <main className="content">
        {needsOnboarding ? <Navigate to={MINHA_CASA_PATH} replace /> : <Outlet />}
      </main>
    </div>
  )
}
