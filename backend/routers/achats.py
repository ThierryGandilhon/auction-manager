from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
import models

router = APIRouter(prefix="/achats", tags=["achats"])


class AchatBase(BaseModel):
    etude_id: int
    titre: Optional[str] = None
    date_achat: Optional[date] = None
    lieu: Optional[str] = None
    notes: Optional[str] = None

class AchatCreate(AchatBase):
    pass

class EtudeShort(BaseModel):
    id: int
    nom: str
    class Config:
        from_attributes = True

class AchatOut(AchatBase):
    id: int
    etude: EtudeShort
    class Config:
        from_attributes = True


@router.get("/", response_model=List[AchatOut])
def list_achats(etude_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Achat).options(joinedload(models.Achat.etude))
    if etude_id:
        q = q.filter(models.Achat.etude_id == etude_id)
    return q.order_by(models.Achat.date_achat.desc()).all()

@router.get("/{achat_id}", response_model=AchatOut)
def get_achat(achat_id: int, db: Session = Depends(get_db)):
    achat = db.query(models.Achat).options(joinedload(models.Achat.etude)).filter(models.Achat.id == achat_id).first()
    if not achat:
        raise HTTPException(status_code=404, detail="Achat introuvable")
    return achat

@router.post("/", response_model=AchatOut, status_code=201)
def create_achat(achat: AchatCreate, db: Session = Depends(get_db)):
    if not db.query(models.Etude).filter(models.Etude.id == achat.etude_id).first():
        raise HTTPException(status_code=404, detail="Étude introuvable")
    db_achat = models.Achat(**achat.model_dump())
    db.add(db_achat)
    db.commit()
    db.refresh(db_achat)
    return db.query(models.Achat).options(joinedload(models.Achat.etude)).filter(models.Achat.id == db_achat.id).first()

@router.put("/{achat_id}", response_model=AchatOut)
def update_achat(achat_id: int, achat: AchatCreate, db: Session = Depends(get_db)):
    db_achat = db.query(models.Achat).filter(models.Achat.id == achat_id).first()
    if not db_achat:
        raise HTTPException(status_code=404, detail="Achat introuvable")
    for key, value in achat.model_dump().items():
        setattr(db_achat, key, value)
    db.commit()
    return db.query(models.Achat).options(joinedload(models.Achat.etude)).filter(models.Achat.id == achat_id).first()

@router.delete("/{achat_id}", status_code=204)
def delete_achat(achat_id: int, db: Session = Depends(get_db)):
    db_achat = db.query(models.Achat).filter(models.Achat.id == achat_id).first()
    if not db_achat:
        raise HTTPException(status_code=404, detail="Achat introuvable")
    db.delete(db_achat)
    db.commit()
