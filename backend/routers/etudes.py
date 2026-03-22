from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/etudes", tags=["etudes"])


class EtudeBase(BaseModel):
    nom: str
    ville: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    site_web: Optional[str] = None

class EtudeCreate(EtudeBase):
    pass

class EtudeOut(EtudeBase):
    id: int
    class Config:
        from_attributes = True


@router.get("/", response_model=List[EtudeOut])
def list_etudes(db: Session = Depends(get_db)):
    return db.query(models.Etude).order_by(models.Etude.nom).all()

@router.get("/{etude_id}", response_model=EtudeOut)
def get_etude(etude_id: int, db: Session = Depends(get_db)):
    etude = db.query(models.Etude).filter(models.Etude.id == etude_id).first()
    if not etude:
        raise HTTPException(status_code=404, detail="Étude introuvable")
    return etude

@router.post("/", response_model=EtudeOut, status_code=201)
def create_etude(etude: EtudeCreate, db: Session = Depends(get_db)):
    db_etude = models.Etude(**etude.model_dump())
    db.add(db_etude)
    db.commit()
    db.refresh(db_etude)
    return db_etude

@router.put("/{etude_id}", response_model=EtudeOut)
def update_etude(etude_id: int, etude: EtudeCreate, db: Session = Depends(get_db)):
    db_etude = db.query(models.Etude).filter(models.Etude.id == etude_id).first()
    if not db_etude:
        raise HTTPException(status_code=404, detail="Étude introuvable")
    for key, value in etude.model_dump().items():
        setattr(db_etude, key, value)
    db.commit()
    db.refresh(db_etude)
    return db_etude

@router.delete("/{etude_id}", status_code=204)
def delete_etude(etude_id: int, db: Session = Depends(get_db)):
    db_etude = db.query(models.Etude).filter(models.Etude.id == etude_id).first()
    if not db_etude:
        raise HTTPException(status_code=404, detail="Étude introuvable")
    db.delete(db_etude)
    db.commit()
