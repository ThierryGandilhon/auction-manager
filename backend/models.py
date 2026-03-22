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

    auctions = relationship("Auction", back_populates="etude", cascade="all, delete-orphan")


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    etude_id = Column(Integer, ForeignKey("etudes.id"), nullable=False)
    titre = Column(String(300), nullable=False)
    date_auction = Column(Date)
    lieu = Column(String(200))
    url_catalogue = Column(String(500))
    notes = Column(Text)

    etude = relationship("Etude", back_populates="auctions")
    achats = relationship("Achat", back_populates="auction", cascade="all, delete-orphan")


class Achat(Base):
    __tablename__ = "achats"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=False)
    numero_lot = Column(String(50))
    prix_achat = Column(Numeric(10, 2), default=0)
    notes = Column(Text)

    auction = relationship("Auction", back_populates="achats")
    objets = relationship("Objet", back_populates="achat", cascade="all, delete-orphan")


class Objet(Base):
    __tablename__ = "objets"

    id = Column(Integer, primary_key=True, index=True)
    achat_id = Column(Integer, ForeignKey("achats.id"), nullable=False)
    designation = Column(String(300), nullable=False)
    description = Column(Text)
    couleur = Column(String(100))
    materiau = Column(String(100))
    poids = Column(String(50))
    dimensions = Column(String(100))
    periode = Column(String(100))
    prix_estime = Column(Numeric(10, 2), nullable=True)
    # statut : "en_stock", "en_vente", "vendu"
    statut = Column(String(50), default="en_stock")

    achat = relationship("Achat", back_populates="objets")
    photos = relationship("Photo", back_populates="objet", cascade="all, delete-orphan")
    vente = relationship("Vente", back_populates="objet", uselist=False, cascade="all, delete-orphan")


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
    objet_id = Column(Integer, ForeignKey("objets.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    plateforme = Column(String(100))
    prix_vente = Column(Numeric(10, 2))
    date_vente = Column(Date)
    # statut : "en_ligne", "vendu", "annule"
    statut = Column(String(50), default="en_ligne")

    objet = relationship("Objet", back_populates="vente")
    client = relationship("Client", back_populates="ventes")
