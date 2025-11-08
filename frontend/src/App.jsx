import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Goals from "./pages/Goals"
import Dashboard from "./pages/Dashboard"
import Chat from "./pages/Chat"
import MainLayout from "./layouts/MainLayout"
import Settings from "./pages/Settings"
import Upload from "./pages/Upload"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upload" element={<Upload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
