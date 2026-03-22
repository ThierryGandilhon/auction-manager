import { useEffect, useState } from 'react'
import { statsApi } from '../lib/api'
import { DashboardStats } from '../types/index'
import StatCard from '../components/StatCard'

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => { statsApi.dashboard().then(setStats) }, [])

  if (!stats) return <div style={{ color: 'var(--text3)' }}>Chargement...</div>

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Tableau de bord</h1>
        <p style={{ color: 'var(--text3)' }}>Vue d'ensemble de votre activité</p>
      </div>

      {/* Finances */}
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
        Finances
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total investi" value={fmt(stats.total_investi)} color="var(--red)" />
        <StatCard label="Total revendu" value={fmt(stats.total_revendu)} color="var(--green)" />
        <StatCard
          label="Marge totale"
          value={fmt(stats.marge_totale)}
          color={stats.marge_totale >= 0 ? 'var(--green)' : 'var(--red)'}
        />
      </div>

      {/* Objets */}
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
        Objets
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total objets" value={stats.total_objets} />
        <StatCard label="En stock" value={stats.objets_en_stock} color="var(--text2)" />
        <StatCard label="En vente" value={stats.objets_en_vente} color="var(--blue)" />
        <StatCard label="Vendus" value={stats.objets_vendus} color="var(--green)" />
      </div>

      {/* Activité */}
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
        Activité
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Lots achetés" value={stats.total_lots_achetes} />
        <StatCard label="Clients" value={stats.total_clients} color="var(--accent)" />
      </div>
    </div>
  )
}
