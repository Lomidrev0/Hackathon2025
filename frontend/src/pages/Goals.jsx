import { useState, useEffect, useCallback } from "react";
import AddGoalModal from "../components/GoalModal";
import { FiPlus, FiChevronUp, FiChevronDown, FiEdit2 } from "react-icons/fi";
import { GiAchievement } from "react-icons/gi";

// --- DUMMY DÁTA PRE ULTIMATE GOAL (POČIATOČNÉ) ---
const INITIAL_ULTIMATE_GOAL = {
  name: "Trip to Japan 🇯🇵",
  description: "Save enough money and plan all logistics for an unforgettable 3-week trip to Japan.",
  target: 13500, // Celková cieľová suma (EUR)
  current_amount: 6421, // Aktuálne nasporená suma (EUR)
  category: "Travel & Experience",
  deadline: "2026-06-12",
};

// --- KONŠTANTY A POMOCNÉ FUNKCIE PRE LOCAL STORAGE ---
const LS_GOALS_KEY = "userGoals";
const LS_ULTIMATE_GOAL_KEY = "ultimateGoalData";
const INITIAL_GOAL_COUNT = 3;

// Dummy ciele pre bežné ciele
const INITIAL_GOALS_DUMMY = [
  { id: 1, name: "Daily Meditation", description: "Meditate for 15 minutes every morning.", start_date: "2024-01-01", end_date: "2024-12-31", target_amount: 0, category: "Wellness" },
  { id: 2, name: "Read 12 Books", description: "Finish one book per month.", start_date: "2024-01-01", end_date: "2024-12-31", target_amount: 0, category: "Personal Growth" },
  { id: 3, name: "Run a Half Marathon", description: "Complete the local half marathon race.", start_date: "2024-03-01", end_date: "2024-10-15", target_amount: 50, category: "Fitness" },
  { id: 4, name: "Learn Spanish Basics", description: "Complete Duolingo Level 5.", start_date: "2024-01-01", end_date: "2024-08-31", target_amount: 0, category: "Education" },
  { id: 5, name: "Write 10 Blog Posts", description: "Produce original content for personal blog.", start_date: "2024-03-01", end_date: "2024-12-31", target_amount: 0, category: "Creative" },
];

// Kategórie pre Ultimate Goal Modal
const CATEGORY_OPTIONS = [
  "Food & Groceries", "Dining & Takeaway", "Drinks & Beverages",
  "Home & Cleaning", "Health & Medicine", "Beauty & Personal Care",
  "Fashion & Accessories", "Home & Garden", "Electronics & Appliances",
  "Entertainment & Hobbies", "Sports & Recreation", "Auto & Transport",
  "Baby & Kids", "Pet Care", "Construction & DIY",
  "Education & Office", "Services", "Fees & Miscellaneous",
  "Travel & Experience",
];


// Local Storage logiky
const loadGoalsFromLocalStorage = (key, initialData) => {
  try {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : initialData;
  } catch (error) {
    console.error(`Error loading ${key} from Local Storage:`, error);
    return initialData;
  }
};

const saveGoalsToLocalStorage = (key, goals) => {
  try {
    localStorage.setItem(key, JSON.stringify(goals));
  } catch (error) {
    console.error(`Error saving ${key} to Local Storage:`, error);
  }
};

