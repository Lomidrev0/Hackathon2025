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
  RadialLinearScale, // 👈 NEW
  Title
} from "chart.js";
import { Doughnut, Line, Bar, Radar } from "react-chartjs-2";

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
);


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

export default function Dashboard() {
  // Sample data (replace later with DB values)
  const categoryData = {
    labels: ["Groceries", "Transport", "Dining", "Entertainment", "Utilities"],
    datasets: [
      {
        data: [350, 120, 220, 150, 90],
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6"
        ],
        borderWidth: 1,
      },
    ],
  };

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
  };

const merchantData = {
  labels: ["Lidl", "Shell", "Netflix", "IKEA", "Uber Eats"],
  datasets: [
    {
      label: "Spending (€)",
      data: [230, 120, 75, 180, 95],
      backgroundColor: "rgba(59, 131, 246, 0.24)",
      borderColor: "#3B82F6",
      fill: true,
      pointBackgroundColor: "#3B82F6",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#3B82F6",
    },
  ],
};

const radarOptions = {
  responsive: true,
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        backdropColor: "transparent",
        color: "#6B7280",
      },
      grid: {
        color: "rgba(156,163,175,0.2)",
      },
      angleLines: {
        color: "rgba(156,163,175,0.2)",
      },
      pointLabels: {
        color: "#374151",
        font: { size: 12 },
      },
    },
  },
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Top Vendors Spending Profile" },
  },
};

  const stackedData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Groceries",
        data: [150, 120, 130, 140, 110],
        backgroundColor: "#3B82F6",
      },
      {
        label: "Transport",
        data: [40, 50, 45, 60, 55],
        backgroundColor: "#10B981",
      },
      {
        label: "Dining",
        data: [90, 100, 110, 95, 85],
        backgroundColor: "#F59E0B",
      },
    ],
  };

  const stackedOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Dlhodobé rozdelenie výdavkov" },
    },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Rozdelenie výdavkov podľa kategórií
          </h2>
          <Doughnut data={categoryData} />
        </div>

        {/* Trend over time */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Trend výdavkov v čase
          </h2>
          <Line data={trendData} />
        </div>

        {/* Top Vendors */}
<div className="bg-white rounded-xl shadow p-4">
  <h2 className="text-lg font-semibold mb-4 text-gray-700">Top Vendors</h2>
  <Radar data={merchantData} options={radarOptions} />
</div>

        {/* Stacked category breakdown */}
        <div className="bg-white rounded-xl shadow p-4">
          <Bar data={stackedData} options={stackedOptions} />
        </div>
      </div>
    </div>
  );
}


