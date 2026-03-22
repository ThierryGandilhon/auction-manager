FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Dossier pour les photos uploadées
RUN mkdir -p /app/uploads

# Lancer les migrations puis démarrer le serveur
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]
