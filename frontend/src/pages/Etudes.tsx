import { useEffect, useState } from 'react'
import { etudesApi } from '../lib/api'
import { Etude } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'

const empty = { nom: '', ville: '', email: '', telephone: '', site_web: '' }

export default function Etudes() {
  const [etudes, setEtudes] = useState<Etude[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Etude | null>(null)
  const [form, setForm] = useState(empty)

  const load = () => etudesApi.list().then(setEtudes)
  useEffect(() => { load() }, [])

  const open = (e?: Etude) => {
    setEditing(e || null)
    setForm(e ? { nom: e.nom, ville: e.ville || '', email: e.email || '', telephone: e.telephone || '', site_web: e.site_web || '' } : empty)
    setModal(true)
  }

  const save = async () => {
    if (editing) await etudesApi.update(editing.id, form)
    else await etudesApi.create(form)
    setModal(false)
    load()
  }

  const del = async (id: number) => {
    if (confirm('Supprimer cette étude ?')) { await etudesApi.delete(id); load() }
  }

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Études</h1>
          <p style={{ color: 'var(--text3)' }}>Commissaires-priseurs</p>
        </div>
        <Btn variant="primary" onClick={() => open()}>+ Nouvelle étude</Btn>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {etudes.map(e => (
          <div key={e.id} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{e.nom}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', gap: 16 }}>
                {e.ville && <span>📍 {e.ville}</span>}
                {e.email && <span>✉ {e.email}</span>}
                {e.telephone && <span>☎ {e.telephone}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" onClick={() => open(e)}>Modifier</Btn>
              <Btn size="sm" variant="danger" onClick={() => del(e.id)}>Supprimer</Btn>
            </div>
          </div>
        ))}
        {etudes.length === 0 && (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>
            Aucune étude enregistrée
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Modifier l\'étude' : 'Nouvelle étude'} onClose={() => setModal(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Nom *"><input value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Hôtel Drouot" /></Field>
            <Field label="Ville"><input value={form.ville} onChange={e => f('ville', e.target.value)} placeholder="Paris" /></Field>
            <Field label="Email"><input value={form.email} onChange={e => f('email', e.target.value)} placeholder="contact@etude.fr" /></Field>
            <Field label="Téléphone"><input value={form.telephone} onChange={e => f('telephone', e.target.value)} /></Field>
            <Field label="Site web"><input value={form.site_web} onChange={e => f('site_web', e.target.value)} /></Field>
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
