import { useState, useEffect } from "react";
import axios from "axios";
import AddGoalModal from "../components/GoalModal";
import { FiPlus } from "react-icons/fi";

export default function Goals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funkcia na získanie cieľov
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/goals");
      // Zabezpečí, že goals je pole, alebo prázdne pole
      setGoals(res.data.goals ?? []);
    } catch (err) {
      console.error("Error fetching goals:", err);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  // Funkcia, ktorá sa zavolá po úspešnom pridaní cieľa
  const handleGoalAdded = (newGoals) => {
    setGoals(newGoals);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // výpočet progressu z dátumov
  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (today <= start) return 0;
    if (today >= end) return 100;

    const total = end - start;
    const passed = today - start;
    return Math.round((passed / total) * 100);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-10 rounded-lg to-gray-50 dark:from-blue-85 dark:to-dark-secondary">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-60 dark:text-white">
          Your goals
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <FiPlus className="mr-2" /> New goal
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-300">
          Loading goals...
        </div>
      ) : goals?.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-300">
          No goals found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals?.map((goal) => { // <-- OPRAVA .map()
            const progress = calculateProgress(goal.start_date, goal.end_date);
            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-dark-secondary rounded-xl shadow p-5 border border-gray-100 dark:border-neutral-700"
              >
                <h2 className="text-lg font-semibold text-blue-60 dark:text-white mb-2">
                  {goal.name}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  {goal.description || "No description."}
                </p>

                {/* Progress bar */}
                <div className="w-full mb-3">
                  <div className="flex justify-between mb-1 text-xs text-gray-600 dark:text-gray-300">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 ${
                        progress >= 100
                          ? "bg-green-600"
                          : progress > 50
                          ? "bg-blue-600"
                          : "bg-yellow-500"
                      } transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{goal.category}</span>
                  <span>
                    💰{" "}
                    {goal.target_amount ? goal.target_amount.toLocaleString('sk-SK', { style: 'currency', currency: 'EUR' }) : "Nezadaná suma"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>
                    🕒 Koniec:{" "}
                    {goal.end_date
                      ? new Date(goal.end_date).toLocaleDateString()
                      : "No date"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <AddGoalModal
          onClose={() => setIsModalOpen(false)}
          onGoalAdded={handleGoalAdded}
        />
      )}
    </div>
  );
}