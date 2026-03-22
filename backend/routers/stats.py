from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total_achats = db.query(func.count(models.Achat.id)).scalar()
    total_objets = db.query(func.count(models.Objet.id)).scalar()
    total_investi = db.query(func.sum(models.Achat.prix_achat)).scalar() or 0

    total_revendu = db.query(func.sum(models.Vente.prix_vente)).filter(
        models.Vente.statut == "vendu"
    ).scalar() or 0

    en_stock = db.query(func.count(models.Objet.id)).filter(
        models.Objet.statut == "en_stock"
    ).scalar()
    en_vente = db.query(func.count(models.Objet.id)).filter(
        models.Objet.statut == "en_vente"
    ).scalar()
    vendus = db.query(func.count(models.Objet.id)).filter(
        models.Objet.statut == "vendu"
    ).scalar()
    total_clients = db.query(func.count(models.Client.id)).scalar()

    return {
        "total_lots_achetes": total_achats,
        "total_objets": total_objets,
        "total_investi": float(total_investi),
        "total_revendu": float(total_revendu),
        "marge_totale": float(total_revendu) - float(total_investi),
        "objets_en_stock": en_stock,
        "objets_en_vente": en_vente,
        "objets_vendus": vendus,
        "total_clients": total_clients,
    }
