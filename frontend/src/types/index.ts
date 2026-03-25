export interface Etude {
  id: number
  nom: string
  ville?: string
  email?: string
  telephone?: string
  site_web?: string
}

export interface Achat {
  id: number
  etude_id: number
  titre?: string
  date_achat?: string
  lieu?: string
  notes?: string
  etude: Etude
}

export interface Lot {
  id: number
  achat_id: number
  numero_lot?: string
  prix_achat?: number
  notes?: string
  achat: { id: number; titre?: string; date_achat?: string }
}

export interface Photo {
  id: number
  chemin_fichier: string
  legende?: string
}

export interface ClientShort {
  id: number
  nom: string
  prenom?: string
}

export interface VenteShort {
  id: number
  plateforme?: string
  date_vente?: string
  statut: string
  prix_vente?: number
  client?: ClientShort
}

export interface Objet {
  id: number
  lot_id: number
  designation: string
  description?: string
  couleur?: string
  materiau?: string
  poids?: string
  dimensions?: string
  periode?: string
  prix_achat?: number
  prix_estime?: number
  statut: 'acheté' | 'en_vente' | 'vendu'
  lot: { id: number; numero_lot?: string; prix_achat?: number; achat_id: number }
  photos: Photo[]
  vente?: VenteShort
}

export interface Client {
  id: number
  nom: string
  prenom?: string
  email?: string
  telephone?: string
  adresse?: string
  notes?: string
}

export interface VenteObjet {
  id: number
  objet_id: number
  prix_vente?: number
  marge?: number
  objet: {
    id: number
    designation: string
    prix_achat?: number
    statut: string
  }
}

export interface Vente {
  id: number
  client_id?: number
  plateforme?: string
  date_vente?: string
  notes?: string
  statut: 'en_cours' | 'finalisée' | 'annulée'
  client?: ClientShort
  vente_objets: VenteObjet[]
  total_vente?: number
}

export interface DashboardStats {
  total_lots: number
  total_objets: number
  total_investi: number
  total_revendu: number
  marge_totale: number
  objets_achetes: number
  objets_en_vente: number
  objets_vendus: number
  total_clients: number
}
