export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

function startOfToday(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`)
  return Math.floor((target.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24))
}

export type WarrantyStatus = 'expired' | 'expiring' | 'ok'

export function warrantyStatus(expiresAt: string): WarrantyStatus {
  const diff = daysUntil(expiresAt)
  if (diff < 0) return 'expired'
  if (diff <= 30) return 'expiring'
  return 'ok'
}

export type MaintenanceStatus = 'completed' | 'overdue' | 'pending'

export function maintenanceStatus(maintenance: {
  due_date: string | null
  completed_at: string | null
}): MaintenanceStatus {
  if (maintenance.completed_at) return 'completed'
  if (!maintenance.due_date) return 'pending'
  return daysUntil(maintenance.due_date) < 0 ? 'overdue' : 'pending'
}
