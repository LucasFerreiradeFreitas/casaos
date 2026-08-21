import { supabase } from '../lib/supabase'
import type { Item } from '../types/item'

const ITEM_FIELDS = 'id, home_id, name, category, purchase_date, value, created_at, updated_at'

export interface ItemInput {
  name: string
  category?: string | null
  purchase_date?: string | null
  value?: number | null
}

export async function listItems(homeId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_FIELDS)
    .eq('home_id', homeId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createItem(homeId: string, input: ItemInput): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert({ home_id: homeId, ...input })
    .select(ITEM_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function updateItem(id: string, input: ItemInput): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update(input)
    .eq('id', id)
    .select(ITEM_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw error
}
