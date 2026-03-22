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

// Auctions
export const auctionsApi = {
  list: (etude_id?: number) => api.get('/auctions/', { params: { etude_id } }).then(r => r.data),
  get: (id: number) => api.get(`/auctions/${id}`).then(r => r.data),
  create: (data: object) => api.post('/auctions/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/auctions/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/auctions/${id}`),
}

// Achats
export const achatsApi = {
  list: (auction_id?: number) => api.get('/achats/', { params: { auction_id } }).then(r => r.data),
  get: (id: number) => api.get(`/achats/${id}`).then(r => r.data),
  create: (data: object) => api.post('/achats/', data).then(r => r.data),
  update: (id: number, data: object) => api.put(`/achats/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/achats/${id}`),
}

// Objets
export const objetsApi = {
  list: (params?: { achat_id?: number; statut?: string }) => api.get('/objets/', { params }).then(r => r.data),
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
}

// Stats
export const statsApi = {
  dashboard: () => api.get('/stats/dashboard').then(r => r.data),
}

export const photoUrl = (chemin: string) => `${API_URL}/uploads/${chemin}`
