import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useHome } from '../hooks/useHome'
import { listItems } from '../services/items'
import { listWarrantiesByItemIds } from '../services/warranties'
import { listMaintenancesByItemIds } from '../services/maintenances'
import { formatDate, warrantyStatus, maintenanceStatus } from '../utils/dates'
import type { Item } from '../types/item'
import type { Warranty } from '../types/warranty'
import type { Maintenance } from '../types/maintenance'

export function Dashboard() {
  const { user } = useAuth()
  const { home } = useHome()

  const [items, setItems] = useState<Item[]>([])
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!home) return
    let active = true

    async function load(homeId: string) {
      setLoading(true)
      setError(null)
      try {
        const itemList = await listItems(homeId)
        const itemIds = itemList.map((item) => item.id)
        const [warrantyList, maintenanceList] = await Promise.all([
          listWarrantiesByItemIds(itemIds),
          listMaintenancesByItemIds(itemIds),
        ])
        if (!active) return
        setItems(itemList)
        setWarranties(warrantyList)
        setMaintenances(maintenanceList)
      } catch {
        if (active) setError('Não foi possível carregar os dados do dashboard.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load(home.id)
    return () => {
      active = false
    }
  }, [home])

  if (loading) {
    return <p className="page-loading">Carregando...</p>
  }

  const itemsById = new Map(items.map((item) => [item.id, item]))

  const expiringWarranties = warranties.filter((warranty) => {
    const status = warrantyStatus(warranty.expires_at)
    return status === 'expiring' || status === 'expired'
  })

  const overdueMaintenances = maintenances.filter(
    (maintenance) => maintenanceStatus(maintenance) === 'overdue',
  )

  return (
    <section>
      <h1>Dashboard</h1>
      <p>
        {home?.name} — logado como {user?.email}.
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="stats-row">
        <div className="stat">
          <span className="stat-value">{items.length}</span>
          <span className="stat-label">Bens cadastrados</span>
        </div>
        <div className="stat">
          <span className="stat-value">{warranties.length}</span>
          <span className="stat-label">Garantias</span>
        </div>
        <div className="stat">
          <span className="stat-value">{maintenances.length}</span>
          <span className="stat-label">Manutenções</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Garantias vencendo</h2>
        {expiringWarranties.length === 0 ? (
          <p>Nenhuma garantia vencida ou perto do vencimento.</p>
        ) : (
          <ul className="alert-list">
            {expiringWarranties.map((warranty) => (
              <li
                key={warranty.id}
                className={
                  warrantyStatus(warranty.expires_at) === 'expired' ? 'status-expired' : 'status-expiring'
                }
              >
                {itemsById.get(warranty.item_id)?.name ?? 'Bem'} — vence em {formatDate(warranty.expires_at)}
              </li>
            ))}
          </ul>
        )}
        <Link to="/app/garantias">Ver todas as garantias</Link>
      </div>

      <div className="dashboard-section">
        <h2>Manutenções atrasadas</h2>
        {overdueMaintenances.length === 0 ? (
          <p>Nenhuma manutenção atrasada.</p>
        ) : (
          <ul className="alert-list">
            {overdueMaintenances.map((maintenance) => (
              <li key={maintenance.id} className="status-expired">
                {itemsById.get(maintenance.item_id)?.name ?? 'Bem'} — {maintenance.description}
                {maintenance.due_date ? ` (prazo ${formatDate(maintenance.due_date)})` : ''}
              </li>
            ))}
          </ul>
        )}
        <Link to="/app/manutencoes">Ver todas as manutenções</Link>
      </div>
    </section>
  )
}
