import { useEffect, useState, type FormEvent } from 'react'
import { useHome } from '../hooks/useHome'
import { createHome, updateHomeName } from '../services/homes'

export function MinhaCasa() {
  const { home, loading, error, refresh } = useHome()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setName(home?.name ?? '')
  }, [home])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSaved(false)

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setFormError('Dê um nome para a sua casa (pelo menos 2 caracteres).')
      return
    }

    setSubmitting(true)
    try {
      if (home) {
        await updateHomeName(home.id, trimmed)
      } else {
        await createHome(trimmed)
      }
      await refresh()
      setSaved(true)
    } catch {
      setFormError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="page-loading">Carregando...</p>
  }

  return (
    <section className="page-narrow">
      <h1>{home ? 'Minha casa' : 'Vamos criar sua casa'}</h1>

      {!home && (
        <p>
          Dê um nome para identificar sua residência. Você poderá cadastrar mais de uma casa no
          futuro.
        </p>
      )}

      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit} className="home-form">
        <label htmlFor="home-name">Nome da casa</label>
        <input
          id="home-name"
          type="text"
          required
          maxLength={80}
          placeholder="Ex: Apartamento, Casa da praia"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        {saved && <p className="form-success">Salvo.</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : home ? 'Salvar' : 'Criar casa'}
        </button>
      </form>
    </section>
  )
}
