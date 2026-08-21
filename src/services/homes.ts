import { supabase } from '../lib/supabase'
import type { Home } from '../types/home'

const HOME_FIELDS = 'id, name, created_at, updated_at'

// MVP assume uma casa por usuário. A RLS já garante que só vemos
// as nossas linhas; aqui só pegamos a primeira.
export async function getMyHome(): Promise<Home | null> {
  const { data, error } = await supabase.from('homes').select(HOME_FIELDS).limit(1).maybeSingle()

  if (error) throw error
  return data
}

export async function createHome(name: string): Promise<Home> {
  const { data, error } = await supabase.from('homes').insert({ name }).select(HOME_FIELDS).single()

  if (error) throw error
  return data
}

export async function updateHomeName(id: string, name: string): Promise<Home> {
  const { data, error } = await supabase
    .from('homes')
    .update({ name })
    .eq('id', id)
    .select(HOME_FIELDS)
    .single()

  if (error) throw error
  return data
}
