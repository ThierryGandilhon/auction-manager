import { useEffect, useState } from 'react'
import { clientsApi } from '../lib/api'
import { Client } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'

const empty = { nom: '', prenom: '', email: '', telephone: '', adresse: '', notes: '' }

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(empty)

  const load = () => clientsApi.list().then(setClients)
  useEffect(() => { load() }, [])

  const open = (c?: Client) => {
    setEditing(c || null)
    setForm(c ? { nom: c.nom, prenom: c.prenom || '', email: c.email || '', telephone: c.telephone || '', adresse: c.adresse || '', notes: c.notes || '' } : empty)
    setModal(true)
  }

  const save = async () => {
    if (editing) await clientsApi.update(editing.id, form)
    else await clientsApi.create(form)
    setModal(false)
    load()
  }

  const del = async (id: number) => {
    if (confirm('Supprimer ce client ?')) { await clientsApi.delete(id); load() }
  }

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Clients</h1>
          <p style={{ color: 'var(--text3)' }}>Vos acheteurs</p>
        </div>
        <Btn variant="primary" onClick={() => open()}>+ Nouveau client</Btn>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {clients.map(c => (
          <div key={c.id} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                {c.prenom} {c.nom}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', gap: 16 }}>
                {c.email && <span>✉ {c.email}</span>}
                {c.telephone && <span>☎ {c.telephone}</span>}
                {c.adresse && <span>📍 {c.adresse}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" onClick={() => open(c)}>Modifier</Btn>
              <Btn size="sm" variant="danger" onClick={() => del(c.id)}>Supprimer</Btn>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>Aucun client enregistré</div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Modifier le client' : 'Nouveau client'} onClose={() => setModal(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nom *"><input value={form.nom} onChange={e => f('nom', e.target.value)} /></Field>
              <Field label="Prénom"><input value={form.prenom} onChange={e => f('prenom', e.target.value)} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Email"><input type="email" value={form.email} onChange={e => f('email', e.target.value)} /></Field>
              <Field label="Téléphone"><input value={form.telephone} onChange={e => f('telephone', e.target.value)} /></Field>
            </div>
            <Field label="Adresse"><textarea value={form.adresse} onChange={e => f('adresse', e.target.value)} rows={2} /></Field>
            <Field label="Notes"><textarea value={form.notes} onChange={e => f('notes', e.target.value)} rows={2} /></Field>
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
