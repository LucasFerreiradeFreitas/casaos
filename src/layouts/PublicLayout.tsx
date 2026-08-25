import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/" className="brand">
          CasaOS
        </Link>
        <Link to="/login" className="header-login-link">
          Entrar
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
