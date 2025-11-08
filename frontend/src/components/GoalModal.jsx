import { useState } from "react";
import axios from "axios"; // Import axios pre HTTP požiadavky

const CATEGORY_OPTIONS = [
  "Food & Groceries", "Dining & Takeaway", "Drinks & Beverages",
  "Home & Cleaning", "Health & Medicine", "Beauty & Personal Care",
  "Fashion & Accessories", "Home & Garden", "Electronics & Appliances",
  "Entertainment & Hobbies", "Sports & Recreation", "Auto & Transport",
  "Baby & Kids", "Pet Care", "Construction & DIY",
  "Education & Office", "Services", "Fees & Miscellaneous",
];

// Prijíma onGoalAdded, ktoré prijíma aktualizovaný zoznam cieľov
export default function AddGoalModal({ onClose, onGoalAdded }) {
  const [goalData, setGoalData] = useState({
    name: "",
    description: "",
    target_amount: "", // Nové pole
    start_date: "",     // Nové pole
    end_date: "",       // Zmenené z 'targetDate' na 'end_date'
    category: "",
    motivation: "",     // Voliteľné, ale pridané pre úplnosť API
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setGoalData({ ...goalData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // API očakáva target_amount ako float, preto ju konvertujeme
    const payload = {
      ...goalData,
      target_amount: parseFloat(goalData.target_amount) || 0,
    };

    try {
      const res = await axios.post("http://localhost:8000/goals", payload);

      if (res.data.error) {
        throw new Error(res.data.error);
      }

      // Ak je pridanie úspešné, API vracia aktualizovaný zoznam cieľov v res.data.goals
      if (res.data.goals) {
          onGoalAdded(res.data.goals);
      } else {
          // V prípade nekonzistentnej odpovede API, aspoň zatvor modal
          onClose();
      }

      // ⭐ OPRAVA: Reset formulára a stavu submittovania po úspechu
      setGoalData({
        name: "", description: "", target_amount: "", start_date: "",
        end_date: "", category: "", motivation: ""
      });
      setIsSubmitting(false);

    } catch (err) {
      console.error("Error adding goal:", err);
      setError(err.message || "Nepodarilo sa pridať cieľ.");
      setIsSubmitting(false); // Zastavíme loading v prípade chyby
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-dark-primary rounded-2xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-light-primary">
          Add New Goal
        </h2>

        {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Error: {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
              Goal Name
            </label>
            <input
              type="text"
              name="name"
              value={goalData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
              Description
            </label>
            <textarea
              name="description"
              value={goalData.description}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
              Motivation (Optional)
            </label>
            <input
              type="text"
              name="motivation"
              value={goalData.motivation}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
              Target Amount (€)
            </label>
            <input
              type="number"
              name="target_amount"
              value={goalData.target_amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={goalData.start_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
                End Date (Target Date)
              </label>
              <input
                type="date"
                name="end_date"
                value={goalData.end_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-dark-secondary rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
              />
            </div>
          </div>


          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-light-secondary">
              Category
            </label>
            <select
              name="category"
              value={goalData.category}
              onChange={handleChange}
              required
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
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}