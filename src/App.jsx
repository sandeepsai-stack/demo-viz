import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Gateway from './pages/Gateway'
import Router from './pages/Router'

function App() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/demo-viz/" element={<Gateway />} />
        <Route path="/demo-viz/gateway" element={<Gateway />} />
        <Route path="/demo-viz/router" element={<Router />} />
      </Routes>
    </div>
  )
}

export default App
