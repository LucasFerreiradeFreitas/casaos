import { supabase } from '../lib/supabase'
import type { Maintenance } from '../types/maintenance'

const MAINTENANCE_FIELDS = 'id, item_id, description, due_date, completed_at, created_at, updated_at'

export interface MaintenanceInput {
  item_id: string
  description: string
  due_date?: string | null
}

export interface MaintenanceUpdateInput {
  description?: string
  due_date?: string | null
  completed_at?: string | null
}

// Manutenções também não têm home_id direto — mesma lógica de Garantias.
export async function listMaintenancesByItemIds(itemIds: string[]): Promise<Maintenance[]> {
  if (itemIds.length === 0) return []

  const { data, error } = await supabase
    .from('maintenances')
    .select(MAINTENANCE_FIELDS)
    .in('item_id', itemIds)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data
}

export async function createMaintenance(input: MaintenanceInput): Promise<Maintenance> {
  const { data, error } = await supabase
    .from('maintenances')
    .insert(input)
    .select(MAINTENANCE_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function updateMaintenance(id: string, input: MaintenanceUpdateInput): Promise<Maintenance> {
  const { data, error } = await supabase
    .from('maintenances')
    .update(input)
    .eq('id', id)
    .select(MAINTENANCE_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function deleteMaintenance(id: string): Promise<void> {
  const { error } = await supabase.from('maintenances').delete().eq('id', id)
  if (error) throw error
}
