"""New schema: Achat/Lot/Objet/VenteObjet

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-25
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def get_existing_tables():
    bind = op.get_bind()
    return inspect(bind).get_table_names()


def upgrade():
    existing = get_existing_tables()

    # Drop old tables if they exist (reverse dependency order)
    for t in ['ventes', 'photos', 'objets', 'achats', 'auctions', 'clients', 'etudes',
              'vente_objets', 'lots']:
        if t in existing:
            op.drop_table(t)

    # Re-fetch after drops
    existing = get_existing_tables()

    if 'etudes' not in existing:
        op.create_table('etudes',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('nom', sa.String(200), nullable=False),
            sa.Column('ville', sa.String(100)),
            sa.Column('email', sa.String(200)),
            sa.Column('telephone', sa.String(50)),
            sa.Column('site_web', sa.String(300)),
        )

    if 'achats' not in existing:
        op.create_table('achats',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('etude_id', sa.Integer(), sa.ForeignKey('etudes.id'), nullable=False),
            sa.Column('titre', sa.String(300)),
            sa.Column('date_achat', sa.Date()),
            sa.Column('lieu', sa.String(200)),
            sa.Column('notes', sa.Text()),
        )

    if 'lots' not in existing:
        op.create_table('lots',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('achat_id', sa.Integer(), sa.ForeignKey('achats.id'), nullable=False),
            sa.Column('numero_lot', sa.String(50)),
            sa.Column('prix_achat', sa.Numeric(10, 2), default=0),
            sa.Column('notes', sa.Text()),
        )

    if 'objets' not in existing:
        op.create_table('objets',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('lot_id', sa.Integer(), sa.ForeignKey('lots.id'), nullable=False),
            sa.Column('designation', sa.String(300), nullable=False),
            sa.Column('description', sa.Text()),
            sa.Column('couleur', sa.String(100)),
            sa.Column('materiau', sa.String(100)),
            sa.Column('poids', sa.String(50)),
            sa.Column('dimensions', sa.String(100)),
            sa.Column('periode', sa.String(100)),
            sa.Column('prix_achat', sa.Numeric(10, 2)),
            sa.Column('prix_estime', sa.Numeric(10, 2)),
            sa.Column('statut', sa.String(50), default='acheté'),
        )

    if 'photos' not in existing:
        op.create_table('photos',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('objet_id', sa.Integer(), sa.ForeignKey('objets.id'), nullable=False),
            sa.Column('chemin_fichier', sa.String(500), nullable=False),
            sa.Column('legende', sa.String(300)),
        )

    if 'clients' not in existing:
        op.create_table('clients',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('nom', sa.String(200), nullable=False),
            sa.Column('prenom', sa.String(200)),
            sa.Column('email', sa.String(200)),
            sa.Column('telephone', sa.String(50)),
            sa.Column('adresse', sa.Text()),
            sa.Column('notes', sa.Text()),
        )

    if 'ventes' not in existing:
        op.create_table('ventes',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('client_id', sa.Integer(), sa.ForeignKey('clients.id'), nullable=True),
            sa.Column('plateforme', sa.String(100)),
            sa.Column('date_vente', sa.Date()),
            sa.Column('notes', sa.Text()),
            sa.Column('statut', sa.String(50), default='en_cours'),
        )

    if 'vente_objets' not in existing:
        op.create_table('vente_objets',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('vente_id', sa.Integer(), sa.ForeignKey('ventes.id'), nullable=False),
            sa.Column('objet_id', sa.Integer(), sa.ForeignKey('objets.id'), nullable=False),
            sa.Column('prix_vente', sa.Numeric(10, 2)),
        )


def downgrade():
    existing = get_existing_tables()
    for t in ['vente_objets', 'ventes', 'clients', 'photos', 'objets', 'lots', 'achats', 'etudes']:
        if t in existing:
            op.drop_table(t)
