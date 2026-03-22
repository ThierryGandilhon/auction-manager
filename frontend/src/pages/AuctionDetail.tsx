import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auctionsApi, achatsApi, objetsApi } from '../lib/api'
import { Auction, Achat, Objet } from '../types/index'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import Field from '../components/Field'

const emptyAchat = { numero_lot: '', prix_achat: '', notes: '' }
const emptyObjet = { designation: '', description: '', couleur: '', materiau: '', poids: '', dimensions: '', periode: '', prix_estime: '' }

const statutBadge: Record<string, { label: string; color: string; bg: string }> = {
  en_stock: { label: 'En stock', color: 'var(--text2)', bg: 'var(--bg3)' },
  en_vente: { label: 'En vente', color: 'var(--blue)', bg: 'var(--blue-dim)' },
  vendu:    { label: 'Vendu',    color: 'var(--green)', bg: 'var(--green-dim)' },
}

export default function AuctionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [auction, setAuction] = useState<Auction | null>(null)
  const [achats, setAchats] = useState<Achat[]>([])
  const [achatModal, setAchatModal] = useState(false)
  const [editAchat, setEditAchat] = useState<Achat | null>(null)
  const [achatForm, setAchatForm] = useState(emptyAchat)
  const [objetModal, setObjetModal] = useState(false)
  const [currentAchatId, setCurrentAchatId] = useState<number | null>(null)
  const [objetForm, setObjetForm] = useState(emptyObjet)
  const [objetsByAchat, setObjetsByAchat] = useState<Record<number, Objet[]>>({})

  const load = async () => {
    const a = await auctionsApi.get(Number(id))
    setAuction(a)
    const ach = await achatsApi.list(Number(id))
    setAchats(ach)
    const map: Record<number, Objet[]> = {}
    for (const achat of ach) {
      map[achat.id] = await objetsApi.list({ achat_id: achat.id })
    }
    setObjetsByAchat(map)
  }
  useEffect(() => { load() }, [id])

  const saveAchat = async () => {
    const data = { ...achatForm, auction_id: Number(id), prix_achat: achatForm.prix_achat ? Number(achatForm.prix_achat) : null }
    if (editAchat) await achatsApi.update(editAchat.id, data)
    else await achatsApi.create(data)
    setAchatModal(false)
    load()
  }

  const delAchat = async (achatId: number) => {
    if (confirm('Supprimer ce lot ?')) { await achatsApi.delete(achatId); load() }
  }

  const openObjetModal = (achatId: number) => {
    setCurrentAchatId(achatId)
    setObjetForm(emptyObjet)
    setObjetModal(true)
  }

  const saveObjet = async () => {
    const data = {
      ...objetForm,
      achat_id: currentAchatId,
      prix_estime: objetForm.prix_estime ? Number(objetForm.prix_estime) : null,
    }
    await objetsApi.create(data)
    setObjetModal(false)
    load()
  }

  const delObjet = async (objId: number) => {
    if (confirm('Supprimer cet objet ?')) { await objetsApi.delete(objId); load() }
  }

  const fa = (k: string, v: string) => setAchatForm(p => ({ ...p, [k]: v }))
  const fo = (k: string, v: string) => setObjetForm(p => ({ ...p, [k]: v }))

  if (!auction) return <div style={{ color: 'var(--text3)' }}>Chargement...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Btn size="sm" onClick={() => navigate('/auctions')}>← Retour</Btn>
      </div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>{auction.titre}</h1>
        <div style={{ fontSize: 14, color: 'var(--text3)', display: 'flex', gap: 16 }}>
          <span style={{ color: 'var(--accent)' }}>{auction.etude.nom}</span>
          {auction.date_auction && <span>📅 {new Date(auction.date_auction).toLocaleDateString('fr-FR')}</span>}
          {auction.lieu && <span>📍 {auction.lieu}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Lots achetés</h2>
        <Btn variant="primary" size="sm" onClick={() => { setEditAchat(null); setAchatForm(emptyAchat); setAchatModal(true) }}>
          + Ajouter un lot
        </Btn>
      </div>

      {achats.map(achat => (
        <div key={achat.id} style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontWeight: 500 }}>Lot {achat.numero_lot || achat.id}</span>
              {achat.prix_achat && (
                <span style={{ marginLeft: 12, color: 'var(--accent)', fontFamily: 'DM Serif Display, serif', fontSize: 18 }}>
                  {Number(achat.prix_achat).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" onClick={() => openObjetModal(achat.id)}>+ Objet</Btn>
              <Btn size="sm" onClick={() => { setEditAchat(achat); setAchatForm({ numero_lot: achat.numero_lot || '', prix_achat: achat.prix_achat?.toString() || '', notes: achat.notes || '' }); setAchatModal(true) }}>Modifier</Btn>
              <Btn size="sm" variant="danger" onClick={() => delAchat(achat.id)}>Supprimer</Btn>
            </div>
          </div>

          {/* Objets du lot */}
          <div style={{ display: 'grid', gap: 8 }}>
            {(objetsByAchat[achat.id] || []).map(obj => {
              const badge = statutBadge[obj.statut]
              return (
                <div key={obj.id} style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                }} onClick={() => navigate(`/objets/${obj.id}`)}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{obj.designation}</span>
                    {obj.prix_estime && (
                      <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text3)' }}>
                        estimé {Number(obj.prix_estime).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <Btn size="sm" variant="danger" onClick={e => { e.stopPropagation(); delObjet(obj.id) }}>✕</Btn>
                  </div>
                </div>
              )
            })}
            {(objetsByAchat[achat.id] || []).length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>Aucun objet dans ce lot</div>
            )}
          </div>
        </div>
      ))}

      {achats.length === 0 && (
        <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>Aucun lot enregistré</div>
      )}

      {/* Modal lot */}
      {achatModal && (
        <Modal title={editAchat ? 'Modifier le lot' : 'Nouveau lot'} onClose={() => setAchatModal(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Numéro de lot"><input value={achatForm.numero_lot} onChange={e => fa('numero_lot', e.target.value)} placeholder="42" /></Field>
            <Field label="Prix d'achat (€)"><input type="number" value={achatForm.prix_achat} onChange={e => fa('prix_achat', e.target.value)} placeholder="0.00" /></Field>
            <Field label="Notes"><textarea value={achatForm.notes} onChange={e => fa('notes', e.target.value)} rows={3} /></Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Btn onClick={() => setAchatModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveAchat}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal objet */}
      {objetModal && (
        <Modal title="Nouvel objet" onClose={() => setObjetModal(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Désignation *"><input value={objetForm.designation} onChange={e => fo('designation', e.target.value)} placeholder="Vase en porcelaine" /></Field>
            <Field label="Description"><textarea value={objetForm.description} onChange={e => fo('description', e.target.value)} rows={3} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Couleur"><input value={objetForm.couleur} onChange={e => fo('couleur', e.target.value)} /></Field>
              <Field label="Matériau"><input value={objetForm.materiau} onChange={e => fo('materiau', e.target.value)} /></Field>
              <Field label="Poids"><input value={objetForm.poids} onChange={e => fo('poids', e.target.value)} placeholder="1.2 kg" /></Field>
              <Field label="Dimensions"><input value={objetForm.dimensions} onChange={e => fo('dimensions', e.target.value)} placeholder="30×20×15 cm" /></Field>
              <Field label="Période"><input value={objetForm.periode} onChange={e => fo('periode', e.target.value)} placeholder="XIXe siècle" /></Field>
              <Field label="Prix estimé (€)"><input type="number" value={objetForm.prix_estime} onChange={e => fo('prix_estime', e.target.value)} /></Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Btn onClick={() => setObjetModal(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={saveObjet}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
