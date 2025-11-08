import { useState } from "react";
import { FiUpload } from "react-icons/fi";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-10 to-gray-50 dark:from-blue-85 dark:to-dark-secondary p-8">
      <div className="bg-white dark:bg-dark-primary rounded-2xl shadow-lg w-full max-w-4xl p-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-10">
          Upload receipt
        </h1>

        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FiUpload className="text-5xl text-blue-500 mb-4" />
            <span className="text-gray-700 dark:text-gray-300">
              {file ? (
                <span className="font-semibold text-blue-600">{file.name}</span>
              ) : (
                "Drag & drop your receipt here or click to upload"
              )}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
