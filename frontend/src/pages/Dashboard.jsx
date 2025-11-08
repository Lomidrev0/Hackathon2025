import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement,
  RadialLinearScale,
  Title,
} from "chart.js"
import { Doughnut, Line, Bar, Radar } from "react-chartjs-2"
import { useEffect, useState } from "react"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Title
)

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const textColor = darkMode ? "#E5E7EB" : "#374151"
  const gridColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
  const bgColor = darkMode ? "#121214" : "#FFFFFF"

  const categoryData = {
    labels: ["Groceries", "Transport", "Dining", "Entertainment", "Utilities"],
    datasets: [
      {
        data: [350, 120, 220, 150, 90],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
        borderWidth: 1,
      },
    ],
  }

  const trendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Spending (€)",
        data: [430, 520, 480, 610, 450, 530],
        fill: true,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
      },
    ],
  }

  const merchantData = {
    labels: ["Lidl", "Shell", "Netflix", "IKEA", "Uber Eats"],
    datasets: [
      {
        label: "Spending (€)",
        data: [230, 120, 75, 180, 95],
        backgroundColor: "rgba(59,131,246,0.24)",
        borderColor: "#3B82F6",
        fill: true,
        pointBackgroundColor: "#3B82F6",
      },
    ],
  }

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        ticks: { backdropColor: "transparent", color: textColor },
        grid: { color: gridColor },
        angleLines: { color: gridColor },
        pointLabels: { color: textColor, font: { size: 12 } },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top Vendors Spending Goals", color: textColor },
    },
  }

  const stackedData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      { label: "Groceries", data: [150, 120, 130, 140, 110], backgroundColor: "#3B82F6" },
      { label: "Transport", data: [40, 50, 45, 60, 55], backgroundColor: "#10B981" },
      { label: "Dining", data: [90, 100, 110, 95, 85], backgroundColor: "#F59E0B" },
    ],
  }

  const stackedOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: textColor } },
      title: { display: true, text: "Dlhodobé rozdelenie výdavkov", color: textColor },
    },
    scales: {
      x: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } },
      y: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } },
    },
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-10 rounded-lg to-gray-50 dark:from-blue-85 dark:to-dark-secondary">
      <h1 className="text-3xl font-bold mb-6 text-blue-60 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <div className={`rounded-xl shadow p-4`} style={{ backgroundColor: bgColor }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Rozdelenie výdavkov podľa kategórií
          </h2>
          <Doughnut data={categoryData} />
        </div>

        <div className={`rounded-xl shadow p-4`} style={{ backgroundColor: bgColor }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Trend výdavkov v čase
          </h2>
          <Line data={trendData} options={{
            responsive: true,
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
              x: { ticks: { color: textColor }, grid: { color: gridColor } },
              y: { ticks: { color: textColor }, grid: { color: gridColor } },
            },
          }} />
        </div>

        <div className={`rounded-xl shadow p-4`} style={{ backgroundColor: bgColor }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Top Vendors
          </h2>
          <Radar data={merchantData} options={radarOptions} />
        </div>

        <div className={`rounded-xl shadow p-4`} style={{ backgroundColor: bgColor }}>
          <Bar data={stackedData} options={stackedOptions} />
        </div>
      </div>
    </div>
  )
}
