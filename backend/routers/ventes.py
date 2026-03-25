from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal
from datetime import date
from database import get_db
import models

router = APIRouter(prefix="/ventes", tags=["ventes"])


class VenteBase(BaseModel):
    client_id: Optional[int] = None
    plateforme: Optional[str] = None
    date_vente: Optional[date] = None
    notes: Optional[str] = None
    statut: Optional[str] = "en_cours"

class VenteCreate(VenteBase):
    pass

class VenteObjetCreate(BaseModel):
    objet_id: int
    prix_vente: Optional[Decimal] = None

class ClientShort(BaseModel):
    id: int
    nom: str
    prenom: Optional[str] = None
    class Config:
        from_attributes = True

class ObjetShort(BaseModel):
    id: int
    designation: str
    prix_achat: Optional[Decimal] = None
    statut: str
    class Config:
        from_attributes = True

class VenteObjetOut(BaseModel):
    id: int
    objet_id: int
    prix_vente: Optional[Decimal] = None
    objet: ObjetShort
    marge: Optional[Decimal] = None
    class Config:
        from_attributes = True

class VenteOut(VenteBase):
    id: int
    client: Optional[ClientShort] = None
    vente_objets: List[VenteObjetOut] = []
    total_vente: Optional[Decimal] = None
    class Config:
        from_attributes = True


def load_vente(db: Session, vente_id: int) -> Optional[models.Vente]:
    return db.query(models.Vente).options(
        joinedload(models.Vente.client),
        joinedload(models.Vente.vente_objets).joinedload(models.VenteObjet.objet),
    ).filter(models.Vente.id == vente_id).first()


def enrich_vente(vente: models.Vente) -> dict:
    vente_objets = []
    total = Decimal(0)
    for vo in vente.vente_objets:
        marge = None
        if vo.prix_vente is not None and vo.objet and vo.objet.prix_achat is not None:
            marge = vo.prix_vente - vo.objet.prix_achat
        vente_objets.append({
            'id': vo.id,
            'objet_id': vo.objet_id,
            'prix_vente': vo.prix_vente,
            'objet': vo.objet,
            'marge': marge,
        })
        if vo.prix_vente:
            total += vo.prix_vente
    return {
        'id': vente.id,
        'client_id': vente.client_id,
        'plateforme': vente.plateforme,
        'date_vente': vente.date_vente,
        'notes': vente.notes,
        'statut': vente.statut,
        'client': vente.client,
        'vente_objets': vente_objets,
        'total_vente': total if total > 0 else None,
    }


@router.get("/", response_model=List[VenteOut])
def list_ventes(statut: Optional[str] = None, client_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Vente).options(
        joinedload(models.Vente.client),
        joinedload(models.Vente.vente_objets).joinedload(models.VenteObjet.objet),
    )
    if statut:
        q = q.filter(models.Vente.statut == statut)
    if client_id:
        q = q.filter(models.Vente.client_id == client_id)
    return [VenteOut.model_validate(enrich_vente(v)) for v in q.all()]

@router.get("/{vente_id}", response_model=VenteOut)
def get_vente(vente_id: int, db: Session = Depends(get_db)):
    v = load_vente(db, vente_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    return VenteOut.model_validate(enrich_vente(v))

@router.post("/", response_model=VenteOut, status_code=201)
def create_vente(vente: VenteCreate, db: Session = Depends(get_db)):
    if vente.client_id and not db.query(models.Client).filter(models.Client.id == vente.client_id).first():
        raise HTTPException(status_code=404, detail="Client introuvable")
    db_vente = models.Vente(**vente.model_dump())
    db.add(db_vente)
    db.commit()
    db.refresh(db_vente)
    return VenteOut.model_validate(enrich_vente(load_vente(db, db_vente.id)))

@router.put("/{vente_id}", response_model=VenteOut)
def update_vente(vente_id: int, vente: VenteCreate, db: Session = Depends(get_db)):
    db_vente = db.query(models.Vente).filter(models.Vente.id == vente_id).first()
    if not db_vente:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    for key, value in vente.model_dump().items():
        setattr(db_vente, key, value)
    # Sync statut on objets
    if vente.statut == "finalisée":
        for vo in db_vente.vente_objets:
            if vo.objet:
                vo.objet.statut = "vendu"
    elif vente.statut == "annulée":
        for vo in db_vente.vente_objets:
            if vo.objet:
                vo.objet.statut = "acheté"
    db.commit()
    return VenteOut.model_validate(enrich_vente(load_vente(db, vente_id)))

@router.delete("/{vente_id}", status_code=204)
def delete_vente(vente_id: int, db: Session = Depends(get_db)):
    db_vente = load_vente(db, vente_id)
    if not db_vente:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    for vo in db_vente.vente_objets:
        if vo.objet:
            vo.objet.statut = "acheté"
    db.delete(db_vente)
    db.commit()

# --- Gestion des objets dans une vente ---

@router.post("/{vente_id}/objets", response_model=VenteOut, status_code=201)
def add_objet_to_vente(vente_id: int, data: VenteObjetCreate, db: Session = Depends(get_db)):
    vente = db.query(models.Vente).filter(models.Vente.id == vente_id).first()
    if not vente:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    objet = db.query(models.Objet).filter(models.Objet.id == data.objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    # Check not already in an active vente
    existing = db.query(models.VenteObjet).join(models.Vente).filter(
        models.VenteObjet.objet_id == data.objet_id,
        models.Vente.statut != 'annulée',
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cet objet est déjà dans une vente active")
    vo = models.VenteObjet(vente_id=vente_id, objet_id=data.objet_id, prix_vente=data.prix_vente)
    db.add(vo)
    objet.statut = "en_vente"
    db.commit()
    return VenteOut.model_validate(enrich_vente(load_vente(db, vente_id)))

@router.put("/{vente_id}/objets/{objet_id}", response_model=VenteOut)
def update_objet_in_vente(vente_id: int, objet_id: int, data: VenteObjetCreate, db: Session = Depends(get_db)):
    vo = db.query(models.VenteObjet).filter(
        models.VenteObjet.vente_id == vente_id,
        models.VenteObjet.objet_id == objet_id,
    ).first()
    if not vo:
        raise HTTPException(status_code=404, detail="Objet non trouvé dans cette vente")
    vo.prix_vente = data.prix_vente
    db.commit()
    return VenteOut.model_validate(enrich_vente(load_vente(db, vente_id)))

@router.delete("/{vente_id}/objets/{objet_id}", response_model=VenteOut)
def remove_objet_from_vente(vente_id: int, objet_id: int, db: Session = Depends(get_db)):
    vo = db.query(models.VenteObjet).filter(
        models.VenteObjet.vente_id == vente_id,
        models.VenteObjet.objet_id == objet_id,
    ).first()
    if not vo:
        raise HTTPException(status_code=404, detail="Objet non trouvé dans cette vente")
    if vo.objet:
        vo.objet.statut = "acheté"
    db.delete(vo)
    db.commit()
    return VenteOut.model_validate(enrich_vente(load_vente(db, vente_id)))
