import { useState } from "react";

export default function MyInfo() {
  const [formData, setFormData] = useState({
    age: "",
    monthlySalary: "",
    occupation: "",
    monthlySavingsGoal: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted data:", formData);
    alert("Formulár odoslaný! 🎉");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dotazník používateľa</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Osobné informácie</h2>
          <div className="flex flex-col space-y-2">
         
            <label className="text-sm font-medium">Vek</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Váš vek"
            />
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Kontakt</h2>
          <label className="text-sm font-medium">Email</label>
          <input
            type="text"
            name="monthlySalary"
            value={formData.monthlySalary}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Váš mesačný príjem"
          />
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Pracovné informácie</h2>
          <label className="text-sm font-medium">Povolanie</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Vaša profesia alebo povolanie"
          />
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Spätná väzba</h2>
          <input
            type="text"
            name="monthlySavingsGoal"
            value={formData.monthlySavingsGoal}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={"Váš mesačný cieľ sporenia, napr. {}"}
          ></input>
        </section>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Odoslať všetko
          </button>
        </div>
      </form>
    </div>
  );
}