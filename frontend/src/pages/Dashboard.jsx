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
      title: { display: false},
    },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  return (
    <div className="max-w-6xl w-full mx-auto min-h-screen flex justify-center items-start">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ position: "relative", height: "25vh", width: "65vw" }} >
      {/* Left column: Doughnut chart */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-center">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Spending by Category</h2>
        
          <Doughnut data={categoryData} />
        
      </div>

      {/* Right column: stacked layout */}
      <div className="flex flex-col gap-6">
        {/* Top: Stacked bar chart */}
        <div className="bg-white rounded-xl shadow p-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Spending Breakdown by Month</h2>
          <div className="h-56">
            <Bar data={stackedData} options={stackedOptions} />
          </div>
        </div>

        {/* Bottom: Trend chart */}
        <div className="bg-white rounded-xl shadow p-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Spending Over Time</h2>
          <div className="h-56">
            <Line data={trendData} />
          </div>
        </div>
      </div>
    </div>
</div>
  );
}


