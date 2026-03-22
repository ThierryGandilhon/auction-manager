import { useEffect, useState } from 'react'
import { auctionsApi, etudesApi } from '../lib/api'
import { Auction, Etude } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'
import { useNavigate } from 'react-router-dom'

const empty = { etude_id: 0, titre: '', date_auction: '', lieu: '', url_catalogue: '', notes: '' }

export default function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [etudes, setEtudes] = useState<Etude[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Auction | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const navigate = useNavigate()

  const load = () => {
    auctionsApi.list().then(setAuctions)
    etudesApi.list().then(setEtudes)
  }
  useEffect(() => { load() }, [])

  const open = (a?: Auction) => {
    setEditing(a || null)
    setForm(a ? {
      etude_id: a.etude_id, titre: a.titre,
      date_auction: a.date_auction || '', lieu: a.lieu || '',
      url_catalogue: a.url_catalogue || '', notes: a.notes || '',
    } : empty)
    setModal(true)
  }

  const save = async () => {
    const data = { ...form, etude_id: Number(form.etude_id), date_auction: form.date_auction || null }
    if (editing) await auctionsApi.update(editing.id, data)
    else await auctionsApi.create(data)
    setModal(false)
    load()
  }

  const del = async (id: number) => {
    if (confirm('Supprimer cette auction ?')) { await auctionsApi.delete(id); load() }
  }

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Auctions</h1>
          <p style={{ color: 'var(--text3)' }}>Ventes aux enchères</p>
        </div>
        <Btn variant="primary" onClick={() => open()}>+ Nouvelle auction</Btn>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {auctions.map(a => (
          <div key={a.id} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer',
          }} onClick={() => navigate(`/auctions/${a.id}`)}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{a.titre}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', gap: 16 }}>
                <span style={{ color: 'var(--accent)' }}>{a.etude.nom}</span>
                {a.date_auction && <span>📅 {new Date(a.date_auction).toLocaleDateString('fr-FR')}</span>}
                {a.lieu && <span>📍 {a.lieu}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
              <Btn size="sm" onClick={() => open(a)}>Modifier</Btn>
              <Btn size="sm" variant="danger" onClick={() => del(a.id)}>Supprimer</Btn>
            </div>
          </div>
        ))}
        {auctions.length === 0 && (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>Aucune auction enregistrée</div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Modifier l\'auction' : 'Nouvelle auction'} onClose={() => setModal(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Étude *">
              <select value={form.etude_id} onChange={e => f('etude_id', e.target.value)}>
                <option value={0}>Sélectionner une étude...</option>
                {etudes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </Field>
            <Field label="Titre *"><input value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="Vente du 15 janvier" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Date"><input type="date" value={form.date_auction} onChange={e => f('date_auction', e.target.value)} /></Field>
              <Field label="Lieu"><input value={form.lieu} onChange={e => f('lieu', e.target.value)} /></Field>
            </div>
            <Field label="URL catalogue"><input value={form.url_catalogue} onChange={e => f('url_catalogue', e.target.value)} /></Field>
            <Field label="Notes"><textarea value={form.notes} onChange={e => f('notes', e.target.value)} rows={3} /></Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Btn onClick={() => setModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={save}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
