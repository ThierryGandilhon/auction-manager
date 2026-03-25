import { useEffect, useState } from 'react'
import { objetsApi, photoUrl } from '../lib/api'
import type { Objet } from '../types/index'
import Btn from '../components/Btn'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

const statutConfig: Record<string, { label: string; className: string }> = {
  'acheté':  { label: 'Acheté',   className: 'bg-muted text-muted-foreground hover:bg-muted' },
  en_vente:  { label: 'En vente', className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/10' },
  vendu:     { label: 'Vendu',    className: 'bg-green-500/10 text-green-600 hover:bg-green-500/10' },
}

export default function Objets() {
  const [objets, setObjets] = useState<Objet[]>([])
  const [filtre, setFiltre] = useState('')
  const navigate = useNavigate()

  useEffect(() => { objetsApi.list(filtre ? { statut: filtre } : {}).then(setObjets) }, [filtre])

  const fmt = (n?: number) => n != null ? Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Objets</h1>
          <p className="text-muted-foreground mt-1">Tous vos objets</p>
        </div>
        <div className="flex gap-2">
          {(['', 'acheté', 'en_vente', 'vendu'] as const).map(s => (
            <Btn key={s} size="sm" variant={filtre === s ? 'primary' : 'ghost'} onClick={() => setFiltre(s)}>
              {s === '' ? 'Tous' : statutConfig[s].label}
            </Btn>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {objets.map(o => {
          const cfg = statutConfig[o.statut] || statutConfig['acheté']
          const photo = o.photos[0]
          return (
            <div key={o.id}
              className="bg-card border rounded-lg overflow-hidden cursor-pointer hover:border-ring/50 transition-colors"
              onClick={() => navigate(`/objets/${o.id}`)}
            >
              <div className="h-40 bg-muted overflow-hidden">
                {photo
                  ? <img src={photoUrl(photo.chemin_fichier)} alt="" className="w-full h-full object-cover" />
                  : <div className="h-full flex items-center justify-center text-3xl text-muted-foreground/30">◉</div>
                }
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="font-medium text-sm flex-1">{o.designation}</div>
                  <Badge className={cfg.className}>{cfg.label}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  Lot {o.lot?.numero_lot || o.lot_id}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimé</span>
                  <span className="font-semibold text-primary">{fmt(o.prix_estime)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {objets.length === 0 && (
        <div className="text-muted-foreground text-center py-10">Aucun objet</div>
      )}
    </div>
  )
}
