import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useHome } from '../hooks/useHome'
import { listItems } from '../services/items'
import {
  createWarranty,
  deleteWarranty,
  listWarrantiesByItemIds,
  updateWarranty,
} from '../services/warranties'
import type { Item } from '../types/item'
import type { Warranty } from '../types/warranty'
import { formatDate, warrantyStatus } from '../utils/dates'

interface WarrantyForm {
  item_id: string
  provider: string
  expires_at: string
  notes: string
}

const emptyForm: WarrantyForm = { item_id: '', provider: '', expires_at: '', notes: '' }

function toEditForm(warranty: Warranty): WarrantyForm {
  return {
    item_id: warranty.item_id,
    provider: warranty.provider ?? '',
    expires_at: warranty.expires_at,
    notes: warranty.notes ?? '',
  }
}

export function Garantias() {
  const { home } = useHome()
  const [items, setItems] = useState<Item[]>([])
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<WarrantyForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<WarrantyForm>(emptyForm)
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
      const warrantyList = await listWarrantiesByItemIds(itemList.map((item) => item.id))
      setWarranties(warrantyList)
    } catch {
      setError('Não foi possível carregar as garantias.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!home) return
    if (!form.item_id) {
      setFormError('Escolha a qual bem essa garantia pertence.')
      return
    }
    if (!form.expires_at) {
      setFormError('Informe a data de vencimento.')
      return
    }

    setSubmitting(true)
    try {
      await createWarranty({
        item_id: form.item_id,
        provider: form.provider.trim() ? form.provider.trim() : null,
        expires_at: form.expires_at,
        notes: form.notes.trim() ? form.notes.trim() : null,
      })
      setForm(emptyForm)
      await load(home.id)
    } catch {
      setFormError('Não foi possível salvar a garantia.')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(warranty: Warranty) {
    setEditingId(warranty.id)
    setEditError(null)
    setSavedId(null)
    setEditForm(toEditForm(warranty))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function saveEdit(id: string) {
    if (!home) return
    setEditError(null)

    if (!editForm.expires_at) {
      setEditError('Informe a data de vencimento.')
      return
    }

    setSavingEdit(true)
    try {
      await updateWarranty(id, {
        provider: editForm.provider.trim() ? editForm.provider.trim() : null,
        expires_at: editForm.expires_at,
        notes: editForm.notes.trim() ? editForm.notes.trim() : null,
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

  async function handleDelete(id: string) {
    if (!home) return
    const confirmed = window.confirm('Excluir esta garantia? Essa ação não pode ser desfeita.')
    if (!confirmed) return

    try {
      await deleteWarranty(id)
      await load(home.id)
    } catch {
      setError('Não foi possível excluir a garantia.')
    }
  }

  if (loading) {
    return <p className="page-loading">Carregando...</p>
  }

  return (
    <section>
      <h1>Garantias</h1>
      <p className="page-subtitle">
        Saiba até quando cada garantia vale, sem procurar nota fiscal perdida.
      </p>

      {items.length === 0 ? (
        <p>
          Cadastre um bem antes de adicionar uma garantia. <Link to="/app/bens">Ir para Bens</Link>
        </p>
      ) : (
        <form onSubmit={handleCreate} className="inline-form">
          <div className="field">
            <label htmlFor="warranty-item">Bem</label>
            <select
              id="warranty-item"
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
            <label htmlFor="warranty-provider">Fornecedor</label>
            <input
              id="warranty-provider"
              type="text"
              maxLength={120}
              placeholder="Ex: Loja, fabricante"
              value={form.provider}
              onChange={(event) => setForm({ ...form, provider: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="warranty-expires">Vencimento</label>
            <input
              id="warranty-expires"
              type="date"
              required
              value={form.expires_at}
              onChange={(event) => setForm({ ...form, expires_at: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="warranty-notes">Notas</label>
            <input
              id="warranty-notes"
              type="text"
              maxLength={200}
              placeholder="Opcional"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adicionando...' : 'Adicionar garantia'}
          </button>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
        </form>
      )}

      {error && <p className="form-error">{error}</p>}

      {items.length > 0 && warranties.length === 0 && <p>Nenhuma garantia cadastrada ainda.</p>}

      {warranties.length > 0 && (
        <div className="table-scroll">
          <table className="data-table">
          <thead>
            <tr>
              <th>Bem</th>
              <th>Fornecedor</th>
              <th>Vencimento</th>
              <th>Notas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {warranties.map((warranty) =>
              editingId === warranty.id ? (
                <tr key={warranty.id}>
                  <td>{itemsById.get(warranty.item_id)?.name ?? '—'}</td>
                  <td>
                    <input
                      type="text"
                      value={editForm.provider}
                      onChange={(event) => setEditForm({ ...editForm, provider: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editForm.expires_at}
                      onChange={(event) => setEditForm({ ...editForm, expires_at: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editForm.notes}
                      onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })}
                    />
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => saveEdit(warranty.id)}
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
                <tr key={warranty.id}>
                  <td>{itemsById.get(warranty.item_id)?.name ?? '—'}</td>
                  <td>{warranty.provider || '—'}</td>
                  <td className={`status-${warrantyStatus(warranty.expires_at)}`}>
                    {formatDate(warranty.expires_at)}
                  </td>
                  <td>{warranty.notes || '—'}</td>
                  <td className="actions">
                    <button type="button" className="btn-link" onClick={() => startEdit(warranty)}>
                      Editar
                    </button>
                    <button type="button" className="btn-link danger" onClick={() => handleDelete(warranty.id)}>
                      Excluir
                    </button>
                    {savedId === warranty.id && <span className="saved-inline">Salvo.</span>}
                  </td>
                </tr>
              ),
            )}
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
