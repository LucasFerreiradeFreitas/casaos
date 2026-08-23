import { supabase } from '../lib/supabase'

export interface DocumentFile {
  name: string
  size: number
  createdAt: string
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

// O UUID no início do nome garante que o usuário nunca controla
// o caminho de armazenamento sozinho (regra 25 do projeto).
function buildPath(userId: string, itemId: string, fileName: string): string {
  return `${userId}/${itemId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`
}

export async function listDocuments(userId: string, itemId: string): Promise<DocumentFile[]> {
  const { data, error } = await supabase.storage
    .from('documents')
    .list(`${userId}/${itemId}`, { sortBy: { column: 'created_at', order: 'desc' } })

  if (error) throw error

  return (data ?? [])
    .filter((entry) => entry.name !== '.emptyFolderPlaceholder')
    .map((entry) => ({
      name: entry.name,
      size: entry.metadata?.size ?? 0,
      createdAt: entry.created_at ?? '',
    }))
}

export async function uploadDocument(userId: string, itemId: string, file: File): Promise<void> {
  const path = buildPath(userId, itemId, file.name)
  const { error } = await supabase.storage.from('documents').upload(path, file)
  if (error) throw error
}

// URL temporária — nunca um link permanente para um arquivo privado.
export async function getDownloadUrl(userId: string, itemId: string, fileName: string): Promise<string> {
  const path = `${userId}/${itemId}/${fileName}`
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 60)
  if (error) throw error
  return data.signedUrl
}

export async function deleteDocument(userId: string, itemId: string, fileName: string): Promise<void> {
  const path = `${userId}/${itemId}/${fileName}`
  const { error } = await supabase.storage.from('documents').remove([path])
  if (error) throw error
}
