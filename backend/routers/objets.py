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
    achat_id: int
    designation: str
    description: Optional[str] = None
    couleur: Optional[str] = None
    materiau: Optional[str] = None
    poids: Optional[str] = None
    dimensions: Optional[str] = None
    periode: Optional[str] = None
    prix_estime: Optional[Decimal] = None
    statut: Optional[str] = "en_stock"

class ObjetCreate(ObjetBase):
    pass

class PhotoOut(BaseModel):
    id: int
    chemin_fichier: str
    legende: Optional[str] = None
    class Config:
        from_attributes = True

class AchatShort(BaseModel):
    id: int
    numero_lot: Optional[str] = None
    prix_achat: Optional[Decimal] = None
    class Config:
        from_attributes = True

class ObjetOut(ObjetBase):
    id: int
    achat: AchatShort
    photos: List[PhotoOut] = []
    class Config:
        from_attributes = True


@router.get("/", response_model=List[ObjetOut])
def list_objets(achat_id: Optional[int] = None, statut: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Objet).options(
        joinedload(models.Objet.achat),
        joinedload(models.Objet.photos)
    )
    if achat_id:
        q = q.filter(models.Objet.achat_id == achat_id)
    if statut:
        q = q.filter(models.Objet.statut == statut)
    return q.all()

@router.get("/{objet_id}", response_model=ObjetOut)
def get_objet(objet_id: int, db: Session = Depends(get_db)):
    objet = db.query(models.Objet).options(
        joinedload(models.Objet.achat),
        joinedload(models.Objet.photos)
    ).filter(models.Objet.id == objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    return objet

@router.post("/", response_model=ObjetOut, status_code=201)
def create_objet(objet: ObjetCreate, db: Session = Depends(get_db)):
    if not db.query(models.Achat).filter(models.Achat.id == objet.achat_id).first():
        raise HTTPException(status_code=404, detail="Achat introuvable")
    db_objet = models.Objet(**objet.model_dump())
    db.add(db_objet)
    db.commit()
    db.refresh(db_objet)
    return db.query(models.Objet).options(
        joinedload(models.Objet.achat), joinedload(models.Objet.photos)
    ).filter(models.Objet.id == db_objet.id).first()

@router.put("/{objet_id}", response_model=ObjetOut)
def update_objet(objet_id: int, objet: ObjetCreate, db: Session = Depends(get_db)):
    db_objet = db.query(models.Objet).filter(models.Objet.id == objet_id).first()
    if not db_objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    for key, value in objet.model_dump().items():
        setattr(db_objet, key, value)
    db.commit()
    return db.query(models.Objet).options(
        joinedload(models.Objet.achat), joinedload(models.Objet.photos)
    ).filter(models.Objet.id == objet_id).first()

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
