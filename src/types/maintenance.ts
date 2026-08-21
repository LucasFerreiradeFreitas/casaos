export interface Maintenance {
  id: string
  item_id: string
  description: string
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}
