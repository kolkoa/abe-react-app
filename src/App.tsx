// src/App.tsx
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ImageGenerator } from './components/ImageGenerator'
import { Gallery } from './components/Gallery'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ImageGenerator />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </Router>
  )
}

export default App