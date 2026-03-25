import { useEffect, useState } from 'react'
import { ventesApi, objetsApi, clientsApi } from '../lib/api'
import type { Vente, Objet, Client } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const statutVenteConfig: Record<string, { label: string; className: string }> = {
  en_cours:   { label: 'En cours',   className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/10' },
  'finalisée': { label: 'Finalisée',  className: 'bg-green-500/10 text-green-600 hover:bg-green-500/10' },
  'annulée':   { label: 'Annulée',    className: 'bg-destructive/10 text-destructive hover:bg-destructive/10' },
}

const emptyVente = { client_id: '', plateforme: '', date_vente: '', notes: '', statut: 'en_cours' }
const selectCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
const textareaCls = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export default function Ventes() {
  const [ventes, setVentes] = useState<Vente[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [objetsDispos, setObjetsDispos] = useState<Objet[]>([])
  const [filtre, setFiltre] = useState('')
  const [venteModal, setVenteModal] = useState(false)
  const [editVente, setEditVente] = useState<Vente | null>(null)
  const [venteForm, setVenteForm] = useState<typeof emptyVente>(emptyVente)
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null)
  const [addObjetModal, setAddObjetModal] = useState(false)
  const [selectedObjetId, setSelectedObjetId] = useState('')
  const [prixVente, setPrixVente] = useState('')

  const load = () => {
    ventesApi.list(filtre ? { statut: filtre } : {}).then(setVentes)
    clientsApi.list().then(setClients)
  }

  useEffect(() => { load() }, [filtre])

  const fmt = (n?: number) => n != null ? Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  const openCreateVente = () => {
    setEditVente(null)
    setVenteForm(emptyVente)
    setVenteModal(true)
  }

  const openEditVente = (v: Vente, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditVente(v)
    setVenteForm({
      client_id: v.client_id?.toString() || '',
      plateforme: v.plateforme || '',
      date_vente: v.date_vente || '',
      notes: v.notes || '',
      statut: v.statut,
    })
    setVenteModal(true)
  }

  const saveVente = async () => {
    const data = {
      ...venteForm,
      client_id: venteForm.client_id ? Number(venteForm.client_id) : null,
      date_vente: venteForm.date_vente || null,
    }
    if (editVente) await ventesApi.update(editVente.id, data)
    else await ventesApi.create(data)
    setVenteModal(false)
    load()
    if (selectedVente && editVente?.id === selectedVente.id) {
      const updated = await ventesApi.get(editVente.id)
      setSelectedVente(updated)
    }
  }

  const delVente = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Supprimer cette vente ?')) {
      await ventesApi.delete(id)
      if (selectedVente?.id === id) setSelectedVente(null)
      load()
    }
  }

  const selectVente = async (v: Vente) => {
    if (selectedVente?.id === v.id) { setSelectedVente(null); return }
    const full = await ventesApi.get(v.id)
    setSelectedVente(full)
    // Load available objets (acheté status = not yet in a sale)
    objetsApi.list({ statut: 'acheté' }).then(setObjetsDispos)
  }

  const openAddObjet = () => {
    objetsApi.list({ statut: 'acheté' }).then(setObjetsDispos)
    setSelectedObjetId('')
    setPrixVente('')
    setAddObjetModal(true)
  }

  const addObjet = async () => {
    if (!selectedVente || !selectedObjetId) return
    await ventesApi.addObjet(selectedVente.id, Number(selectedObjetId), prixVente ? Number(prixVente) : null)
    const updated = await ventesApi.get(selectedVente.id)
    setSelectedVente(updated)
    setAddObjetModal(false)
    load()
  }

  const removeObjet = async (objet_id: number) => {
    if (!selectedVente) return
    if (confirm('Retirer cet objet de la vente ?')) {
      await ventesApi.removeObjet(selectedVente.id, objet_id)
      const updated = await ventesApi.get(selectedVente.id)
      setSelectedVente(updated)
      load()
    }
  }

  const updatePrix = async (objet_id: number, prix: string) => {
    if (!selectedVente) return
    await ventesApi.updateObjet(selectedVente.id, objet_id, prix ? Number(prix) : null)
    const updated = await ventesApi.get(selectedVente.id)
    setSelectedVente(updated)
    load()
  }

  const fv = (k: string, v: string) => setVenteForm(p => ({ ...p, [k]: v }))

  const filtres = ['', 'en_cours', 'finalisée', 'annulée'] as const
  const filtreLabels: Record<string, string> = { '': 'Toutes', en_cours: 'En cours', 'finalisée': 'Finalisées', 'annulée': 'Annulées' }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Ventes</h1>
          <p className="text-muted-foreground mt-1">Gérez vos ventes d'objets</p>
        </div>
        <Btn variant="primary" onClick={openCreateVente}>+ Nouvelle vente</Btn>
      </div>

      <div className="flex gap-2">
        {filtres.map(s => (
          <Btn key={s} size="sm" variant={filtre === s ? 'primary' : 'ghost'} onClick={() => setFiltre(s)}>
            {filtreLabels[s]}
          </Btn>
        ))}
      </div>

      <div className="grid gap-3">
        {ventes.map(v => {
          const cfg = statutVenteConfig[v.statut] || statutVenteConfig['en_cours']
          const isSelected = selectedVente?.id === v.id
          return (
            <div key={v.id} className="space-y-0">
              <Card className={cn('cursor-pointer transition-colors', isSelected ? 'border-ring' : 'hover:border-ring/50')}
                onClick={() => selectVente(v)}>
                <CardContent className="py-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                      {v.plateforme && <span className="text-sm font-medium">{v.plateforme}</span>}
                      {v.date_vente && <span className="text-sm text-muted-foreground">📅 {new Date(v.date_vente).toLocaleDateString('fr-FR')}</span>}
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-4">
                      {v.client && <span className="text-primary">{v.client.prenom} {v.client.nom}</span>}
                      <span>{v.vente_objets.length} objet{v.vente_objets.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {v.total_vente != null && (
                      <span className="text-lg font-semibold text-green-600">{fmt(v.total_vente)}</span>
                    )}
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <Btn size="sm" onClick={(e: React.MouseEvent) => openEditVente(v, e)}>Modifier</Btn>
                      <Btn size="sm" variant="danger" onClick={(e: React.MouseEvent) => delVente(v.id, e)}>Supprimer</Btn>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isSelected && selectedVente && (
                <Card className="border-t-0 rounded-t-none border-ring/50 bg-muted/20">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-sm">Objets dans cette vente</h3>
                      {selectedVente.statut !== 'finalisée' && selectedVente.statut !== 'annulée' && (
                        <Btn size="sm" variant="primary" onClick={openAddObjet}>+ Ajouter un objet</Btn>
                      )}
                    </div>
                    {selectedVente.vente_objets.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2">Aucun objet dans cette vente</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedVente.vente_objets.map(vo => (
                          <div key={vo.id} className="flex items-center gap-3 bg-background border rounded-md px-3 py-2">
                            <span className="flex-1 text-sm font-medium">{vo.objet.designation}</span>
                            {vo.objet.prix_achat != null && (
                              <span className="text-xs text-muted-foreground">coût: {fmt(vo.objet.prix_achat)}</span>
                            )}
                            <div className="flex items-center gap-2">
                              <PrixInput
                                value={vo.prix_vente}
                                onBlur={v => updatePrix(vo.objet_id, v)}
                                disabled={selectedVente.statut === 'finalisée' || selectedVente.statut === 'annulée'}
                              />
                              {vo.marge != null && (
                                <span className={cn('text-xs font-medium w-20 text-right', vo.marge >= 0 ? 'text-green-600' : 'text-destructive')}>
                                  {vo.marge >= 0 ? '+' : ''}{fmt(vo.marge)}
                                </span>
                              )}
                            </div>
                            {selectedVente.statut !== 'finalisée' && selectedVente.statut !== 'annulée' && (
                              <Btn size="sm" variant="danger" onClick={() => removeObjet(vo.objet_id)}>✕</Btn>
                            )}
                          </div>
                        ))}
                        {selectedVente.total_vente != null && (
                          <div className="flex justify-end pt-1 text-sm font-semibold text-green-600">
                            Total: {fmt(selectedVente.total_vente)}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
        {ventes.length === 0 && (
          <div className="text-muted-foreground text-center py-10">Aucune vente enregistrée</div>
        )}
      </div>

      {venteModal && (
        <Modal title={editVente ? 'Modifier la vente' : 'Nouvelle vente'} onClose={() => setVenteModal(false)}>
          <div className="grid gap-4">
            <Field label="Plateforme"><Input value={venteForm.plateforme} onChange={e => fv('plateforme', e.target.value)} placeholder="eBay, Leboncoin, Drouot..." /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date de vente"><Input type="date" value={venteForm.date_vente} onChange={e => fv('date_vente', e.target.value)} /></Field>
              <Field label="Statut">
                <select className={selectCls} value={venteForm.statut} onChange={e => fv('statut', e.target.value)}>
                  <option value="en_cours">En cours</option>
                  <option value="finalisée">Finalisée</option>
                  <option value="annulée">Annulée</option>
                </select>
              </Field>
            </div>
            <Field label="Client (optionnel)">
              <select className={selectCls} value={venteForm.client_id} onChange={e => fv('client_id', e.target.value)}>
                <option value="">Aucun client associé</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
              </select>
            </Field>
            <Field label="Notes"><textarea className={textareaCls} value={venteForm.notes} onChange={e => fv('notes', e.target.value)} rows={3} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setVenteModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveVente}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}

      {addObjetModal && (
        <Modal title="Ajouter un objet à la vente" onClose={() => setAddObjetModal(false)}>
          <div className="grid gap-4">
            <Field label="Objet *">
              <select className={selectCls} value={selectedObjetId} onChange={e => setSelectedObjetId(e.target.value)}>
                <option value="">Sélectionner un objet disponible...</option>
                {objetsDispos.map(o => <option key={o.id} value={o.id}>{o.designation}</option>)}
              </select>
            </Field>
            <Field label="Prix de vente (€)">
              <Input type="number" step="0.01" value={prixVente} onChange={e => setPrixVente(e.target.value)} placeholder="0.00" />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setAddObjetModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={addObjet} disabled={!selectedObjetId}>Ajouter</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function PrixInput({ value, onBlur, disabled }: { value?: number; onBlur: (v: string) => void; disabled?: boolean }) {
  const [local, setLocal] = useState(value?.toString() ?? '')
  useEffect(() => { setLocal(value?.toString() ?? '') }, [value])
  return (
    <Input
      type="number"
      step="0.01"
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => onBlur(local)}
      placeholder="Prix €"
      disabled={disabled}
      className="w-28 h-7 text-sm"
    />
  )
}