// Všeobecné pomocné funkcie
const calculateUltimateProgress = (current, target) => {
  if (target <= 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(100, Math.round(progress));
};

const formatCurrency = (amount) => amount.toLocaleString('sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });


// --- KOMPONENT ULTIMATE GOAL MODAL (UPRAVENÝ PODĽA VZORU PRE KONTRAST) ---
const UltimateGoalModal = ({ goal, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: goal.name,
    description: goal.description,
    target: goal.target,
    current_amount: goal.current_amount,
    deadline: goal.deadline,
    category: goal.category,
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Konverzia na číslo pre sumy
      [name]: (name === 'target' || name === 'current_amount') ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
        ...formData,
        target: parseFloat(formData.target) || 0,
        current_amount: parseFloat(formData.current_amount) || 0,
    };

    // Simulating save operation
    setTimeout(() => {
        try {
            if (payload.target < payload.current_amount) {
                throw new Error("Target amount must be greater than or equal to current saved amount.");
            }
            // Uloženie dát späť do Goals komponentu
            onSave(payload);
        } catch (err) {
            setError(err.message || "Nepodarilo sa uložiť hlavný cieľ.");
            setIsSubmitting(false);
        }
    }, 500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      {/* Použitie farieb z referenčného modalu pre konzistentný vzhľad */}
      <div className="bg-white dark:bg-dark-primary rounded-2xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-light-primary">
          Edit Ultimate Goal 🌟
        </h2>

        {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Error: {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Goal Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
              Goal Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              // Triedy inputu z referenčného modalu
              className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              // Triedy inputu z referenčného modalu
              className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
            />
          </div>

          {/* Target Amount a Current Saved Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
                Target Amount (€)
              </label>
              <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                // Triedy inputu z referenčného modalu
                className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
                Current Saved Amount (€)
              </label>
              <input
                type="number"
                name="current_amount"
                value={formData.current_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                // Triedy inputu z referenčného modalu
                className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
              />
            </div>
          </div>

          {/* Deadline a Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                // Triedy inputu z referenčného modalu
                className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                // Triedy selectu z referenčného modalu
                className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 bg-white dark:bg-dark-secondary dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-light-secondary hover:bg-gray-100 dark:hover:bg-dark-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- HLAVNÝ KOMPONENT GOALS ---
export default function Goals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUltimateModalOpen, setIsUltimateModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [goals, setGoals] = useState([]);
  const [ultimateGoal, setUltimateGoal] = useState(INITIAL_ULTIMATE_GOAL);
  const [loading, setLoading] = useState(true);
  const [showAllGoals, setShowAllGoals] = useState(false);

  // Načítanie stavu z Local Storage pri štarte
  useEffect(() => {
    const storedUltimateGoal = loadGoalsFromLocalStorage(LS_ULTIMATE_GOAL_KEY, INITIAL_ULTIMATE_GOAL);
    setUltimateGoal(storedUltimateGoal);

    const storedGoals = loadGoalsFromLocalStorage(LS_GOALS_KEY, INITIAL_GOALS_DUMMY);
    setGoals(storedGoals);
    setLoading(false);
  }, []);

  // Vypočítanie progressu Ultimate Goal
  const ultimateProgress = calculateUltimateProgress(ultimateGoal.current_amount, ultimateGoal.target);

  // LOGIKA ULTIMATE GOAL EDIT
  const handleUltimateGoalSave = (updatedGoal) => {
    setUltimateGoal(updatedGoal);
    saveGoalsToLocalStorage(LS_ULTIMATE_GOAL_KEY, updatedGoal);
    setIsUltimateModalOpen(false);
  };

  // LOGIKA BEŽNÝCH CIEĽOV (IBA PRIDANIE, EDITÁCIA BOLA ODSTRÁNENÁ)
  const handleGoalAddedOrEdited = (updatedGoal) => {
    let newGoals;

    if (goalToEdit) {
      // Režim EDITÁCIE (iba ak ho plánujete v AddGoalModal neskôr použiť)
      newGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    } else {
      // Režim PRIDANIE
      const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
      newGoals = [...goals, { ...updatedGoal, id: newId }];
    }

    setGoals(newGoals);
    saveGoalsToLocalStorage(LS_GOALS_KEY, newGoals);
    closeGoalModal();
  };

  // Funkcie pre modaly
  const openAddModal = () => { setGoalToEdit(null); setIsModalOpen(true); };
  const closeGoalModal = () => { setIsModalOpen(false); setGoalToEdit(null); };

  const openUltimateModal = () => { setIsUltimateModalOpen(true); };
  const closeUltimateModal = () => { setIsUltimateModalOpen(false); };


  // výpočet progressu z dátumov (pre bežné ciele)
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

  // Zobrazenie a See More/Less
  const goalsToShow = showAllGoals ? goals : goals.slice(0, INITIAL_GOAL_COUNT);
  const shouldShowSeeMoreButton = goals.length > INITIAL_GOAL_COUNT && !showAllGoals;
  const shouldShowSeeLessButton = goals.length > INITIAL_GOAL_COUNT && showAllGoals;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-10 rounded-lg to-gray-50 dark:from-blue-85 dark:to-dark-secondary">

      {/* Sekcia pre Ultimate Goal (Editovateľná) */}
      <div className="text-center mb-8 relative">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-8 rounded-xl shadow-2xl transform hover:scale-[1.01] transition duration-300">

            {/* Tlačidlo Editácie pre Ultimate Goal */}
            <button
                onClick={openUltimateModal}
                className="absolute top-3 right-3 p-2 rounded-full text-blue-200 hover:text-white transition z-10"
                title="Editovať hlavný cieľ"
            >
                <FiEdit2 className="w-5 h-5" />
            </button>

          <GiAchievement className="w-12 h-12 text-yellow-300 mx-auto mb-3" />
          <h2 className="text-4xl font-extrabold text-white mb-2">
            {ultimateGoal.name}
          </h2>
          <p className="text-blue-100 text-lg mb-5 max-w-xl mx-auto">
            {ultimateGoal.description}
          </p>

          {/* Ultimate Goal Progress Bar a Sumy */}
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="flex justify-between mb-1 text-sm font-medium text-white">
              <span className="font-bold">
                Progress: {ultimateProgress}%
              </span>
              <span className="font-bold">
                {formatCurrency(ultimateGoal.current_amount)} / {formatCurrency(ultimateGoal.target)}
              </span>
            </div>
            <div className="w-full bg-blue-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-yellow-200 transition-all duration-700"
                style={{ width: `${ultimateProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-blue-100 mt-2 flex justify-between">
                <span>Category: {ultimateGoal.category}</span>
                <span>Deadline: {new Date(ultimateGoal.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Koniec sekcie pre Ultimate Goal */}

      {/* Sekcia pre bežné ciele */}
      <div className="flex justify-between mb-6 pt-4 border-t border-gray-200 dark:border-neutral-700">
        <h1 className="text-3xl font-bold text-blue-60 dark:text-white">
          Your daily goals
        </h1>

        <button
          onClick={openAddModal}
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goalsToShow.map((goal) => {
              const progress = calculateProgress(goal.start_date, goal.end_date);

              return (
                <div
                  key={goal.id}
                  // Telo bežného cieľa
                  className="bg-white dark:bg-dark-secondary rounded-xl shadow p-5 border border-gray-100 dark:border-neutral-700"
                >
                    {/* Tlačidlo Editácie pre bežné ciele je ODSTRÁNENÉ */}

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
                            : "bg-yellow-200"
                        } transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{goal.category}</span>
                    <span>
                      💰{" "}
                      {goal.target_amount ? formatCurrency(goal.target_amount) : "Nezadaná suma"}
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

          <div className="text-center mt-6">
            {/* Tlačidlo "See more" - Obnovené */}
            {shouldShowSeeMoreButton && (
              <button
                onClick={() => setShowAllGoals(true)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold py-2 px-4 rounded transition duration-150 ease-in-out border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center justify-center mx-auto"
              >
                <FiChevronDown className="mr-2" /> See more ({goals.length - INITIAL_GOAL_COUNT} more)
              </button>
            )}

            {/* Tlačidlo "See less" - Obnovené */}
            {shouldShowSeeLessButton && (
              <button
                onClick={() => setShowAllGoals(false)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold py-2 px-4 rounded transition duration-150 ease-in-out border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center justify-center mx-auto"
              >
                <FiChevronUp className="mr-2" /> See less
              </button>
            )}
          </div>
        </>
      )}

      {/* MODALY */}

      {/* Modal pre bežné ciele (AddGoalModal) */}
      {isModalOpen && (
        <AddGoalModal
          onClose={closeGoalModal}
          onGoalAdded={handleGoalAddedOrEdited}
          initialGoalData={goalToEdit}
        />
      )}

      {/* Modal pre Ultimate Goal - teraz používa nové štýly a má správny kontrast */}
      {isUltimateModalOpen && (
        <UltimateGoalModal
          goal={ultimateGoal}
          onClose={closeUltimateModal}
          onSave={handleUltimateGoalSave}
        />
      )}
    </div>
  );
}