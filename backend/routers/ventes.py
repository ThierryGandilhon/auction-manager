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
    objet_id: int
    client_id: Optional[int] = None
    plateforme: Optional[str] = None
    prix_vente: Optional[Decimal] = None
    date_vente: Optional[date] = None
    statut: Optional[str] = "en_ligne"

class VenteCreate(VenteBase):
    pass

class ClientShort(BaseModel):
    id: int
    nom: str
    prenom: Optional[str] = None
    class Config:
        from_attributes = True

class ObjetShort(BaseModel):
    id: int
    designation: str
    prix_estime: Optional[Decimal] = None
    class Config:
        from_attributes = True

class VenteOut(VenteBase):
    id: int
    objet: ObjetShort
    client: Optional[ClientShort] = None
    marge: Optional[Decimal] = None
    class Config:
        from_attributes = True


def compute_marge(vente: models.Vente) -> Optional[Decimal]:
    if vente.prix_vente is not None and vente.objet and vente.objet.prix_estime is not None:
        return vente.prix_vente - vente.objet.prix_estime
    return None


@router.get("/", response_model=List[VenteOut])
def list_ventes(statut: Optional[str] = None, client_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Vente).options(
        joinedload(models.Vente.objet),
        joinedload(models.Vente.client)
    )
    if statut:
        q = q.filter(models.Vente.statut == statut)
    if client_id:
        q = q.filter(models.Vente.client_id == client_id)
    ventes = q.all()
    result = []
    for v in ventes:
        out = VenteOut.model_validate(v)
        out.marge = compute_marge(v)
        result.append(out)
    return result

@router.get("/{vente_id}", response_model=VenteOut)
def get_vente(vente_id: int, db: Session = Depends(get_db)):
    v = db.query(models.Vente).options(
        joinedload(models.Vente.objet),
        joinedload(models.Vente.client)
    ).filter(models.Vente.id == vente_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    out = VenteOut.model_validate(v)
    out.marge = compute_marge(v)
    return out

@router.post("/", response_model=VenteOut, status_code=201)
def create_vente(vente: VenteCreate, db: Session = Depends(get_db)):
    objet = db.query(models.Objet).filter(models.Objet.id == vente.objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    if objet.vente:
        raise HTTPException(status_code=400, detail="Une vente existe déjà pour cet objet")
    if vente.client_id and not db.query(models.Client).filter(models.Client.id == vente.client_id).first():
        raise HTTPException(status_code=404, detail="Client introuvable")
    db_vente = models.Vente(**vente.model_dump())
    db.add(db_vente)
    objet.statut = "en_vente"
    db.commit()
    db.refresh(db_vente)
    v = db.query(models.Vente).options(
        joinedload(models.Vente.objet), joinedload(models.Vente.client)
    ).filter(models.Vente.id == db_vente.id).first()
    out = VenteOut.model_validate(v)
    out.marge = compute_marge(v)
    return out

@router.put("/{vente_id}", response_model=VenteOut)
def update_vente(vente_id: int, vente: VenteCreate, db: Session = Depends(get_db)):
    db_vente = db.query(models.Vente).options(
        joinedload(models.Vente.objet), joinedload(models.Vente.client)
    ).filter(models.Vente.id == vente_id).first()
    if not db_vente:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    for key, value in vente.model_dump().items():
        setattr(db_vente, key, value)
    if vente.statut == "vendu" and db_vente.objet:
        db_vente.objet.statut = "vendu"
    elif vente.statut == "annule" and db_vente.objet:
        db_vente.objet.statut = "en_stock"
    db.commit()
    v = db.query(models.Vente).options(
        joinedload(models.Vente.objet), joinedload(models.Vente.client)
    ).filter(models.Vente.id == vente_id).first()
    out = VenteOut.model_validate(v)
    out.marge = compute_marge(v)
    return out

@router.delete("/{vente_id}", status_code=204)
def delete_vente(vente_id: int, db: Session = Depends(get_db)):
    db_vente = db.query(models.Vente).filter(models.Vente.id == vente_id).first()
    if not db_vente:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    if db_vente.objet:
        db_vente.objet.statut = "en_stock"
    db.delete(db_vente)
    db.commit()
