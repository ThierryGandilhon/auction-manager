from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal
from database import get_db
import models, os, shutil, uuid

router = APIRouter(prefix="/objets", tags=["objets"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ObjetBase(BaseModel):
    lot_id: int
    designation: str
    description: Optional[str] = None
    couleur: Optional[str] = None
    materiau: Optional[str] = None
    poids: Optional[str] = None
    dimensions: Optional[str] = None
    periode: Optional[str] = None
    prix_achat: Optional[Decimal] = None
    prix_estime: Optional[Decimal] = None
    statut: Optional[str] = "acheté"

class ObjetCreate(ObjetBase):
    pass

class PhotoOut(BaseModel):
    id: int
    chemin_fichier: str
    legende: Optional[str] = None
    class Config:
        from_attributes = True

class LotShort(BaseModel):
    id: int
    numero_lot: Optional[str] = None
    prix_achat: Optional[Decimal] = None
    achat_id: int
    class Config:
        from_attributes = True

class ClientShort(BaseModel):
    id: int
    nom: str
    prenom: Optional[str] = None
    class Config:
        from_attributes = True

class VenteShort(BaseModel):
    id: int
    plateforme: Optional[str] = None
    date_vente: Optional[object] = None
    statut: str
    prix_vente: Optional[Decimal] = None
    client: Optional[ClientShort] = None
    class Config:
        from_attributes = True

class ObjetOut(ObjetBase):
    id: int
    lot: LotShort
    photos: List[PhotoOut] = []
    vente: Optional[VenteShort] = None
    class Config:
        from_attributes = True


def get_objet_with_vente(db: Session, objet_id: int) -> Optional[models.Objet]:
    objet = db.query(models.Objet).options(
        joinedload(models.Objet.lot),
        joinedload(models.Objet.photos),
        joinedload(models.Objet.vente_objets).joinedload(models.VenteObjet.vente).joinedload(models.Vente.client),
    ).filter(models.Objet.id == objet_id).first()
    return objet


def enrich_objet(objet: models.Objet) -> dict:
    """Attach active vente info to objet output."""
    data = {c.key: getattr(objet, c.key) for c in objet.__table__.columns}
    data['lot'] = objet.lot
    data['photos'] = objet.photos
    data['vente'] = None
    # Find active (non-annulée) vente
    for vo in objet.vente_objets:
        if vo.vente and vo.vente.statut != 'annulée':
            data['vente'] = {
                'id': vo.vente.id,
                'plateforme': vo.vente.plateforme,
                'date_vente': vo.vente.date_vente,
                'statut': vo.vente.statut,
                'prix_vente': vo.prix_vente,
                'client': vo.vente.client,
            }
            break
    return data


@router.get("/", response_model=List[ObjetOut])
def list_objets(lot_id: Optional[int] = None, statut: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Objet).options(
        joinedload(models.Objet.lot),
        joinedload(models.Objet.photos),
        joinedload(models.Objet.vente_objets).joinedload(models.VenteObjet.vente).joinedload(models.Vente.client),
    )
    if lot_id:
        q = q.filter(models.Objet.lot_id == lot_id)
    if statut:
        q = q.filter(models.Objet.statut == statut)
    return [ObjetOut.model_validate(enrich_objet(o)) for o in q.all()]

@router.get("/{objet_id}", response_model=ObjetOut)
def get_objet(objet_id: int, db: Session = Depends(get_db)):
    objet = get_objet_with_vente(db, objet_id)
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    return ObjetOut.model_validate(enrich_objet(objet))

@router.post("/", response_model=ObjetOut, status_code=201)
def create_objet(objet: ObjetCreate, db: Session = Depends(get_db)):
    if not db.query(models.Lot).filter(models.Lot.id == objet.lot_id).first():
        raise HTTPException(status_code=404, detail="Lot introuvable")
    db_objet = models.Objet(**objet.model_dump())
    db.add(db_objet)
    db.commit()
    return ObjetOut.model_validate(enrich_objet(get_objet_with_vente(db, db_objet.id)))

@router.put("/{objet_id}", response_model=ObjetOut)
def update_objet(objet_id: int, objet: ObjetCreate, db: Session = Depends(get_db)):
    db_objet = db.query(models.Objet).filter(models.Objet.id == objet_id).first()
    if not db_objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    for key, value in objet.model_dump().items():
        setattr(db_objet, key, value)
    db.commit()
    return ObjetOut.model_validate(enrich_objet(get_objet_with_vente(db, objet_id)))

@router.delete("/{objet_id}", status_code=204)
def delete_objet(objet_id: int, db: Session = Depends(get_db)):
    db_objet = db.query(models.Objet).filter(models.Objet.id == objet_id).first()
    if not db_objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    db.delete(db_objet)
    db.commit()

@router.post("/{objet_id}/photos", response_model=PhotoOut, status_code=201)
async def upload_photo(objet_id: int, legende: Optional[str] = None,
                       file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not db.query(models.Objet).filter(models.Objet.id == objet_id).first():
        raise HTTPException(status_code=404, detail="Objet introuvable")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Format non supporté (jpg, png, webp)")
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    photo = models.Photo(objet_id=objet_id, chemin_fichier=filename, legende=legende)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

@router.delete("/photos/{photo_id}", status_code=204)
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo introuvable")
    filepath = os.path.join(UPLOAD_DIR, photo.chemin_fichier)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.delete(photo)
    db.commit()
