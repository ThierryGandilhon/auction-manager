import { useEffect, useState } from 'react'
import { achats as api, auctions as auctionsApi } from '../lib/api'
import type { Achat, Auction } from '../types/index'

const empty = { auction_id: 0, numero_lot: '', prix_achat: '', notes: '' }

export default function Achats() {
  const [items, setItems] = useState<Achat[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [filterAuction, setFilterAuction] = useState<number | undefined>()

  const load = () => api.list(filterAuction).then(setItems)
  useEffect(() => { auctionsApi.list().then(setAuctions) }, [])
  useEffect(() => { load() }, [filterAuction])

  const save = async () => {
    const data = { ...form, auction_id: Number(form.auction_id), prix_achat: form.prix_achat ? Number(form.prix_achat) : null }
    if (editing) await api.update(editing, data)
    else await api.create(data)
    setModal(false); setForm(empty); setEditing(null); load()
  }

  const del = async (id: number) => {
    if (confirm('Supprimer ce lot ?')) { await api.delete(id); load() }
  }

  const edit = (a: Achat) => {
    setForm({ auction_id: a.auction_id, numero_lot: a.numero_lot || '', prix_achat: a.prix_achat?.toString() || '', notes: '' })
    setEditing(a.id); setModal(true)
  }

  const fmt = (n?: number) => n != null ? n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  return (
    <div className="page">
      <div className="page-header">
        <h1>Achats (lots)</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={{ width: 220 }} value={filterAuction || ''} onChange={e => setFilterAuction(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">Toutes les auctions</option>
            {auctions.map(a => <option key={a.id} value={a.id}>{a.titre}</option>)}
          </select>
          <button className="btn-primary" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>+ Nouveau lot</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {items.length === 0 ? (
          <div className="empty-state"><div>Aucun achat</div><p>Enregistrez vos achats aux enchères</p></div>
        ) : (
          <table>
            <thead><tr><th>Lot</th><th>Auction</th><th>Date</th><th>Prix d'achat</th><th></th></tr></thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>Lot {a.numero_lot || a.id}</td>
                  <td>{a.auction?.titre}</td>
                  <td>{a.auction?.date_auction ? new Date(a.auction.date_auction).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={{ color: 'var(--gold)' }}>{fmt(a.prix_achat)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-ghost" style={{ marginRight: 8, padding: '5px 12px' }} onClick={() => edit(a)}>Modifier</button>
                    <button className="btn-danger" style={{ padding: '5px 12px' }} onClick={() => del(a.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>{editing ? 'Modifier' : 'Nouveau'} lot</h2>
            <div className="form-grid">
              <div className="form-group full">
                <label>Auction *</label>
                <select value={form.auction_id} onChange={e => setForm({...form, auction_id: Number(e.target.value)})}>
                  <option value={0}>Sélectionner une auction</option>
                  {auctions.map(a => <option key={a.id} value={a.id}>{a.titre} {a.date_auction ? `(${new Date(a.date_auction).toLocaleDateString('fr-FR')})` : ''}</option>)}
                </select>
              </div>
              <div className="form-group"><label>N° de lot</label><input value={form.numero_lot} onChange={e => setForm({...form, numero_lot: e.target.value})} /></div>
              <div className="form-group"><label>Prix d'achat (€)</label><input type="number" step="0.01" value={form.prix_achat} onChange={e => setForm({...form, prix_achat: e.target.value})} /></div>
              <div className="form-group full"><label>Notes</label><textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <div className="form-actions">
              <button className="btn-ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={save} disabled={!form.auction_id}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
