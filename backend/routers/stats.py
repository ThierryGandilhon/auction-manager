from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total_lots = db.query(func.count(models.Lot.id)).scalar()
    total_objets = db.query(func.count(models.Objet.id)).scalar()

    total_investi = db.query(func.sum(models.Lot.prix_achat)).scalar() or 0

    total_revendu = db.query(func.sum(models.VenteObjet.prix_vente)).join(models.Vente).filter(
        models.Vente.statut == "finalisée"
    ).scalar() or 0

    achetes = db.query(func.count(models.Objet.id)).filter(models.Objet.statut == "acheté").scalar()
    en_vente = db.query(func.count(models.Objet.id)).filter(models.Objet.statut == "en_vente").scalar()
    vendus = db.query(func.count(models.Objet.id)).filter(models.Objet.statut == "vendu").scalar()
    total_clients = db.query(func.count(models.Client.id)).scalar()

    return {
        "total_lots": total_lots,
        "total_objets": total_objets,
        "total_investi": float(total_investi),
        "total_revendu": float(total_revendu),
        "marge_totale": float(total_revendu) - float(total_investi),
        "objets_achetes": achetes,
        "objets_en_vente": en_vente,
        "objets_vendus": vendus,
        "total_clients": total_clients,
    }
