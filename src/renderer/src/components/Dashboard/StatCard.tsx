import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: string
}

export function StatCard({ icon, label, value, sub, accent = 'text-brand-400' }: StatCardProps): JSX.Element {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-wider font-medium">
        <span className={accent}>{icon}</span>
        {label}
      </div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600">{sub}</div>}
    </div>
  )
}
