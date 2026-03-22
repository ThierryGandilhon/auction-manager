import { useEffect, useState } from 'react'
import { objetsApi } from '../lib/api'
import { Objet } from '../types/index'
import Btn from '../components/Btn'
import { useNavigate } from 'react-router-dom'
import { photoUrl } from '../lib/api'

const statutBadge: Record<string, { label: string; color: string; bg: string }> = {
  en_stock: { label: 'En stock', color: 'var(--text2)', bg: 'var(--bg3)' },
  en_vente: { label: 'En vente', color: 'var(--blue)', bg: 'var(--blue-dim)' },
  vendu:    { label: 'Vendu',    color: 'var(--green)', bg: 'var(--green-dim)' },
}

export default function Objets() {
  const [objets, setObjets] = useState<Objet[]>([])
  const [filtre, setFiltre] = useState('')
  const navigate = useNavigate()

  useEffect(() => { objetsApi.list(filtre ? { statut: filtre } : {}).then(setObjets) }, [filtre])

  const fmt = (n?: number) => n != null ? Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Objets</h1>
          <p style={{ color: 'var(--text3)' }}>Tous vos objets</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'en_stock', 'en_vente', 'vendu'].map(s => (
            <Btn key={s} size="sm" variant={filtre === s ? 'primary' : 'ghost'} onClick={() => setFiltre(s)}>
              {s === '' ? 'Tous' : statutBadge[s].label}
            </Btn>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {objets.map(o => {
          const badge = statutBadge[o.statut]
          const photo = o.photos[0]
          return (
            <div key={o.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }} onClick={() => navigate(`/objets/${o.id}`)}>
              <div style={{ height: 160, background: 'var(--bg3)', overflow: 'hidden' }}>
                {photo
                  ? <img src={photoUrl(photo.chemin_fichier)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--border2)' }}>◉</div>
                }
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, flex: 1, marginRight: 8 }}>{o.designation}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color, whiteSpace: 'nowrap' }}>
                    {badge.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
                  {o.achat?.auction?.titre || '—'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text3)' }}>Estimé</span>
                  <span style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--accent)' }}>{fmt(o.prix_estime)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {objets.length === 0 && (
        <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 60 }}>Aucun objet</div>
      )}
    </div>
  )
}
