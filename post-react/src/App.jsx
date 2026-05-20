import { BrowserRouter as Router, Routes, Route } from 'react-router'

import Home from './pages/Home'
import Login from './pages/Login' 
import Post from './pages/Post'

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Ruta para la página de login. */}
          <Route path="/" element={<Login />} />
          {/* Ruta para la página principal, solo accesible después de iniciar sesión. */}
          <Route path="/home" element={<Home />} />
          {/* Ruta para la página de productos. */}
          <Route path="/post" element={<Post />} />
        </Routes>
      </Router>
    </>
  )
}

export default App