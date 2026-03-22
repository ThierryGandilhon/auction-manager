import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Etudes from './pages/Etudes'
import Auctions from './pages/Auctions'
import AuctionDetail from './pages/AuctionDetail'
import Objets from './pages/Objets'
import ObjetDetail from './pages/ObjetDetail'
import Clients from './pages/Clients'
import Ventes from './pages/Ventes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/etudes" element={<Etudes />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/objets" element={<Objets />} />
          <Route path="/objets/:id" element={<ObjetDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/ventes" element={<Ventes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
