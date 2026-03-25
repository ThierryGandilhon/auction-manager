from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal
from database import get_db
import models

router = APIRouter(prefix="/lots", tags=["lots"])


class LotBase(BaseModel):
    achat_id: int
    numero_lot: Optional[str] = None
    prix_achat: Optional[Decimal] = None
    notes: Optional[str] = None

class LotCreate(LotBase):
    pass

class AchatShort(BaseModel):
    id: int
    titre: Optional[str] = None
    date_achat: Optional[object] = None
    class Config:
        from_attributes = True

class LotOut(LotBase):
    id: int
    achat: AchatShort
    class Config:
        from_attributes = True


@router.get("/", response_model=List[LotOut])
def list_lots(achat_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Lot).options(joinedload(models.Lot.achat))
    if achat_id:
        q = q.filter(models.Lot.achat_id == achat_id)
    return q.all()

@router.get("/{lot_id}", response_model=LotOut)
def get_lot(lot_id: int, db: Session = Depends(get_db)):
    lot = db.query(models.Lot).options(joinedload(models.Lot.achat)).filter(models.Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot introuvable")
    return lot

@router.post("/", response_model=LotOut, status_code=201)
def create_lot(lot: LotCreate, db: Session = Depends(get_db)):
    if not db.query(models.Achat).filter(models.Achat.id == lot.achat_id).first():
        raise HTTPException(status_code=404, detail="Achat introuvable")
    db_lot = models.Lot(**lot.model_dump())
    db.add(db_lot)
    db.commit()
    db.refresh(db_lot)
    return db.query(models.Lot).options(joinedload(models.Lot.achat)).filter(models.Lot.id == db_lot.id).first()

@router.put("/{lot_id}", response_model=LotOut)
def update_lot(lot_id: int, lot: LotCreate, db: Session = Depends(get_db)):
    db_lot = db.query(models.Lot).filter(models.Lot.id == lot_id).first()
    if not db_lot:
        raise HTTPException(status_code=404, detail="Lot introuvable")
    for key, value in lot.model_dump().items():
        setattr(db_lot, key, value)
    db.commit()
    return db.query(models.Lot).options(joinedload(models.Lot.achat)).filter(models.Lot.id == lot_id).first()

@router.delete("/{lot_id}", status_code=204)
def delete_lot(lot_id: int, db: Session = Depends(get_db)):
    db_lot = db.query(models.Lot).filter(models.Lot.id == lot_id).first()
    if not db_lot:
        raise HTTPException(status_code=404, detail="Lot introuvable")
    db.delete(db_lot)
    db.commit()
