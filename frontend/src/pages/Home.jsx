import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-white text-center">
      <h1 className="text-5xl font-bold mb-6 text-blue-700">Vitaj v MyApp 👋</h1>
      <p className="text-lg text-gray-700 mb-8">
        Toto je hlavná stránka — navigácia sa zobrazí až na podstránkach.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Pokračovať do aplikácie
      </Link>
    </div>
  )
}
