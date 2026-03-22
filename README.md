# Auction Manager

## Installation

### 1. Initialiser le frontend (une seule fois)
```bash
cd frontend
npm create vite@latest . -- --template react-ts
# Répondre "Yes" pour utiliser le dossier existant
npm install
npm install axios react-router-dom @tanstack/react-query
cd ..
```

### 2. Démarrer l'application
```bash
docker compose up --build -d
```

- Frontend : http://localhost:5173
- Backend API : http://localhost:8000/docs

### 3. Arrêter
```bash
docker compose down
```

## Mise à jour incrémentale

### Ajouter un champ à un modèle
```bash
# 1. Modifier backend/models.py
# 2. Générer la migration
docker compose exec backend alembic revision --autogenerate -m "description"
# 3. Appliquer
docker compose exec backend alembic upgrade head
```

### Reconstruire après modification
```bash
docker compose up --build -d
```
