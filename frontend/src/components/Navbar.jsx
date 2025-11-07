import { NavLink } from "react-router-dom"

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md transition ${
      isActive ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-blue-100"
    }`

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <h1 className="text-xl font-semibold text-blue-600">MyApp</h1>
      <div className="flex gap-3">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
      </div>
    </nav>
  )
}
