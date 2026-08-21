import { useContext } from 'react'
import { HomeContext } from '../contexts/HomeContext'

export function useHome() {
  const context = useContext(HomeContext)
  if (!context) {
    throw new Error('useHome precisa ser usado dentro de um HomeProvider')
  }
  return context
}
