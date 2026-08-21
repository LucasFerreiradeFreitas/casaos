import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <section className="landing">
      <h1>Sua casa, organizada em um só lugar.</h1>
      <p>
        Guarde os bens, garantias e manutenções da sua casa em um lugar só,
        sem depender de planilhas ou pastas de e-mail.
      </p>
      <div className="landing-actions">
        <Link to="/cadastro" className="btn-primary">
          Criar conta
        </Link>
        <Link to="/login" className="btn-secondary">
          Entrar
        </Link>
      </div>
    </section>
  )
}
