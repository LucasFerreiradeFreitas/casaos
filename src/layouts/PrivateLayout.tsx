import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Home, Package, ShieldCheck, Wrench, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useHome } from '../hooks/useHome'

const navItems = [
  { to: '/app', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/app/minha-casa', label: 'Minha casa', end: false, icon: Home },
  { to: '/app/bens', label: 'Bens', end: false, icon: Package },
  { to: '/app/garantias', label: 'Garantias', end: false, icon: ShieldCheck },
  { to: '/app/manutencoes', label: 'Manutenções', end: false, icon: Wrench },
]

const MINHA_CASA_PATH = '/app/minha-casa'

export function PrivateLayout() {
  const { signOut } = useAuth()
  const { home, loading } = useHome()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const needsOnboarding = !loading && !home && location.pathname !== MINHA_CASA_PATH

  // Fecha a gaveta sempre que a rota muda (ex: usuário tocou em um link).
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Fecha com Esc, um comportamento esperado de qualquer painel sobreposto.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="private-layout">
      <header className="mobile-topbar">
        <span className="brand">CasaOS</span>
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="sidebar-header">
          <span className="brand">CasaOS</span>
          <button
            type="button"
            className="menu-toggle sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <button type="button" className="btn-ghost" onClick={signOut}>
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </aside>

      <main className="content">
        {needsOnboarding ? <Navigate to={MINHA_CASA_PATH} replace /> : <Outlet />}
      </main>
    </div>
  )
}
