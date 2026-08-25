import { Link } from 'react-router-dom'
import { Package, ShieldCheck, Wrench, LayoutDashboard } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Criar sua casa',
    description: 'Dê um nome pra sua residência — é o ponto de partida de tudo.',
  },
  {
    number: '2',
    title: 'Adicionar seus bens',
    description: 'Eletrônicos, móveis, eletrodomésticos — o que for importante ter registrado.',
  },
  {
    number: '3',
    title: 'Registrar garantias',
    description: 'Vincule cada garantia ao bem certo, com a data de vencimento.',
  },
  {
    number: '4',
    title: 'Acompanhar manutenções',
    description: 'Marque o que precisa de cuidado, com ou sem prazo definido.',
  },
]

const features = [
  {
    icon: Package,
    title: 'Bens',
    description: 'Anote o que você tem, quando comprou e quanto custou.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantias',
    description: 'Saiba até quando cada garantia vale, sem procurar nota fiscal perdida.',
  },
  {
    icon: Wrench,
    title: 'Manutenções',
    description: 'Não perca a hora de cuidar do que precisa de atenção.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Veja num só lugar o que está vencendo ou atrasado.',
  },
]

export function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-headline">Sua casa, organizada em um só lugar.</h1>
          <p className="hero-subhead">
            Guarde os bens, garantias e manutenções da sua casa sem depender de planilha, pasta
            de e-mail ou caixa de sapato cheia de nota fiscal.
          </p>
          <div className="landing-actions">
            <Link to="/cadastro" className="btn-primary">
              Criar conta
            </Link>
            <Link to="/login" className="btn-secondary">
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="section-inner">
          <h2 className="section-eyebrow">Como funciona</h2>
          <ol className="steps-list">
            {steps.map((step) => (
              <li key={step.number} className="step-item">
                <span className="step-number">{step.number}</span>
                <div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <h2 className="section-eyebrow">O que você organiza</h2>
          <div className="feature-list">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="feature-item">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section section-band">
        <div className="section-inner">
          <p className="privacy-note">
            Tudo o que você cadastra é seu, e só seu — sem perfil público, sem compartilhamento.
            Privado desde o primeiro dia.
          </p>
          <h2 className="cta-headline">Comece a organizar sua casa</h2>
          <Link to="/cadastro" className="btn-on-primary">
            Criar conta
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <span className="brand">CasaOS</span>
        <span className="footer-tagline">Sua casa, organizada em um só lugar.</span>
      </footer>
    </>
  )
}
