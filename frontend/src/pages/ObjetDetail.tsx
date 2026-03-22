import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { objetsApi, ventesApi, clientsApi, photoUrl } from '../lib/api'
import { Objet, Client, Vente } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'

const statutBadge: Record<string, { label: string; color: string; bg: string }> = {
  en_stock: { label: 'En stock', color: 'var(--text2)', bg: 'var(--bg3)' },
  en_vente: { label: 'En vente', color: 'var(--blue)', bg: 'var(--blue-dim)' },
  vendu:    { label: 'Vendu',    color: 'var(--green)', bg: 'var(--green-dim)' },
}

const emptyVente = { plateforme: '', prix_vente: '', date_vente: '', statut: 'en_ligne', client_id: '' }

export default function ObjetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [objet, setObjet] = useState<Objet | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [venteModal, setVenteModal] = useState(false)
  const [venteForm, setVenteForm] = useState(emptyVente)
  const [editVente, setEditVente] = useState<Vente | null>(null)
  const [editObjetModal, setEditObjetModal] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const o = await objetsApi.get(Number(id))
    setObjet(o)
    clientsApi.list().then(setClients)
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

  const openVenteModal = () => {
    const v = objet?.vente
    setEditVente(v || null)
    setVenteForm(v ? {
      plateforme: v.plateforme || '', prix_vente: v.prix_vente?.toString() || '',
      date_vente: v.date_vente || '', statut: v.statut,
      client_id: v.client_id?.toString() || '',
    } : emptyVente)
    setVenteModal(true)
  }

  const saveVente = async () => {
    const data = {
      objet_id: Number(id),
      plateforme: venteForm.plateforme || null,
      prix_vente: venteForm.prix_vente ? Number(venteForm.prix_vente) : null,
      date_vente: venteForm.date_vente || null,
      statut: venteForm.statut,
      client_id: venteForm.client_id ? Number(venteForm.client_id) : null,
    }
    if (editVente) await ventesApi.update(editVente.id, data)
    else await ventesApi.create(data)
    setVenteModal(false)
    load()
  }

  const openEditObjet = () => {
    if (!objet) return
    setEditForm({
      designation: objet.designation, description: objet.description || '',
      couleur: objet.couleur || '', materiau: objet.materiau || '',
      poids: objet.poids || '', dimensions: objet.dimensions || '',
      periode: objet.periode || '', prix_estime: objet.prix_estime?.toString() || '',
    })
    setEditObjetModal(true)
  }

  const saveObjet = async () => {
    await objetsApi.update(Number(id), { ...editForm, achat_id: objet!.achat_id, prix_estime: editForm.prix_estime ? Number(editForm.prix_estime) : null })
    setEditObjetModal(false)
    load()
  }

  const fv = (k: string, v: string) => setVenteForm(p => ({ ...p, [k]: v }))
  const fe = (k: string, v: string) => setEditForm(p => ({ ...p, [k]: v }))

  if (!objet) return <div style={{ color: 'var(--text3)' }}>Chargement...</div>

  const badge = statutBadge[objet.statut]
  const fmt = (n?: number) => n != null ? Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Btn size="sm" onClick={() => navigate(-1)}>← Retour</Btn>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 32 }}>{objet.designation}</h1>
            <span style={{ fontSize: 13, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color }}>{badge.label}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Lot {objet.achat.numero_lot || objet.achat_id} · {objet.achat.auction?.titre}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" onClick={openEditObjet}>Modifier</Btn>
          <Btn size="sm" variant="primary" onClick={openVenteModal}>
            {objet.vente ? 'Modifier la vente' : 'Mettre en vente'}
          </Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Caractéristiques */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Caractéristiques</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['Couleur', objet.couleur], ['Matériau', objet.materiau],
              ['Poids', objet.poids], ['Dimensions', objet.dimensions],
              ['Période', objet.periode],
            ].map(([k, v]) => v ? (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span>{v}</span>
              </div>
            ) : null)}
          </div>
          {objet.description && <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{objet.description}</p>}
        </div>

        {/* Finance */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Finance</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text3)' }}>Prix estimé</span>
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18 }}>{fmt(objet.prix_estime)}</span>
            </div>
            {objet.vente && <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text3)' }}>Prix de vente</span>
                <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--green)' }}>{fmt(objet.vente.prix_vente)}</span>
              </div>
              {objet.vente.marge != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text3)' }}>Marge</span>
                  <span style={{ color: objet.vente.marge >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>{fmt(objet.vente.marge)}</span>
                </div>
              )}
              <div style={{ marginTop: 4, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                <div style={{ color: 'var(--text3)', marginBottom: 4 }}>Vente</div>
                <div>{objet.vente.plateforme || '—'} · {objet.vente.date_vente ? new Date(objet.vente.date_vente).toLocaleDateString('fr-FR') : '—'}</div>
                {objet.vente.client && <div style={{ color: 'var(--accent)', marginTop: 4 }}>{objet.vente.client.prenom} {objet.vente.client.nom}</div>}
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* Photos */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>Photos</h3>
          <Btn size="sm" onClick={() => fileRef.current?.click()}>+ Ajouter</Btn>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPhoto} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {objet.photos.map(p => (
            <div key={p.id} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1' }}>
              <img src={photoUrl(p.chemin_fichier)} alt={p.legende || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => delPhoto(p.id)} style={{
                position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)',
                border: 'none', color: '#fff', borderRadius: 20, width: 24, height: 24,
                fontSize: 12, cursor: 'pointer',
              }}>✕</button>
            </div>
          ))}
          {objet.photos.length === 0 && (
            <div style={{ color: 'var(--text3)', fontSize: 13, padding: '8px 0' }}>Aucune photo</div>
          )}
        </div>
      </div>

      {/* Modal vente */}
      {venteModal && (
        <Modal title={editVente ? 'Modifier la vente' : 'Mettre en vente'} onClose={() => setVenteModal(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Plateforme"><input value={venteForm.plateforme} onChange={e => fv('plateforme', e.target.value)} placeholder="eBay, Leboncoin..." /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Prix de vente (€)"><input type="number" value={venteForm.prix_vente} onChange={e => fv('prix_vente', e.target.value)} /></Field>
              <Field label="Date de vente"><input type="date" value={venteForm.date_vente} onChange={e => fv('date_vente', e.target.value)} /></Field>
            </div>
            <Field label="Client (optionnel)">
              <select value={venteForm.client_id} onChange={e => fv('client_id', e.target.value)}>
                <option value="">Aucun client associé</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
              </select>
            </Field>
            <Field label="Statut">
              <select value={venteForm.statut} onChange={e => fv('statut', e.target.value)}>
                <option value="en_ligne">En ligne</option>
                <option value="vendu">Vendu</option>
                <option value="annule">Annulé</option>
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Btn onClick={() => setVenteModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveVente}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal modifier objet */}
      {editObjetModal && (
        <Modal title="Modifier l'objet" onClose={() => setEditObjetModal(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Désignation *"><input value={editForm.designation} onChange={e => fe('designation', e.target.value)} /></Field>
            <Field label="Description"><textarea value={editForm.description} onChange={e => fe('description', e.target.value)} rows={3} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Couleur"><input value={editForm.couleur} onChange={e => fe('couleur', e.target.value)} /></Field>
              <Field label="Matériau"><input value={editForm.materiau} onChange={e => fe('materiau', e.target.value)} /></Field>
              <Field label="Poids"><input value={editForm.poids} onChange={e => fe('poids', e.target.value)} /></Field>
              <Field label="Dimensions"><input value={editForm.dimensions} onChange={e => fe('dimensions', e.target.value)} /></Field>
              <Field label="Période"><input value={editForm.periode} onChange={e => fe('periode', e.target.value)} /></Field>
              <Field label="Prix estimé (€)"><input type="number" value={editForm.prix_estime} onChange={e => fe('prix_estime', e.target.value)} /></Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Btn onClick={() => setEditObjetModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveObjet}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
