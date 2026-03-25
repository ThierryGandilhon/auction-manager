import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { objetsApi, photoUrl } from '../lib/api'
import type { Objet } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statutConfig: Record<string, { label: string; className: string }> = {
  'acheté':  { label: 'Acheté',   className: 'bg-muted text-muted-foreground hover:bg-muted' },
  en_vente:  { label: 'En vente', className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/10' },
  vendu:     { label: 'Vendu',    className: 'bg-green-500/10 text-green-600 hover:bg-green-500/10' },
}

const textareaCls = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export default function ObjetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [objet, setObjet] = useState<Objet | null>(null)
  const [editObjetModal, setEditObjetModal] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const o = await objetsApi.get(Number(id))
    setObjet(o)
  }
  useEffect(() => { load() }, [id])

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    await objetsApi.uploadPhoto(Number(id), e.target.files[0])
    load()
  }

  const delPhoto = async (photoId: number) => {
    if (confirm('Supprimer cette photo ?')) { await objetsApi.deletePhoto(photoId); load() }
  }

  const openEditObjet = () => {
    if (!objet) return
    setEditForm({
      designation: objet.designation, description: objet.description || '',
      couleur: objet.couleur || '', materiau: objet.materiau || '',
      poids: objet.poids || '', dimensions: objet.dimensions || '',
      periode: objet.periode || '',
      prix_achat: objet.prix_achat?.toString() || '',
      prix_estime: objet.prix_estime?.toString() || '',
    })
    setEditObjetModal(true)
  }

  const saveObjet = async () => {
    await objetsApi.update(Number(id), {
      ...editForm,
      lot_id: objet!.lot_id,
      prix_achat: editForm.prix_achat ? Number(editForm.prix_achat) : null,
      prix_estime: editForm.prix_estime ? Number(editForm.prix_estime) : null,
    })
    setEditObjetModal(false)
    load()
  }

  const fe = (k: string, v: string) => setEditForm(p => ({ ...p, [k]: v }))

  if (!objet) return <div className="text-muted-foreground">Chargement...</div>

  const cfg = statutConfig[objet.statut] || statutConfig['acheté']
  const fmt = (n?: number) => n != null ? Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  return (
    <div className="space-y-6">
      <div>
        <Btn size="sm" onClick={() => navigate(-1)}>← Retour</Btn>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-semibold tracking-tight">{objet.designation}</h1>
            <Badge className={cfg.className}>{cfg.label}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Lot {objet.lot.numero_lot || objet.lot_id}
          </div>
        </div>
        <div className="flex gap-2">
          <Btn size="sm" onClick={openEditObjet}>Modifier</Btn>
          {objet.vente && (
            <Btn size="sm" variant="primary" onClick={() => navigate('/ventes')}>
              Voir la vente
            </Btn>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-semibold mb-4">Caractéristiques</h3>
            <div className="grid gap-2.5">
              {([
                ['Couleur', objet.couleur], ['Matériau', objet.materiau],
                ['Poids', objet.poids], ['Dimensions', objet.dimensions],
                ['Période', objet.periode],
              ] as [string, string | undefined][]).map(([k, v]) => v ? (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span>{v}</span>
                </div>
              ) : null)}
            </div>
            {objet.description && (
              <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{objet.description}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <h3 className="font-semibold mb-4">Finance</h3>
            <div className="grid gap-3">
              {objet.prix_achat != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix d'achat</span>
                  <span className="text-lg font-semibold text-red-500">{fmt(objet.prix_achat)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix estimé</span>
                <span className="text-lg font-semibold">{fmt(objet.prix_estime)}</span>
              </div>
              {objet.vente && <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix de vente</span>
                  <span className="text-lg font-semibold text-green-600">{fmt(objet.vente.prix_vente)}</span>
                </div>
                {objet.vente.prix_vente != null && objet.prix_achat != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Marge</span>
                    <span className={cn('font-medium', (objet.vente.prix_vente - objet.prix_achat) >= 0 ? 'text-green-600' : 'text-destructive')}>
                      {fmt(objet.vente.prix_vente - objet.prix_achat)}
                    </span>
                  </div>
                )}
                <div className="mt-1 p-3 bg-muted/50 rounded-md text-sm">
                  <div className="text-muted-foreground text-xs mb-1">Vente</div>
                  <div>{objet.vente.plateforme || '—'} · {objet.vente.date_vente ? new Date(objet.vente.date_vente).toLocaleDateString('fr-FR') : '—'}</div>
                  {objet.vente.client && (
                    <div className="text-primary mt-1">{objet.vente.client.prenom} {objet.vente.client.nom}</div>
                  )}
                </div>
              </>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Photos</h3>
            <Btn size="sm" onClick={() => fileRef.current?.click()}>+ Ajouter</Btn>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
            {objet.photos.map(p => (
              <div key={p.id} className="relative rounded-md overflow-hidden aspect-square">
                <img src={photoUrl(p.chemin_fichier)} alt={p.legende || ''} className="w-full h-full object-cover" />
                <button
                  onClick={() => delPhoto(p.id)}
                  className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black/90 transition-colors"
                >✕</button>
              </div>
            ))}
            {objet.photos.length === 0 && (
              <div className="text-muted-foreground text-sm py-2">Aucune photo</div>
            )}
          </div>
        </CardContent>
      </Card>

      {editObjetModal && (
        <Modal title="Modifier l'objet" onClose={() => setEditObjetModal(false)}>
          <div className="grid gap-4">
            <Field label="Désignation *"><Input value={editForm.designation} onChange={e => fe('designation', e.target.value)} /></Field>
            <Field label="Description"><textarea className={textareaCls} value={editForm.description} onChange={e => fe('description', e.target.value)} rows={3} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Couleur"><Input value={editForm.couleur} onChange={e => fe('couleur', e.target.value)} /></Field>
              <Field label="Matériau"><Input value={editForm.materiau} onChange={e => fe('materiau', e.target.value)} /></Field>
              <Field label="Poids"><Input value={editForm.poids} onChange={e => fe('poids', e.target.value)} /></Field>
              <Field label="Dimensions"><Input value={editForm.dimensions} onChange={e => fe('dimensions', e.target.value)} /></Field>
              <Field label="Période"><Input value={editForm.periode} onChange={e => fe('periode', e.target.value)} /></Field>
              <Field label="Prix d'achat (€)"><Input type="number" value={editForm.prix_achat} onChange={e => fe('prix_achat', e.target.value)} /></Field>
              <Field label="Prix estimé (€)"><Input type="number" value={editForm.prix_estime} onChange={e => fe('prix_estime', e.target.value)} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setEditObjetModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveObjet}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
