import { useEffect, useState, type FormEvent } from 'react'
import { useHome } from '../hooks/useHome'
import { createItem, deleteItem, listItems, updateItem, type ItemInput } from '../services/items'
import type { Item } from '../types/item'

const emptyForm: ItemInput = { name: '', category: '', purchase_date: '', value: undefined }

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

function normalizeInput(input: ItemInput): ItemInput {
  return {
    name: input.name.trim(),
    category: input.category?.trim() ? input.category.trim() : null,
    purchase_date: input.purchase_date ? input.purchase_date : null,
    value: input.value === undefined || Number.isNaN(input.value) ? null : input.value,
  }
}

export function Bens() {
  const { home } = useHome()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<ItemInput>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ItemInput>(emptyForm)
  const [editError, setEditError] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (home) load(home.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home])

  async function load(homeId: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await listItems(homeId)
      setItems(data)
    } catch {
      setError('Não foi possível carregar os bens.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!home) return
    if (form.name.trim().length < 2) {
      setFormError('Dê um nome para o bem (pelo menos 2 caracteres).')
      return
    }

    setSubmitting(true)
    try {
      await createItem(home.id, normalizeInput(form))
      setForm(emptyForm)
      await load(home.id)
    } catch {
      setFormError('Não foi possível salvar o bem.')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(item: Item) {
    setEditingId(item.id)
    setEditError(null)
    setEditForm({
      name: item.name,
      category: item.category ?? '',
      purchase_date: item.purchase_date ?? '',
      value: item.value ?? undefined,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function saveEdit(id: string) {
    if (!home) return
    setEditError(null)

    if (editForm.name.trim().length < 2) {
      setEditError('Dê um nome para o bem (pelo menos 2 caracteres).')
      return
    }

    setSavingEdit(true)
    try {
      await updateItem(id, normalizeInput(editForm))
      setEditingId(null)
      await load(home.id)
    } catch {
      setEditError('Não foi possível salvar as alterações.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(id: string) {
    if (!home) return
    const confirmed = window.confirm('Excluir este bem? Essa ação não pode ser desfeita.')
    if (!confirmed) return

    try {
      await deleteItem(id)
      await load(home.id)
    } catch {
      setError('Não foi possível excluir o bem.')
    }
  }

  return (
    <section>
      <h1>Bens</h1>

      <form onSubmit={handleCreate} className="inline-form">
        <div className="field">
          <label htmlFor="item-name">Nome</label>
          <input
            id="item-name"
            type="text"
            required
            maxLength={120}
            placeholder="Ex: Televisão, Geladeira"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="item-category">Categoria</label>
          <input
            id="item-category"
            type="text"
            maxLength={60}
            placeholder="Ex: Eletrônico"
            value={form.category ?? ''}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="item-date">Data da compra</label>
          <input
            id="item-date"
            type="date"
            value={form.purchase_date ?? ''}
            onChange={(event) => setForm({ ...form, purchase_date: event.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="item-value">Valor (R$)</label>
          <input
            id="item-value"
            type="number"
            step="0.01"
            min="0"
            value={form.value ?? ''}
            onChange={(event) =>
              setForm({ ...form, value: event.target.value === '' ? undefined : Number(event.target.value) })
            }
          />
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Adicionando...' : 'Adicionar bem'}
        </button>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
      </form>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="page-loading">Carregando...</p>
      ) : items.length === 0 ? (
        <p>Nenhum bem cadastrado ainda.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Compra</th>
              <th>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editForm.category ?? ''}
                      onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editForm.purchase_date ?? ''}
                      onChange={(event) => setEditForm({ ...editForm, purchase_date: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.value ?? ''}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          value: event.target.value === '' ? undefined : Number(event.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="actions">
                    <button type="button" className="btn-link" onClick={() => saveEdit(item.id)} disabled={savingEdit}>
                      Salvar
                    </button>
                    <button type="button" className="btn-link" onClick={cancelEdit}>
                      Cancelar
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category || '—'}</td>
                  <td>{formatDate(item.purchase_date)}</td>
                  <td>{formatCurrency(item.value)}</td>
                  <td className="actions">
                    <button type="button" className="btn-link" onClick={() => startEdit(item)}>
                      Editar
                    </button>
                    <button type="button" className="btn-link danger" onClick={() => handleDelete(item.id)}>
                      Excluir
                    </button>
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
