import React from 'react';

const MetricsDisplay = ({ metrics, task }) => {
  if (!metrics) return null;

  return (
    <div className="mt-6 text-black">
      <h2 className="text-xl font-semibold mb-3 text-white">Evaluation Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="bg-gray-100 p-4 rounded shadow overflow-auto">
            <strong>{key.replace(/_/g, ' ').toUpperCase()}</strong>
            <div>{Array.isArray(value) ? 'Matrix below' : value.toFixed(4)}</div>
            {Array.isArray(value) && (
              <pre className="text-sm mt-2 bg-white p-2 rounded whitespace-pre-wrap">
                {value.map(row => row.join(', ')).join('\n')}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsDisplay;
