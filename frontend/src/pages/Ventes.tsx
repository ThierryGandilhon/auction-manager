import { useEffect, useState } from 'react'
import { ventesApi } from '../lib/api'
import { Vente } from '../types/index'
import Btn from '../components/Btn'
import { useNavigate } from 'react-router-dom'

const statutBadge: Record<string, { label: string; color: string; bg: string }> = {
  en_ligne: { label: 'En ligne', color: 'var(--blue)', bg: 'var(--blue-dim)' },
  vendu:    { label: 'Vendu',    color: 'var(--green)', bg: 'var(--green-dim)' },
  annule:   { label: 'Annulé',   color: 'var(--red)', bg: 'var(--red-dim)' },
}

export default function Ventes() {
  const [ventes, setVentes] = useState<Vente[]>([])
  const [filtre, setFiltre] = useState('')
  const navigate = useNavigate()

  useEffect(() => { ventesApi.list(filtre ? { statut: filtre } : {}).then(setVentes) }, [filtre])

  const fmt = (n?: number) => n != null ? Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Ventes</h1>
          <p style={{ color: 'var(--text3)' }}>Vos reventes d'objets</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'en_ligne', 'vendu', 'annule'].map(s => (
            <Btn key={s} size="sm" variant={filtre === s ? 'primary' : 'ghost'} onClick={() => setFiltre(s)}>
              {s === '' ? 'Toutes' : statutBadge[s].label}
            </Btn>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {ventes.map(v => {
          const badge = statutBadge[v.statut]
          return (
            <div key={v.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '14px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
            }} onClick={() => navigate(`/objets/${v.objet_id}`)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{v.objet?.designation}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', gap: 16 }}>
                  {v.plateforme && <span>{v.plateforme}</span>}
                  {v.date_vente && <span>📅 {new Date(v.date_vente).toLocaleDateString('fr-FR')}</span>}
                  {v.client && <span style={{ color: 'var(--accent)' }}>{v.client.prenom} {v.client.nom}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--green)' }}>{fmt(v.prix_vente)}</div>
                  {v.marge != null && (
                    <div style={{ fontSize: 12, color: v.marge >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {v.marge >= 0 ? '+' : ''}{fmt(v.marge)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
            </div>
          )
        })}
        {ventes.length === 0 && (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 60 }}>Aucune vente enregistrée</div>
        )}
      </div>
    </div>
  )
}
