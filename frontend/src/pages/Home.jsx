import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

export default function Home() {
  const getInitialMode = () => {
    const saved = localStorage.getItem("theme")
    if (saved === "dark") return true
    if (saved === "light") return false
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  }

  const [darkMode, setDarkMode] = useState(getInitialMode)

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
    <div className="flex flex-col md:flex-row h-screen transition-colors duration-500 bg-gradient-to-br from-blue-10 to-white dark:from-blue-85 dark:to-dark-secondary">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-60 text-white rounded-lg shadow hover:opacity-90 transition"
      >
        {darkMode ? "Light" : "Dark"}
      </button>

      <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left p-10 md:w-1/2">
        <h1 className="text-5xl font-bold mb-4 text-blue-60 dark:text-light-primary">
          Decisions Today, Wealth Tomorrow
        </h1>
        <p className="text-lg text-gray-600 dark:text-text-soft mb-6 max-w-md">
          Fanless design means MacBook Air stays completely silent no matter how intense the task.
        </p>
      </div>

      <div className="flex items-center justify-center md:w-1/2 bg-white dark:bg-dark-primary shadow-2xl rounded-t-2xl md:rounded-none md:rounded-l-2xl p-8">
        <div className="w-11/12 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-2 text-blue-60 dark:text-light-primary">Log in</h2>
          <p className="text-gray-600 dark:text-text-soft mb-6">Welcome back!</p>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-secondary bg-white dark:bg-dark-secondary text-gray-800 dark:text-text-light rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-30"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-secondary bg-white dark:bg-dark-secondary text-gray-800 dark:text-text-light rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-30"
            />
            <Link to="/dashboard" className="w-full">
              <button
                type="submit"
                className="w-full bg-blue-50 dark:bg-blue-60 text-white py-3 rounded-lg font-semibold hover:bg-blue-60 dark:hover:bg-blue-40 transition"
              >
                Continue
              </button>
            </Link>
          </form>

          <p className="mt-6 text-sm text-gray-600 dark:text-text-soft">
            Don't have an account?{" "}
            <Link to="/" className="text-blue-60 dark:text-blue-30 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
