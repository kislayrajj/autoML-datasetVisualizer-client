import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const UploadForm = ({ onResult }) => {
  const [file, setFile] = useState(null);
  const [task, setTask] = useState("classification");
  const [algorithm, setAlgorithm] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const fileInputRef = useRef(null);

  const handleIconClick = () => fileInputRef.current.click();

  useEffect(() => {
    fetch("http://localhost:8000/models")
      .then((res) => res.json())
      .then((data) => {
        setAvailableModels(data[task]);
        setAlgorithm("");
      });
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a CSV file.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("task", task);
    if (algorithm) formData.append("algorithm", algorithm);

    try {
      const res = await axios.post("http://localhost:8000/train", formData);
      onResult(res.data);
    } catch (err) {
      console.error("Backend error:", err.response?.data || err.message);
      alert("Error processing the dataset.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row md:flex-wrap gap-4 items-start md:justify-between">
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".csv"
          required
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={handleIconClick}
          className={`${file ? "size-12":"h-12"} h-12 px-2 bg-black text-white rounded-md flex justify-center items-center gap-2 hover:bg-gray-700 transition`}
          title="Upload CSV"> { file? "" :"Upload File"}
          <i className="fa-solid fa-file-csv text-xl" />
        </button>
        <span className="text-sm">{file?.name || "No file chosen"}</span>
      </div>

      <select
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="bg-black text-white h-12 px-2 rounded-md w-full sm:w-48">
        <option value="classification">Classification</option>
        <option value="regression">Regression</option>
        <option value="clustering">Clustering</option>
      </select>

      <select
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value)}
        className="bg-black text-white h-12 px-2 rounded-md w-full sm:w-48">
        <option value="">Auto Select</option>
        {availableModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white h-12 px-4 rounded-md transition w-full sm:w-auto"
        title="Click to train the dataset">
        Train
      </button>
    </form>
  );
};

export default UploadForm;
