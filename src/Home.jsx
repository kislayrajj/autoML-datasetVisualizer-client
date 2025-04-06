import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import MetricsDisplay from "./components/MetricsDisplay";
import ChartDisplay from "./components/ChartDisplay";

const Home = () => {
  const [result, setResult] = useState(null);

  return (
    <div>
      <div className="text-2xl flex flex-col justify-center items-center gap-24">
        <div className="">
          
          <h1 className="bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent py-6 text-4xl font-bold text-center">AutoML</h1>
          <p className="text-gray-300 italic ">"Dataset Visualizer"</p>
        </div>
        <div>
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
