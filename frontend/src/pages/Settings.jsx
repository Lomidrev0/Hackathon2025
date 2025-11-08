import { useState } from "react";
import { Switch } from "@headlessui/react";

export default function Settings() {
  // Local states (you can later sync these with backend or localStorage)
  const [email, setEmail] = useState("user@example.com");
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(false);

  const handleSave = () => {
    // For now, just log to console (or show a toast)
    console.log({
      email,
      hardcoreMode,
      notifications,
      autoUpdates,
    });
    alert("Nastavenia uložené (lokálne)");
  };

  //"p-6 min-h-screen bg-gradient-to-br from-blue-10 rounded-lg to-gray-50 dark:from-blue-85 dark:to-dark-secondary"
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-10 rounded-lg to-gray-50 dark:from-blue-85 dark:to-dark-secondary p-8">
      <div className="bg-white dark:bg-dark-primary rounded-2xl shadow-lg w-full max-w-4xl p-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-10">
          Nastavenia používateľa
        </h1>

        {/* Email */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            E-mailová adresa
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-secondary dark:text-white"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <SettingToggle
            label="Hardcore mód"
            description="Umožní používanie Hardcore módu. For the worthy."
            enabled={hardcoreMode}
            setEnabled={setHardcoreMode}
          />

          <SettingToggle
            label="Emailové upozornenia"
            description="Dostávaj upozornenia na dôležité správy."
            enabled={notifications}
            setEnabled={setNotifications}
          />

          <SettingToggle
            label="Automatické aktualizácie"
            description="Aplikácia sa bude aktualizovať automaticky."
            enabled={autoUpdates}
            setEnabled={setAutoUpdates}
          />
        </div>

        {/* Save button */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            className="bg-blue-50 dark:bg-blue-60 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Uložiť zmeny
          </button>
        </div>
      </div>
    </div>
  );
}


function SettingToggle({ label, description, enabled, setEnabled}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-grey-100">{description}</p>
      </div>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
      >
        <span
          className={`${
            enabled ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
        />
      </Switch>
    </div>
  );
}
