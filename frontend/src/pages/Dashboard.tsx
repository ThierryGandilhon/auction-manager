import { useEffect, useState } from 'react'
import { statsApi } from '../lib/api'
import { DashboardStats } from '../types/index'
import StatCard from '../components/StatCard'

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => { statsApi.dashboard().then(setStats) }, [])

  if (!stats) return <div className="text-muted-foreground">Chargement...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <section>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Finances</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total investi" value={fmt(stats.total_investi)} valueClassName="text-red-500" />
          <StatCard label="Total revendu" value={fmt(stats.total_revendu)} valueClassName="text-green-500" />
          <StatCard
            label="Marge totale"
            value={fmt(stats.marge_totale)}
            valueClassName={stats.marge_totale >= 0 ? 'text-green-500' : 'text-red-500'}
          />
        </div>
      </section>

      <section>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Objets</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total objets" value={stats.total_objets} />
          <StatCard label="En stock" value={stats.objets_en_stock} valueClassName="text-muted-foreground" />
          <StatCard label="En vente" value={stats.objets_en_vente} valueClassName="text-blue-500" />
          <StatCard label="Vendus" value={stats.objets_vendus} valueClassName="text-green-500" />
        </div>
      </section>

      <section>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Activité</div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Lots achetés" value={stats.total_lots_achetes} />
          <StatCard label="Clients" value={stats.total_clients} valueClassName="text-primary" />
        </div>
      </section>
    </div>
  )
}
