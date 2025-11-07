import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import Contact from "./pages/Contact"

export default function App() {
  return (
    <Router>
      <nav className="p-4 flex gap-4 bg-gray-100">
        <Link to="/">Domov</Link>
        <Link to="/about">O nás</Link>
        <Link to="/contact">Kontakt</Link>
      </nav>

      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  )
}
