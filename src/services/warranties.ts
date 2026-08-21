import { supabase } from '../lib/supabase'
import type { Warranty } from '../types/warranty'

const WARRANTY_FIELDS = 'id, item_id, provider, expires_at, notes, created_at, updated_at'

export interface WarrantyInput {
  item_id: string
  provider?: string | null
  expires_at: string
  notes?: string | null
}

export type WarrantyUpdateInput = Omit<WarrantyInput, 'item_id'>

// Garantias não têm home_id direto — buscamos pelos ids dos bens da
// casa, que já vieram de uma consulta protegida por RLS.
export async function listWarrantiesByItemIds(itemIds: string[]): Promise<Warranty[]> {
  if (itemIds.length === 0) return []

  const { data, error } = await supabase
    .from('warranties')
    .select(WARRANTY_FIELDS)
    .in('item_id', itemIds)
    .order('expires_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createWarranty(input: WarrantyInput): Promise<Warranty> {
  const { data, error } = await supabase.from('warranties').insert(input).select(WARRANTY_FIELDS).single()

  if (error) throw error
  return data
}

export async function updateWarranty(id: string, input: WarrantyUpdateInput): Promise<Warranty> {
  const { data, error } = await supabase
    .from('warranties')
    .update(input)
    .eq('id', id)
    .select(WARRANTY_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function deleteWarranty(id: string): Promise<void> {
  const { error } = await supabase.from('warranties').delete().eq('id', id)
  if (error) throw error
}
