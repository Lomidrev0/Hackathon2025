import Navbar from "../components/Navbar"
import { Outlet } from "react-router-dom"
import { useState } from "react"

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex bg-white dark:bg-dark-primary">
      {/* Sidebar */}
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content */}
      <main
        className={`transition-all duration-300 flex-1 min-h-screen p-6 bg-white dark:bg-dark-primary text-gray-900 dark:text-gray-100 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}