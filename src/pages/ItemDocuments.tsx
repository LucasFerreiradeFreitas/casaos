import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getItem } from '../services/items'
import {
  deleteDocument,
  getDownloadUrl,
  listDocuments,
  uploadDocument,
  type DocumentFile,
} from '../services/documents'
import type { Item } from '../types/item'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024

// O nome guardado é "{uuid}-{nome original}" — 36 caracteres de UUID
// mais o hífen. Isso só afeta a exibição, não a segurança do caminho.
function displayName(objectName: string): string {
  return objectName.length > 37 ? objectName.slice(37) : objectName
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ItemDocuments() {
  const { itemId } = useParams<{ itemId: string }>()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [item, setItem] = useState<Item | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (itemId && user) load(itemId, user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, user])

  async function load(id: string, userId: string) {
    setLoading(true)
    setError(null)

    // ID mal formado se comporta exatamente como ID que não pertence
    // ao usuário — não damos nenhuma pista sobre qual é o caso.
    if (!UUID_PATTERN.test(id)) {
      setNotFound(true)
      setLoading(false)
      return
    }

    try {
      const foundItem = await getItem(id)
      if (!foundItem) {
        setNotFound(true)
        return
      }
      setItem(foundItem)
      const docs = await listDocuments(userId, id)
      setDocuments(docs)
    } catch {
      setError('Não foi possível carregar os documentos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault()
    setUploadError(null)

    if (!itemId || !user) return
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setUploadError('Escolha um arquivo.')
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Formato não suportado. Use JPG, PNG, WEBP ou PDF.')
      return
    }
    if (file.size > MAX_SIZE) {
      setUploadError('Arquivo muito grande. Limite de 10 MB.')
      return
    }

    setUploading(true)
    try {
      await uploadDocument(user.id, itemId, file)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await load(itemId, user.id)
    } catch {
      setUploadError('Não foi possível enviar o arquivo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload(name: string) {
    if (!itemId || !user) return
    try {
      const url = await getDownloadUrl(user.id, itemId, name)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Não foi possível abrir o arquivo.')
    }
  }

  async function handleDelete(name: string) {
    if (!itemId || !user) return
    const confirmed = window.confirm('Excluir este arquivo? Essa ação não pode ser desfeita.')
    if (!confirmed) return

    try {
      await deleteDocument(user.id, itemId, name)
      await load(itemId, user.id)
    } catch {
      setError('Não foi possível excluir o arquivo.')
    }
  }

  if (loading) {
    return <p className="page-loading">Carregando...</p>
  }

  if (notFound) {
    return (
      <section>
        <h1>Bem não encontrado</h1>
        <p>Esse bem não existe ou não pertence à sua conta.</p>
        <Link to="/app/bens">Voltar para Bens</Link>
      </section>
    )
  }

  return (
    <section>
      <p>
        <Link to="/app/bens">← Bens</Link>
      </p>
      <h1>{item?.name}</h1>
      <p>Documentos anexados a este bem — notas fiscais, manuais, fotos.</p>

      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleUpload} className="inline-form">
        <div className="field">
          <label htmlFor="doc-file">Arquivo (JPG, PNG, WEBP ou PDF, até 10 MB)</label>
          <input id="doc-file" type="file" ref={fileInputRef} accept=".jpg,.jpeg,.png,.webp,.pdf" />
        </div>
        <button type="submit" className="btn-primary" disabled={uploading}>
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
        </button>
        {uploadError && (
          <p className="form-error" role="alert">
            {uploadError}
          </p>
        )}
      </form>

      {documents.length === 0 ? (
        <p>Nenhum documento anexado ainda.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Tamanho</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.name}>
                  <td>{displayName(doc.name)}</td>
                  <td>{formatSize(doc.size)}</td>
                  <td className="actions">
                    <button type="button" className="btn-link" onClick={() => handleDownload(doc.name)}>
                      Abrir
                    </button>
                    <button type="button" className="btn-link danger" onClick={() => handleDelete(doc.name)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
