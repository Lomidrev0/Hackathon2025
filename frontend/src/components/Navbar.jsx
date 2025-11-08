import { NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import { FiHome, FiUser, FiSettings, FiMenu, FiMessageSquare, FiSun, FiMoon } from "react-icons/fi"

export default function Navbar({ isCollapsed, setIsCollapsed }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  return (
    <div
      className={`h-screen flex flex-col fixed  justify-between transition-all duration-100 ${
        isCollapsed ? "w-20" : "w-64"
      } bg-white dark:bg-dark-secondary text-gray-900 dark:text-gray-100 shadow-lg`}
    >
        <div>
            <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            } p-4 border-b border-gray-200 dark:border-neutral-700 bg-blue-50 dark:bg-blue-60 text-white`}
          >
            {!isCollapsed && <h1 className="text-xl font-bold">Aplikácia</h1>}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded "
            >
              <FiMenu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col mt-4 space-y-1 mx-1">
            <NavItem icon={<FiHome />} label="Home" to="/dashboard" collapsed={isCollapsed} />
            <NavItem icon={<FiMessageSquare />} label="Chat bot" to="/chat" collapsed={isCollapsed} />
            <NavItem icon={<FiUser />} label="My Goals" to="/goals" collapsed={isCollapsed} />
            <NavItem icon={<FiSettings />} label="Nastavenia" to="/settings" collapsed={isCollapsed} />
          </nav>
        </div>
      {/* Header / Toggle */}
      {/* Dark mode toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-60 text-white font-semibold hover:bg-blue-60 dark:hover:bg-blue-40"
        >
          <>
          {darkMode ? (
              <FiSun />
          ) : (
              <FiMoon />
          )}
             {!isCollapsed && <span>Change theme</span>}
          </>
        </button>
      </div>
    </div>
  )
}

function NavItem({ icon, label, to, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center transition-all duration-200 rounded-md ${
          collapsed ? "justify-center p-3" : "justify-start p-3 pl-5 gap-3"
        } hover:bg-gray-100 dark:hover:bg-neutral-800 ${
          isActive ? "bg-blue-10 dark:bg-blue-85 font-semibold" : ""
        }`
      }
    >
      <div className="text-lg">{icon}</div>
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  )
}