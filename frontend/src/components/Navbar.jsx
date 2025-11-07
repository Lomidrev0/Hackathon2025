import { NavLink } from "react-router-dom"
import { useState } from "react";
import { FiHome, FiUser, FiSettings, FiMenu, FiMessageSquare } from "react-icons/fi";


  
export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-blue-700 text-white transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Toggle */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } p-4`}
      >
        {!isCollapsed && <h1 className="text-xl font-bold">Aplikácia</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded hover:bg-gray-700"
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col mt-4 space-y-1">
        <NavItem icon={<FiHome />} label="Dashboard" to="/dashboard" collapsed={isCollapsed} />
        <NavItem icon={<FiUser />} label="Moje informácie" to="/myinfo" collapsed={isCollapsed} />
        <NavItem icon={<FiMessageSquare />} label="Četový poradca" to="/chat" collapsed={isCollapsed} />
        <NavItem icon={<FiSettings />} label="Settings" to="/settings" collapsed={isCollapsed} />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, to, collapsed }) {
  return (
    <NavLink
      to={to}
      className={`flex items-center transition-all duration-200 rounded-md hover:bg-blue-900 
      ${collapsed ? "justify-center p-3" : "justify-start p-3 pl-5 gap-3"}`}
    >
      <div className="text-lg">{icon}</div>
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  );
}