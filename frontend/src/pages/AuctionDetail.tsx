import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { achatsApi, lotsApi, objetsApi } from '../lib/api'
import type { Achat, Lot, Objet } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const emptyLot = { numero_lot: '', prix_achat: '', notes: '' }
const emptyObjet = { designation: '', description: '', couleur: '', materiau: '', poids: '', dimensions: '', periode: '', prix_achat: '', prix_estime: '' }

const statutConfig: Record<string, { label: string; className: string }> = {
  'acheté':  { label: 'Acheté',   className: 'bg-muted text-muted-foreground hover:bg-muted' },
  en_vente:  { label: 'En vente', className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/10' },
  vendu:     { label: 'Vendu',    className: 'bg-green-500/10 text-green-600 hover:bg-green-500/10' },
}

const textareaCls = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export default function AchatDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [achat, setAchat] = useState<Achat | null>(null)
  const [lots, setLots] = useState<Lot[]>([])
  const [lotModal, setLotModal] = useState(false)
  const [editLot, setEditLot] = useState<Lot | null>(null)
  const [lotForm, setLotForm] = useState(emptyLot)
  const [objetModal, setObjetModal] = useState(false)
  const [currentLotId, setCurrentLotId] = useState<number | null>(null)
  const [objetForm, setObjetForm] = useState(emptyObjet)
  const [objetsByLot, setObjetsByLot] = useState<Record<number, Objet[]>>({})

  const load = async () => {
    const a = await achatsApi.get(Number(id))
    setAchat(a)
    const ls = await lotsApi.list(Number(id))
    setLots(ls)
    const map: Record<number, Objet[]> = {}
    for (const lot of ls) {
      map[lot.id] = await objetsApi.list({ lot_id: lot.id })
    }
    setObjetsByLot(map)
  }
  useEffect(() => { load() }, [id])

  const saveLot = async () => {
    const data = { ...lotForm, achat_id: Number(id), prix_achat: lotForm.prix_achat ? Number(lotForm.prix_achat) : null }
    if (editLot) await lotsApi.update(editLot.id, data)
    else await lotsApi.create(data)
    setLotModal(false)
    load()
  }

  const delLot = async (lotId: number) => {
    if (confirm('Supprimer ce lot ?')) { await lotsApi.delete(lotId); load() }
  }

  const openObjetModal = (lotId: number) => {
    setCurrentLotId(lotId)
    setObjetForm(emptyObjet)
    setObjetModal(true)
  }

  const saveObjet = async () => {
    const data = {
      ...objetForm,
      lot_id: currentLotId,
      prix_achat: objetForm.prix_achat ? Number(objetForm.prix_achat) : null,
      prix_estime: objetForm.prix_estime ? Number(objetForm.prix_estime) : null,
    }
    await objetsApi.create(data)
    setObjetModal(false)
    load()
  }

  const delObjet = async (objId: number) => {
    if (confirm('Supprimer cet objet ?')) { await objetsApi.delete(objId); load() }
  }

  const fl = (k: string, v: string) => setLotForm(p => ({ ...p, [k]: v }))
  const fo = (k: string, v: string) => setObjetForm(p => ({ ...p, [k]: v }))

  if (!achat) return <div className="text-muted-foreground">Chargement...</div>

  const fmt = (n?: number) => n != null ? Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  return (
    <div className="space-y-6">
      <div>
        <Btn size="sm" onClick={() => navigate('/achats')}>← Retour</Btn>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-1">{achat.titre || `Achat #${achat.id}`}</h1>
        <div className="text-sm text-muted-foreground flex gap-4">
          <span className="text-primary">{achat.etude.nom}</span>
          {achat.date_achat && <span>📅 {new Date(achat.date_achat).toLocaleDateString('fr-FR')}</span>}
          {achat.lieu && <span>📍 {achat.lieu}</span>}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lots</h2>
        <Btn variant="primary" size="sm" onClick={() => { setEditLot(null); setLotForm(emptyLot); setLotModal(true) }}>
          + Ajouter un lot
        </Btn>
      </div>

      <div className="space-y-4">
        {lots.map(lot => (
          <Card key={lot.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Lot {lot.numero_lot || lot.id}</span>
                  {lot.prix_achat != null && (
                    <span className="text-lg font-semibold text-primary">
                      {fmt(lot.prix_achat)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" onClick={() => openObjetModal(lot.id)}>+ Objet</Btn>
                  <Btn size="sm" onClick={() => { setEditLot(lot); setLotForm({ numero_lot: lot.numero_lot || '', prix_achat: lot.prix_achat?.toString() || '', notes: lot.notes || '' }); setLotModal(true) }}>Modifier</Btn>
                  <Btn size="sm" variant="danger" onClick={() => delLot(lot.id)}>Supprimer</Btn>
                </div>
              </div>

              <div className="grid gap-2">
                {(objetsByLot[lot.id] || []).map(obj => {
                  const cfg = statutConfig[obj.statut] || statutConfig['acheté']
                  return (
                    <div key={obj.id}
                      className="bg-muted/40 border rounded-md px-4 py-2.5 flex justify-between items-center cursor-pointer hover:bg-muted/60 transition-colors"
                      onClick={() => navigate(`/objets/${obj.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{obj.designation}</span>
                        {obj.prix_achat != null && (
                          <span className="text-xs text-muted-foreground">acheté {fmt(obj.prix_achat)}</span>
                        )}
                        {obj.prix_estime != null && (
                          <span className="text-xs text-muted-foreground">estimé {fmt(obj.prix_estime)}</span>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge className={cfg.className}>{cfg.label}</Badge>
                        <Btn size="sm" variant="danger" onClick={e => { e.stopPropagation(); delObjet(obj.id) }}>✕</Btn>
                      </div>
                    </div>
                  )
                })}
                {(objetsByLot[lot.id] || []).length === 0 && (
                  <div className="text-xs text-muted-foreground py-2">Aucun objet dans ce lot</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {lots.length === 0 && (
          <div className="text-muted-foreground text-center py-10">Aucun lot enregistré</div>
        )}
      </div>

      {lotModal && (
        <Modal title={editLot ? 'Modifier le lot' : 'Nouveau lot'} onClose={() => setLotModal(false)}>
          <div className="grid gap-4">
            <Field label="Numéro de lot"><Input value={lotForm.numero_lot} onChange={e => fl('numero_lot', e.target.value)} placeholder="42" /></Field>
            <Field label="Prix d'achat du lot (€)"><Input type="number" value={lotForm.prix_achat} onChange={e => fl('prix_achat', e.target.value)} placeholder="0.00" /></Field>
            <Field label="Notes"><textarea className={textareaCls} value={lotForm.notes} onChange={e => fl('notes', e.target.value)} rows={3} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setLotModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveLot}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}

      {objetModal && (
        <Modal title="Nouvel objet" onClose={() => setObjetModal(false)}>
          <div className="grid gap-4">
            <Field label="Désignation *"><Input value={objetForm.designation} onChange={e => fo('designation', e.target.value)} placeholder="Vase en porcelaine" /></Field>
            <Field label="Description"><textarea className={textareaCls} value={objetForm.description} onChange={e => fo('description', e.target.value)} rows={3} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Couleur"><Input value={objetForm.couleur} onChange={e => fo('couleur', e.target.value)} /></Field>
              <Field label="Matériau"><Input value={objetForm.materiau} onChange={e => fo('materiau', e.target.value)} /></Field>
              <Field label="Poids"><Input value={objetForm.poids} onChange={e => fo('poids', e.target.value)} placeholder="1.2 kg" /></Field>
              <Field label="Dimensions"><Input value={objetForm.dimensions} onChange={e => fo('dimensions', e.target.value)} placeholder="30×20×15 cm" /></Field>
              <Field label="Période"><Input value={objetForm.periode} onChange={e => fo('periode', e.target.value)} placeholder="XIXe siècle" /></Field>
              <Field label="Prix d'achat (€)"><Input type="number" value={objetForm.prix_achat} onChange={e => fo('prix_achat', e.target.value)} /></Field>
              <Field label="Prix estimé (€)"><Input type="number" value={objetForm.prix_estime} onChange={e => fo('prix_estime', e.target.value)} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setObjetModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveObjet} disabled={!objetForm.designation}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
