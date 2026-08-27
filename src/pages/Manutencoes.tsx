import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useHome } from '../hooks/useHome'
import { listItems } from '../services/items'
import {
  createMaintenance,
  deleteMaintenance,
  listMaintenancesByItemIds,
  updateMaintenance,
} from '../services/maintenances'
import type { Item } from '../types/item'
import type { Maintenance } from '../types/maintenance'
import { formatDate, maintenanceStatus, todayISODate } from '../utils/dates'

interface MaintenanceForm {
  item_id: string
  description: string
  due_date: string
}

const emptyForm: MaintenanceForm = { item_id: '', description: '', due_date: '' }

function toEditForm(maintenance: Maintenance): MaintenanceForm {
  return {
    item_id: maintenance.item_id,
    description: maintenance.description,
    due_date: maintenance.due_date ?? '',
  }
}

export function Manutencoes() {
  const { home } = useHome()
  const [items, setItems] = useState<Item[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<MaintenanceForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<MaintenanceForm>(emptyForm)
  const [editError, setEditError] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  const itemsById = useMemo(() => {
    const map = new Map<string, Item>()
    items.forEach((item) => map.set(item.id, item))
    return map
  }, [items])

  useEffect(() => {
    if (home) load(home.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home])

  async function load(homeId: string) {
    setLoading(true)
    setError(null)
    try {
      const itemList = await listItems(homeId)
      setItems(itemList)
      const maintenanceList = await listMaintenancesByItemIds(itemList.map((item) => item.id))
      setMaintenances(maintenanceList)
    } catch {
      setError('Não foi possível carregar as manutenções.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!home) return
    if (!form.item_id) {
      setFormError('Escolha a qual bem essa manutenção pertence.')
      return
    }
    if (form.description.trim().length < 2) {
      setFormError('Descreva a manutenção (pelo menos 2 caracteres).')
      return
    }

    setSubmitting(true)
    try {
      await createMaintenance({
        item_id: form.item_id,
        description: form.description.trim(),
        due_date: form.due_date ? form.due_date : null,
      })
      setForm(emptyForm)
      await load(home.id)
    } catch {
      setFormError('Não foi possível salvar a manutenção.')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(maintenance: Maintenance) {
    setEditingId(maintenance.id)
    setEditError(null)
    setSavedId(null)
    setEditForm(toEditForm(maintenance))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function saveEdit(id: string) {
    if (!home) return
    setEditError(null)

    if (editForm.description.trim().length < 2) {
      setEditError('Descreva a manutenção (pelo menos 2 caracteres).')
      return
    }

    setSavingEdit(true)
    try {
      await updateMaintenance(id, {
        description: editForm.description.trim(),
        due_date: editForm.due_date ? editForm.due_date : null,
      })
      setEditingId(null)
      setSavedId(id)
      await load(home.id)
    } catch {
      setEditError('Não foi possível salvar as alterações.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleToggleComplete(maintenance: Maintenance) {
    if (!home) return
    try {
      await updateMaintenance(maintenance.id, {
        completed_at: maintenance.completed_at ? null : todayISODate(),
      })
      await load(home.id)
    } catch {
      setError('Não foi possível atualizar a manutenção.')
    }
  }

  async function handleDelete(id: string) {
    if (!home) return
    const confirmed = window.confirm('Excluir esta manutenção? Essa ação não pode ser desfeita.')
    if (!confirmed) return

    try {
      await deleteMaintenance(id)
      await load(home.id)
    } catch {
      setError('Não foi possível excluir a manutenção.')
    }
  }

  if (loading) {
    return <p className="page-loading">Carregando...</p>
  }

  return (
    <section>
      <h1>Manutenções</h1>
      <p className="page-subtitle">
        Não perca a hora de cuidar do que precisa de atenção.
      </p>

      {items.length === 0 ? (
        <p>
          Cadastre um bem antes de adicionar uma manutenção. <Link to="/app/bens">Ir para Bens</Link>
        </p>
      ) : (
        <form onSubmit={handleCreate} className="inline-form">
          <div className="field">
            <label htmlFor="maintenance-item">Bem</label>
            <select
              id="maintenance-item"
              required
              value={form.item_id}
              onChange={(event) => setForm({ ...form, item_id: event.target.value })}
            >
              <option value="">Selecione</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="maintenance-description">Descrição</label>
            <input
              id="maintenance-description"
              type="text"
              maxLength={160}
              placeholder="Ex: Trocar filtro do ar-condicionado"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="maintenance-due">Prazo</label>
            <input
              id="maintenance-due"
              type="date"
              value={form.due_date}
              onChange={(event) => setForm({ ...form, due_date: event.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adicionando...' : 'Adicionar manutenção'}
          </button>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
        </form>
      )}

      {error && <p className="form-error">{error}</p>}

      {items.length > 0 && maintenances.length === 0 && <p>Nenhuma manutenção cadastrada ainda.</p>}

      {maintenances.length > 0 && (
        <div className="table-scroll">
          <table className="data-table">
          <thead>
            <tr>
              <th>Bem</th>
              <th>Descrição</th>
              <th>Prazo</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((maintenance) => {
              const status = maintenanceStatus(maintenance)

              return editingId === maintenance.id ? (
                <tr key={maintenance.id}>
                  <td>{itemsById.get(maintenance.item_id)?.name ?? '—'}</td>
                  <td>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editForm.due_date}
                      onChange={(event) => setEditForm({ ...editForm, due_date: event.target.value })}
                    />
                  </td>
                  <td>—</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => saveEdit(maintenance.id)}
                      disabled={savingEdit}
                    >
                      Salvar
                    </button>
                    <button type="button" className="btn-link" onClick={cancelEdit}>
                      Cancelar
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={maintenance.id}>
                  <td>{itemsById.get(maintenance.item_id)?.name ?? '—'}</td>
                  <td>{maintenance.description}</td>
                  <td className={status === 'overdue' ? 'status-expired' : undefined}>
                    {maintenance.due_date ? formatDate(maintenance.due_date) : '—'}
                  </td>
                  <td className={status === 'overdue' ? 'status-expired' : undefined}>
                    {status === 'completed' && maintenance.completed_at
                      ? `Concluída em ${formatDate(maintenance.completed_at)}`
                      : status === 'overdue'
                        ? 'Atrasada'
                        : 'Pendente'}
                  </td>
                  <td className="actions">
                    <button type="button" className="btn-link" onClick={() => handleToggleComplete(maintenance)}>
                      {maintenance.completed_at ? 'Reabrir' : 'Concluir'}
                    </button>
                    <button type="button" className="btn-link" onClick={() => startEdit(maintenance)}>
                      Editar
                    </button>
                    <button type="button" className="btn-link danger" onClick={() => handleDelete(maintenance.id)}>
                      Excluir
                    </button>
                    {savedId === maintenance.id && <span className="saved-inline">Salvo.</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      )}

      {editError && (
        <p className="form-error" role="alert">
          {editError}
        </p>
      )}
    </section>
  )
}
