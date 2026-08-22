import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Detalhe técnico só no console do navegador — a tela mostra uma
    // mensagem amigável, sem detalhes internos (regra 26 do projeto).
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Algo deu errado</h1>
          <p>Não foi possível carregar esta página. Tente recarregar.</p>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
