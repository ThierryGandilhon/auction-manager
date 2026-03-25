import { useEffect, useState } from 'react'
import { auctionsApi, etudesApi } from '../lib/api'
import { Auction, Etude } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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

  const selectCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  const textareaCls = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Auctions</h1>
          <p className="text-muted-foreground mt-1">Ventes aux enchères</p>
        </div>
        <Btn variant="primary" onClick={() => open()}>+ Nouvelle auction</Btn>
      </div>

      <div className="grid gap-3">
        {auctions.map(a => (
          <Card key={a.id} className="cursor-pointer hover:border-ring/50 transition-colors" onClick={() => navigate(`/auctions/${a.id}`)}>
            <CardContent className="py-4 flex justify-between items-center">
              <div>
                <div className="font-medium mb-1">{a.titre}</div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span className="text-primary">{a.etude.nom}</span>
                  {a.date_auction && <span>📅 {new Date(a.date_auction).toLocaleDateString('fr-FR')}</span>}
                  {a.lieu && <span>📍 {a.lieu}</span>}
                </div>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <Btn size="sm" onClick={() => open(a)}>Modifier</Btn>
                <Btn size="sm" variant="danger" onClick={() => del(a.id)}>Supprimer</Btn>
              </div>
            </CardContent>
          </Card>
        ))}
        {auctions.length === 0 && (
          <div className="text-muted-foreground text-center py-10">Aucune auction enregistrée</div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Modifier l\'auction' : 'Nouvelle auction'} onClose={() => setModal(false)}>
          <div className="grid gap-4">
            <Field label="Étude *">
              <select className={selectCls} value={form.etude_id} onChange={e => f('etude_id', e.target.value)}>
                <option value={0}>Sélectionner une étude...</option>
                {etudes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </Field>
            <Field label="Titre *"><Input value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="Vente du 15 janvier" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date"><Input type="date" value={form.date_auction} onChange={e => f('date_auction', e.target.value)} /></Field>
              <Field label="Lieu"><Input value={form.lieu} onChange={e => f('lieu', e.target.value)} /></Field>
            </div>
            <Field label="URL catalogue"><Input value={form.url_catalogue} onChange={e => f('url_catalogue', e.target.value)} /></Field>
            <Field label="Notes"><textarea className={textareaCls} value={form.notes} onChange={e => f('notes', e.target.value)} rows={3} /></Field>
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
