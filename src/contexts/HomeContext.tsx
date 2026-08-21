import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Home } from '../types/home'
import { getMyHome } from '../services/homes'
import { useAuth } from '../hooks/useAuth'

interface HomeContextValue {
  home: Home | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const HomeContext = createContext<HomeContextValue | undefined>(undefined)

export function HomeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [home, setHome] = useState<Home | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setHome(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await getMyHome()
      setHome(result)
    } catch {
      setError('Não foi possível carregar os dados da sua casa.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <HomeContext.Provider value={{ home, loading, error, refresh }}>{children}</HomeContext.Provider>
  )
}
