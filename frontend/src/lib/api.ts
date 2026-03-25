import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
})

// Etudes
export const etudesApi = {
  list: () => api.get('/etudes/').then(r => r.data),
  get: (id: number) => api.get(`/etudes/${id}`).then(r => r.data),
  create: (data: object) => api.post('/etudes/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/etudes/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/etudes/${id}`),
}

// Achats (purchase events at an etude)
export const achatsApi = {
  list: (etude_id?: number) => api.get('/achats/', { params: { etude_id } }).then(r => r.data),
  get: (id: number) => api.get(`/achats/${id}`).then(r => r.data),
  create: (data: object) => api.post('/achats/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/achats/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/achats/${id}`),
}

// Lots (individual lots within an achat)
export const lotsApi = {
  list: (achat_id?: number) => api.get('/lots/', { params: { achat_id } }).then(r => r.data),
  get: (id: number) => api.get(`/lots/${id}`).then(r => r.data),
  create: (data: object) => api.post('/lots/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/lots/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/lots/${id}`),
}

// Objets
export const objetsApi = {
  list: (params?: { lot_id?: number; statut?: string }) => api.get('/objets/', { params }).then(r => r.data),
  get: (id: number) => api.get(`/objets/${id}`).then(r => r.data),
  create: (data: object) => api.post('/objets/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/objets/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/objets/${id}`),
  uploadPhoto: (id: number, file: File, legende?: string) => {
    const form = new FormData()
    form.append('file', file)
    if (legende) form.append('legende', legende)
    return api.post(`/objets/${id}/photos`, form).then(r => r.data)
  },
  deletePhoto: (photoId: number) => api.delete(`/objets/photos/${photoId}`),
}

// Clients
export const clientsApi = {
  list: () => api.get('/clients/').then(r => r.data),
  get: (id: number) => api.get(`/clients/${id}`).then(r => r.data),
  create: (data: object) => api.post('/clients/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/clients/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/clients/${id}`),
}

// Ventes
export const ventesApi = {
  list: (params?: { statut?: string; client_id?: number }) => api.get('/ventes/', { params }).then(r => r.data),
  get: (id: number) => api.get(`/ventes/${id}`).then(r => r.data),
  create: (data: object) => api.post('/ventes/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/ventes/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/ventes/${id}`),
  addObjet: (vente_id: number, objet_id: number, prix_vente?: number | null) =>
    api.post(`/ventes/${vente_id}/objets`, { objet_id, prix_vente }).then(r => r.data),
  updateObjet: (vente_id: number, objet_id: number, prix_vente?: number | null) =>
    api.put(`/ventes/${vente_id}/objets/${objet_id}`, { objet_id, prix_vente }).then(r => r.data),
  removeObjet: (vente_id: number, objet_id: number) =>
    api.delete(`/ventes/${vente_id}/objets/${objet_id}`).then(r => r.data),
}

// Stats
export const statsApi = {
  dashboard: () => api.get('/stats/dashboard').then(r => r.data),
}

export const photoUrl = (chemin: string) => `${API_URL}/uploads/${chemin}`
