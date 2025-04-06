import React, { useEffect, useState } from "react";
import axios from "axios";

const UploadForm =  ({ onResult }) => {
  const [file, setFile] = useState(null);
  const [task, setTask] = useState("classification");
  const [algorithm, setAlgorithm] = useState("");
  const [availableModels, setAvailableModels] = useState([])

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
        const res = await axios.post('http://localhost:8000/train', formData);
        onResult(res.data);
      } catch (err) {
        console.error('Backend error:', err.response?.data || err.message);
        alert("Error processing the dataset.");
      }
      
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          name="file"
          id="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <select value={task} onChange={(e) => setTask(e.target.value)}>
          <option value="classification">Classification</option>
          <option value="regression">Regression</option>
          <option value="clustering">Clustering</option>
        </select>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="">Auto Select</option>
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        {/* <input
          type="text"
          placeholder="Optional: Algorithm (e.g. decision_tree)"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        /> */}
        <button className="border p-1 px-4" type="submit">Train</button>
      </form>
    </div>
  );
};

export default UploadForm;
