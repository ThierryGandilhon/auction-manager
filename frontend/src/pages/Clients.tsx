import { useEffect, useState } from 'react'
import { clientsApi } from '../lib/api'
import { Client } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

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

  const textareaCls = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Vos acheteurs</p>
        </div>
        <Btn variant="primary" onClick={() => open()}>+ Nouveau client</Btn>
      </div>

      <div className="grid gap-3">
        {clients.map(c => (
          <Card key={c.id}>
            <CardContent className="py-4 flex justify-between items-center">
              <div>
                <div className="font-medium mb-1">{c.prenom} {c.nom}</div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  {c.email && <span>✉ {c.email}</span>}
                  {c.telephone && <span>☎ {c.telephone}</span>}
                  {c.adresse && <span>📍 {c.adresse}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Btn size="sm" onClick={() => open(c)}>Modifier</Btn>
                <Btn size="sm" variant="danger" onClick={() => del(c.id)}>Supprimer</Btn>
              </div>
            </CardContent>
          </Card>
        ))}
        {clients.length === 0 && (
          <div className="text-muted-foreground text-center py-10">Aucun client enregistré</div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Modifier le client' : 'Nouveau client'} onClose={() => setModal(false)}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom *"><Input value={form.nom} onChange={e => f('nom', e.target.value)} /></Field>
              <Field label="Prénom"><Input value={form.prenom} onChange={e => f('prenom', e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email"><Input type="email" value={form.email} onChange={e => f('email', e.target.value)} /></Field>
              <Field label="Téléphone"><Input value={form.telephone} onChange={e => f('telephone', e.target.value)} /></Field>
            </div>
            <Field label="Adresse"><textarea className={textareaCls} value={form.adresse} onChange={e => f('adresse', e.target.value)} rows={2} /></Field>
            <Field label="Notes"><textarea className={textareaCls} value={form.notes} onChange={e => f('notes', e.target.value)} rows={2} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={save}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
