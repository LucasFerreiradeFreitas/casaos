import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RecuperarSenha() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    await resetPassword(email)
    setSubmitting(false)
    // A mensagem é sempre a mesma, exista ou não a conta, para não
    // revelar quais e-mails têm cadastro (regra 27 do projeto).
    setSent(true)
  }

  if (sent) {
    return (
      <section className="auth-form">
        <h1>Verifique seu e-mail</h1>
        <p>Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.</p>
        <Link to="/login">Voltar para o login</Link>
      </section>
    )
  }

  return (
    <section className="auth-form">
      <h1>Recuperar senha</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Voltar para o login</Link>
      </p>
    </section>
  )
}
