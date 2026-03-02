import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CinematicaLab from './modules/cinematica/CinematicaLab'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cinematica" element={<CinematicaLab />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
