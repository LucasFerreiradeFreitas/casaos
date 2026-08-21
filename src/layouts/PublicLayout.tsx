import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/" className="brand">
          CasaOS
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
