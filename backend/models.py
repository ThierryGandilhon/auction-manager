from sqlalchemy import Column, Integer, String, Text, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Etude(Base):
    __tablename__ = "etudes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False)
    ville = Column(String(100))
    email = Column(String(200))
    telephone = Column(String(50))
    site_web = Column(String(300))

    achats = relationship("Achat", back_populates="etude", cascade="all, delete-orphan")


class Achat(Base):
    __tablename__ = "achats"

    id = Column(Integer, primary_key=True, index=True)
    etude_id = Column(Integer, ForeignKey("etudes.id"), nullable=False)
    titre = Column(String(300))
    date_achat = Column(Date)
    lieu = Column(String(200))
    notes = Column(Text)

    etude = relationship("Etude", back_populates="achats")
    lots = relationship("Lot", back_populates="achat", cascade="all, delete-orphan")


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    achat_id = Column(Integer, ForeignKey("achats.id"), nullable=False)
    numero_lot = Column(String(50))
    prix_achat = Column(Numeric(10, 2), default=0)
    notes = Column(Text)

    achat = relationship("Achat", back_populates="lots")
    objets = relationship("Objet", back_populates="lot", cascade="all, delete-orphan")


class Objet(Base):
    __tablename__ = "objets"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=False)
    designation = Column(String(300), nullable=False)
    description = Column(Text)
    couleur = Column(String(100))
    materiau = Column(String(100))
    poids = Column(String(50))
    dimensions = Column(String(100))
    periode = Column(String(100))
    prix_achat = Column(Numeric(10, 2), nullable=True)
    prix_estime = Column(Numeric(10, 2), nullable=True)
    # statut : "acheté", "en_vente", "vendu"
    statut = Column(String(50), default="acheté")

    lot = relationship("Lot", back_populates="objets")
    photos = relationship("Photo", back_populates="objet", cascade="all, delete-orphan")
    vente_objets = relationship("VenteObjet", back_populates="objet", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    objet_id = Column(Integer, ForeignKey("objets.id"), nullable=False)
    chemin_fichier = Column(String(500), nullable=False)
    legende = Column(String(300))

    objet = relationship("Objet", back_populates="photos")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False)
    prenom = Column(String(200))
    email = Column(String(200))
    telephone = Column(String(50))
    adresse = Column(Text)
    notes = Column(Text)

    ventes = relationship("Vente", back_populates="client")


class Vente(Base):
    __tablename__ = "ventes"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    plateforme = Column(String(100))
    date_vente = Column(Date)
    notes = Column(Text)
    # statut : "en_cours", "finalisée", "annulée"
    statut = Column(String(50), default="en_cours")

    client = relationship("Client", back_populates="ventes")
    vente_objets = relationship("VenteObjet", back_populates="vente", cascade="all, delete-orphan")


class VenteObjet(Base):
    __tablename__ = "vente_objets"

    id = Column(Integer, primary_key=True, index=True)
    vente_id = Column(Integer, ForeignKey("ventes.id"), nullable=False)
    objet_id = Column(Integer, ForeignKey("objets.id"), nullable=False)
    prix_vente = Column(Numeric(10, 2), nullable=True)

    vente = relationship("Vente", back_populates="vente_objets")
    objet = relationship("Objet", back_populates="vente_objets")
