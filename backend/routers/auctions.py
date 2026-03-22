from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
import models

router = APIRouter(prefix="/auctions", tags=["auctions"])


class AuctionBase(BaseModel):
    etude_id: int
    titre: str
    date_auction: Optional[date] = None
    lieu: Optional[str] = None
    url_catalogue: Optional[str] = None
    notes: Optional[str] = None

class AuctionCreate(AuctionBase):
    pass

class EtudeShort(BaseModel):
    id: int
    nom: str
    class Config:
        from_attributes = True

class AuctionOut(AuctionBase):
    id: int
    etude: EtudeShort
    class Config:
        from_attributes = True


@router.get("/", response_model=List[AuctionOut])
def list_auctions(etude_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Auction).options(joinedload(models.Auction.etude))
    if etude_id:
        q = q.filter(models.Auction.etude_id == etude_id)
    return q.order_by(models.Auction.date_auction.desc()).all()

@router.get("/{auction_id}", response_model=AuctionOut)
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    auction = db.query(models.Auction).options(joinedload(models.Auction.etude)).filter(models.Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction introuvable")
    return auction

@router.post("/", response_model=AuctionOut, status_code=201)
def create_auction(auction: AuctionCreate, db: Session = Depends(get_db)):
    if not db.query(models.Etude).filter(models.Etude.id == auction.etude_id).first():
        raise HTTPException(status_code=404, detail="Étude introuvable")
    db_auction = models.Auction(**auction.model_dump())
    db.add(db_auction)
    db.commit()
    db.refresh(db_auction)
    return db.query(models.Auction).options(joinedload(models.Auction.etude)).filter(models.Auction.id == db_auction.id).first()

@router.put("/{auction_id}", response_model=AuctionOut)
def update_auction(auction_id: int, auction: AuctionCreate, db: Session = Depends(get_db)):
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    if not db_auction:
        raise HTTPException(status_code=404, detail="Auction introuvable")
    for key, value in auction.model_dump().items():
        setattr(db_auction, key, value)
    db.commit()
    return db.query(models.Auction).options(joinedload(models.Auction.etude)).filter(models.Auction.id == auction_id).first()

@router.delete("/{auction_id}", status_code=204)
def delete_auction(auction_id: int, db: Session = Depends(get_db)):
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    if not db_auction:
        raise HTTPException(status_code=404, detail="Auction introuvable")
    db.delete(db_auction)
    db.commit()
