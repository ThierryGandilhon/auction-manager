"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('etudes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nom', sa.String(200), nullable=False),
        sa.Column('ville', sa.String(100), nullable=True),
        sa.Column('email', sa.String(200), nullable=True),
        sa.Column('telephone', sa.String(50), nullable=True),
        sa.Column('site_web', sa.String(300), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('auctions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('etude_id', sa.Integer(), nullable=False),
        sa.Column('titre', sa.String(300), nullable=False),
        sa.Column('date_auction', sa.Date(), nullable=True),
        sa.Column('lieu', sa.String(200), nullable=True),
        sa.Column('url_catalogue', sa.String(500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['etude_id'], ['etudes.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('clients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nom', sa.String(200), nullable=False),
        sa.Column('prenom', sa.String(200), nullable=True),
        sa.Column('email', sa.String(200), nullable=True),
        sa.Column('telephone', sa.String(50), nullable=True),
        sa.Column('adresse', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('achats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('auction_id', sa.Integer(), nullable=False),
        sa.Column('numero_lot', sa.String(50), nullable=True),
        sa.Column('prix_achat', sa.Numeric(10, 2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['auction_id'], ['auctions.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('objets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('achat_id', sa.Integer(), nullable=False),
        sa.Column('designation', sa.String(300), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('couleur', sa.String(100), nullable=True),
        sa.Column('materiau', sa.String(100), nullable=True),
        sa.Column('poids', sa.String(50), nullable=True),
        sa.Column('dimensions', sa.String(100), nullable=True),
        sa.Column('periode', sa.String(100), nullable=True),
        sa.Column('prix_estime', sa.Numeric(10, 2), nullable=True),
        sa.Column('statut', sa.String(50), nullable=True),
        sa.ForeignKeyConstraint(['achat_id'], ['achats.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('photos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('objet_id', sa.Integer(), nullable=False),
        sa.Column('chemin_fichier', sa.String(500), nullable=False),
        sa.Column('legende', sa.String(300), nullable=True),
        sa.ForeignKeyConstraint(['objet_id'], ['objets.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('ventes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('objet_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('plateforme', sa.String(100), nullable=True),
        sa.Column('prix_vente', sa.Numeric(10, 2), nullable=True),
        sa.Column('date_vente', sa.Date(), nullable=True),
        sa.Column('statut', sa.String(50), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id']),
        sa.ForeignKeyConstraint(['objet_id'], ['objets.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('ventes')
    op.drop_table('photos')
    op.drop_table('objets')
    op.drop_table('achats')
    op.drop_table('clients')
    op.drop_table('auctions')
    op.drop_table('etudes')
