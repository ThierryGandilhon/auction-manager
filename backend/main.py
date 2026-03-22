from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
import models
from routers import etudes, auctions, achats, objets, clients, ventes, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auction Manager", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(etudes.router)
app.include_router(auctions.router)
app.include_router(achats.router)
app.include_router(objets.router)
app.include_router(clients.router)
app.include_router(ventes.router)
app.include_router(stats.router)


@app.get("/")
def root():
    return {"message": "Auction Manager API v2", "docs": "/docs"}
