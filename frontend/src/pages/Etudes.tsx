import { useEffect, useState } from 'react'
import { etudesApi } from '../lib/api'
import { Etude } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Études</h1>
          <p className="text-muted-foreground mt-1">Commissaires-priseurs</p>
        </div>
        <Btn variant="primary" onClick={() => open()}>+ Nouvelle étude</Btn>
      </div>

      <div className="grid gap-3">
        {etudes.map(e => (
          <Card key={e.id}>
            <CardContent className="py-4 flex justify-between items-center">
              <div>
                <div className="font-medium mb-1">{e.nom}</div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  {e.ville && <span>📍 {e.ville}</span>}
                  {e.email && <span>✉ {e.email}</span>}
                  {e.telephone && <span>☎ {e.telephone}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Btn size="sm" onClick={() => open(e)}>Modifier</Btn>
                <Btn size="sm" variant="danger" onClick={() => del(e.id)}>Supprimer</Btn>
              </div>
            </CardContent>
          </Card>
        ))}
        {etudes.length === 0 && (
          <div className="text-muted-foreground text-center py-10">Aucune étude enregistrée</div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Modifier l\'étude' : 'Nouvelle étude'} onClose={() => setModal(false)}>
          <div className="grid gap-4">
            <Field label="Nom *"><Input value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Hôtel Drouot" /></Field>
            <Field label="Ville"><Input value={form.ville} onChange={e => f('ville', e.target.value)} placeholder="Paris" /></Field>
            <Field label="Email"><Input value={form.email} onChange={e => f('email', e.target.value)} placeholder="contact@etude.fr" /></Field>
            <Field label="Téléphone"><Input value={form.telephone} onChange={e => f('telephone', e.target.value)} /></Field>
            <Field label="Site web"><Input value={form.site_web} onChange={e => f('site_web', e.target.value)} /></Field>
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
