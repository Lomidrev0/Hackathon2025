import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex">
      {/* Sidebar / Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 min-h-screen bg-slate-950">
        <Outlet /> {/* 👈 This is the key line */}
      </main>
    </div>
  );
}