export interface Etude {
  id: number
  nom: string
  ville?: string
  email?: string
  telephone?: string
  site_web?: string
}

export interface Auction {
  id: number
  etude_id: number
  titre: string
  date_auction?: string
  lieu?: string
  url_catalogue?: string
  notes?: string
  etude: Etude
}

export interface Achat {
  id: number
  auction_id: number
  numero_lot?: string
  prix_achat?: number
  notes?: string
  auction: Auction
}

export interface Photo {
  id: number
  chemin_fichier: string
  legende?: string
}

export interface Objet {
  id: number
  achat_id: number
  designation: string
  description?: string
  couleur?: string
  materiau?: string
  poids?: string
  dimensions?: string
  periode?: string
  prix_estime?: number
  statut: 'en_stock' | 'en_vente' | 'vendu'
  achat: Achat
  photos: Photo[]
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

export interface Vente {
  id: number
  objet_id: number
  client_id?: number
  plateforme?: string
  prix_vente?: number
  date_vente?: string
  statut: 'en_ligne' | 'vendu' | 'annule'
  objet: Objet
  client?: Client
  marge?: number
}

export interface DashboardStats {
  total_lots_achetes: number
  total_objets: number
  total_investi: number
  total_revendu: number
  marge_totale: number
  objets_en_stock: number
  objets_en_vente: number
  objets_vendus: number
  total_clients: number
}
