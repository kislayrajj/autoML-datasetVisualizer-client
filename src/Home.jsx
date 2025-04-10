import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import MetricsDisplay from "./components/MetricsDisplay";
import ChartDisplay from "./components/ChartDisplay";

const Home = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-12 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent py-6 text-4xl sm:text-5xl font-bold">
            AutoML
          </h1>
          <p className="text-gray-300 italic">"Dataset Visualizer"</p>
        </div>

        <div className="w-full shadow-2xl p-4 sm:p-6 bg-gray-800 rounded-md">
          <UploadForm onResult={setResult} />
          {result && (
            <>
              <MetricsDisplay metrics={result.metrics} task={result.task} />
              <ChartDisplay result={result} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
