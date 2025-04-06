import React from 'react';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, Tooltip);

const ChartDisplay = ({ result }) => {
  const { task, labels, pca, y_test, predictions } = result;

  if (task === 'clustering' && pca && labels) {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#BA68C8'];
    const scatterData = {
      datasets: labels.map((_, i) => ({
        label: `Cluster ${labels[i]}`,
        data: [pca[i]],
        backgroundColor: colors[labels[i] % colors.length],
      })),
    };

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Cluster Visualization (PCA)</h2>
        <Scatter data={scatterData} />
      </div>
    );
  }

  if (task === 'regression' && predictions && y_test) {
    const barData = {
      labels: predictions.map((_, i) => `#${i}`),
      datasets: [
        {
          label: 'Actual',
          data: y_test,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
        {
          label: 'Predicted',
          data: predictions,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Regression: Actual vs Predicted</h2>
        <Bar data={barData} />
      </div>
    );
  }

  return null;
};

export default ChartDisplay;
