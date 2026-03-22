from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/clients", tags=["clients"])


class ClientBase(BaseModel):
    nom: str
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: int
    class Config:
        from_attributes = True


@router.get("/", response_model=List[ClientOut])
def list_clients(db: Session = Depends(get_db)):
    return db.query(models.Client).order_by(models.Client.nom).all()

@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return client

@router.post("/", response_model=ClientOut, status_code=201)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.put("/{client_id}", response_model=ClientOut)
def update_client(client_id: int, client: ClientCreate, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    for key, value in client.model_dump().items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    db.delete(db_client)
    db.commit()
