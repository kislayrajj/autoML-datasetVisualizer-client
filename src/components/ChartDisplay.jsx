import React from "react";
// Import necessary chart types from react-chartjs-2
import { Bar, Scatter, Line } from "react-chartjs-2";
// Import necessary components from chart.js
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement, // Keep registered even if no line charts currently used
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
// Optional: Import annotation plugin if you want to draw lines like y=0 on residuals
// import annotationPlugin from 'chartjs-plugin-annotation';

// Register necessary Chart.js components and plugins for use
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement, // Keep registered
  Tooltip,
  Legend,
  Title,
  Filler
  // annotationPlugin // Register annotation plugin if using it
);

// --- Helper Component for Confusion Matrix ---
// Renders a confusion matrix using an HTML table styled with Tailwind CSS.
// Expects 'matrix' (2D array) and optional 'labels' (array of strings) props.
const ConfusionMatrixDisplay = ({ matrix, labels }) => {
  // Basic validation for the matrix data prop
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
      console.error("Invalid confusion matrix data provided:", matrix);
      return <p className="text-red-400">Invalid Confusion Matrix data.</p>;
  }

  // Determine labels to display: use provided labels or generate defaults like "Class 0", "Class 1", etc.
  const defaultLabels = matrix.map((_, i) => `Class ${i}`);
  const displayLabels = labels && Array.isArray(labels) && labels.length === matrix.length ? labels : defaultLabels;

  return (
    // Container for the confusion matrix table
    <div className="mt-4 overflow-x-auto bg-gray-800 p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-3 text-white">Confusion Matrix</h3>
      {/* Table structure for the matrix */}
      <table className="min-w-full divide-y divide-gray-600 border border-gray-600 text-white">
        {/* Table header */}
        <thead className="bg-gray-700">
          <tr>
            {/* Corner header indicating axes meaning */}
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                <span className="block text-center">Predicted →</span>
                <span className="block text-center">Actual ↓</span>
            </th>
            {/* Column headers showing predicted class labels */}
            {displayLabels.map((label, i) => (
              <th key={`pred-${i}`} scope="col" className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">{label}</th>
            ))}
          </tr>
        </thead>
        {/* Table body containing matrix values */}
        <tbody className="divide-y divide-gray-600">
          {/* Iterate through each row of the matrix (Actual classes) */}
          {matrix.map((row, i) => (
            <tr key={`act-${i}`} className="hover:bg-gray-700/50">
              {/* Row header showing the actual class label */}
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">{displayLabels[i]}</td>
              {/* Iterate through each cell in the row (Predicted classes) */}
              {row.map((cell, j) => (
                <td
                  key={`cell-${i}-${j}`}
                  // Apply conditional styling: green background for correct predictions (diagonal), red for errors
                  className={`px-4 py-2 whitespace-nowrap text-sm text-center ${
                    i === j
                      ? 'bg-green-800 bg-opacity-60 font-semibold' // Correct prediction styling
                      : 'bg-red-800 bg-opacity-40' // Incorrect prediction styling
                  }`}
                >
                  {/* Display the count from the matrix cell */}
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// --- Main Chart Display Component ---
// Renders appropriate charts and metrics based on the ML task results.
// It expects a 'result' prop from the parent component, which should contain:
// - task: string ('classification', 'regression', 'clustering')
// - algorithm: string (name of the algorithm used)
// - metrics: object (containing relevant scores like accuracy, r2_score, silhouette_score)
// - plot_data: object (containing data needed for plots like y_test, predictions, pca, labels, confusion_matrix)
const ChartDisplay = ({ result }) => {
  // Log the received result prop for debugging purposes. Helps verify data structure.
  console.log("DEBUG: Received result in ChartDisplay:", JSON.stringify(result, null, 2));

  // Initial check: Render a waiting message if no result or task is provided yet.
  if (!result || !result.task) {
    return (
        <div className="mt-6 p-4 bg-gray-700 rounded text-gray-300 text-center shadow">
            Waiting for analysis results...
        </div>
    );
  }

  // Destructure data from the result prop. Use default empty objects {} to prevent errors if keys are missing.
  const { task, algorithm, metrics = {}, plot_data = {} } = result;
  // Destructure specific data needed for plots from the 'plot_data' object
  const {
    // Common data (might be null depending on task)
    y_test,         // Actual target values (regression, classification)
    predictions,    // Model's predicted values (regression, classification)
    // Clustering specific
    pca,            // PCA coordinates for visualization
    labels,         // Cluster labels assigned to data points
    // Regression specific
    residuals,      // Difference between actual and predicted (y_test - predictions)
    // Classification specific
    // roc_curve,      // ROC data REMOVED
    // pr_curve,       // PR data REMOVED
    class_labels,   // Optional: Names for classes (e.g., ['Setosa', 'Versicolor'])
    confusion_matrix // The confusion matrix [[TN, FP], [FN, TP]] - can be in metrics or plot_data
  } = plot_data;

  // --- Base Chart Options ---
  // Defines common configuration options applied to all charts for consistency.
  // Takes chart title, x-axis label, and y-axis label as arguments.
  const baseChartOptions = (titleText = "Chart", xAxisLabel = "X", yAxisLabel = "Y") => ({
    responsive: true,           // Chart adjusts to container size
    maintainAspectRatio: false, // Important: Allows setting height independent of width in CSS
    plugins: {
      // Legend configuration (labels above the chart)
      legend: {
        display: true,
        position: "top",
        labels: {
            color: "white", // Text color for legend items
            font: { size: 12 },
            boxWidth: 20,   // Width of the colored box next to the label
            padding: 15     // Padding around legend items
        },
      },
      // Tooltip configuration (popup on hover)
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.85)", // Background color of the tooltip
        titleColor: "white",                  // Text color for the tooltip title
        bodyColor: "white",                   // Text color for the tooltip body
        padding: 10,                          // Padding inside the tooltip box
        cornerRadius: 4,                      // Rounded corners for the tooltip box
        callbacks: {
          // Custom function to format the label text inside the tooltip
          label: (context) => {
            let label = context.dataset.label || ""; // Get the dataset label (e.g., "Actual vs Predicted")
            if (label) label += ": ";
            // Format the value based on chart type and available data
            if (context.parsed?.y !== undefined) {
                 label += `${context.parsed.y.toFixed(3)}`; // Display Y value (formatted)
            }
            // Special formatting for scatter plots to show (X, Y) coordinates
            if (context.parsed?.x !== undefined && context.chart.config.type === 'scatter') {
                 label = `${context.dataset.label}: (${context.parsed.x.toFixed(3)}, ${context.parsed.y.toFixed(3)})`;
            }
            // Line chart tooltip logic removed as no line charts are currently displayed
            return label;
          },
        },
      },
      // Chart title configuration
      title: {
        display: true,
        text: titleText, // The main title text for the chart
        color: "white",
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 } // Padding above and below the title
      },
    },
    // Scale (axis) configuration
    scales: {
      // X-axis configuration
      x: {
        title: { display: true, text: xAxisLabel, color: "white", font: { size: 14 } }, // Axis label
        ticks: { color: "white", maxTicksLimit: 10, autoSkip: true }, // Axis ticks (value labels)
        grid: { color: "rgba(255, 255, 255, 0.15)" }, // Grid line color
        border: { color: "rgba(255, 255, 255, 0.3)"}  // Axis line color
      },
      // Y-axis configuration
      y: {
        title: { display: true, text: yAxisLabel, color: "white", font: { size: 14 } }, // Axis label
        ticks: { color: "white" }, // Axis ticks
        grid: { color: "rgba(255, 255, 255, 0.15)" }, // Grid line color
         border: { color: "rgba(255, 255, 255, 0.3)"} // Axis line color
      },
    },
  });

  // --- Task-Specific Rendering Logic ---
  // Render different charts and metrics based on the 'task' value from the result prop.

  // === CLUSTERING TASK ===
  if (task === "clustering") {
      // Validate required data for clustering visualization (PCA coordinates and labels)
      if (!pca || !labels || !Array.isArray(pca) || !Array.isArray(labels) || pca.length !== labels.length) {
          // Show error message if data is missing or mismatched
          return <div className="mt-6 text-yellow-400 p-4 bg-gray-700 rounded shadow">Clustering results received, but missing or mismatched PCA data or labels for visualization.</div>;
      }

      // Prepare data structure for the PCA Scatter plot
      const uniqueLabels = [...new Set(labels)].sort((a, b) => a - b); // Get unique cluster labels, sorted numerically
      // Define a list of colors for different clusters
      const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#66BB6A", "#BA68C8", "#FF9F40", "#4BC0C0", "#9966FF", "#C9CBCF"];
      const scatterData = {
          // Create one dataset per unique cluster label
          datasets: uniqueLabels.map((label, index) => ({
              label: `Cluster ${label}`, // Label for the legend
              // Filter PCA data points belonging to the current cluster
              // Map points to {x, y} objects required by Chart.js scatter plot
              data: pca.filter((_, i) => labels[i] === label).map(point => ({ x: point[0], y: point[1] })),
              backgroundColor: colors[index % colors.length] + '99', // Assign color with transparency, cycle through colors
              borderColor: colors[index % colors.length], // Border color for points
              pointRadius: 5, // Size of the points
              pointHoverRadius: 7 // Size of points on hover
          })),
      };

      // Configure options specific to the PCA scatter plot
      const scatterOptions = baseChartOptions("Cluster Visualization (PCA)", "Principal Component 1", "Principal Component 2");
      scatterOptions.scales.x.grid.display = false; // Hide grid lines for a cleaner scatter plot look
      scatterOptions.scales.y.grid.display = false;

      // Return the JSX for the clustering results section
      return (
          <div className="mt-6 w-full space-y-6 p-4 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-3 text-white text-center">Clustering Results ({algorithm || 'N/A'})</h2>
              {/* Display the average Silhouette Score if available in metrics */}
              {metrics.silhouette_score !== undefined && (
                  <div className="text-center mb-4">
                      <p className="text-lg text-gray-300 inline-block bg-gray-700 px-4 py-2 rounded">
                          Average Silhouette Score: <span className="font-bold text-white">{metrics.silhouette_score.toFixed(3)}</span>
                      </p>
                  </div>
              )}
              {/* Container for the scatter plot */}
              <div className="w-full h-[400px] sm:h-[500px] md:h-[600px]">
                  <div className="relative w-full h-full p-4 bg-gray-800 rounded shadow">
                      {/* Render the Scatter chart component */}
                      <Scatter data={scatterData} options={scatterOptions} />
                  </div>
              </div>
          </div>
      );
  }

  // === REGRESSION TASK ===
  if (task === "regression") {
      // Validate required data for regression plots (predictions and actual values)
      if (!predictions || !y_test || !Array.isArray(predictions) || !Array.isArray(y_test) || predictions.length !== y_test.length) {
          // Show error message if data is missing or mismatched
          return <div className="mt-6 text-yellow-400 p-4 bg-gray-700 rounded shadow">Regression results received, but missing or mismatched 'predictions' or 'y_test' data.</div>;
      }

      // 1. Prepare data for Actual vs. Predicted Scatter Plot
      const actualVsPredictedData = {
          datasets: [
              // Dataset for the actual vs predicted points
              {
                  label: "Actual vs Predicted",
                  // Map actual (x-axis) and predicted (y-axis) values to {x, y} objects
                  data: y_test.map((actual, i) => ({ x: actual, y: predictions[i] })),
                  backgroundColor: "rgba(54, 162, 235, 0.6)", // Point color
                  borderColor: "rgba(54, 162, 235, 1)",      // Point border color
                  pointRadius: 4,                             // Point size
                  pointHoverRadius: 6                         // Point size on hover
              },
              // Optional: Dataset for the ideal y=x reference line
              {
                  label: 'Ideal (y=x)',
                  // Define start and end points based on the min/max range of data
                  data: [
                      { x: Math.min(...y_test, ...predictions), y: Math.min(...y_test, ...predictions) },
                      { x: Math.max(...y_test, ...predictions), y: Math.max(...y_test, ...predictions) }
                  ],
                  borderColor: 'rgba(255, 99, 132, 0.8)', // Line color
                  borderWidth: 2,                         // Line thickness
                  borderDash: [5, 5],                     // Make the line dashed
                  pointRadius: 0,                         // No points on the reference line
                  type: 'line',                           // Specify this dataset should be drawn as a line
                  fill: false,                            // Don't fill area under the line
                  showLine: true,                         // Explicitly show the line
              },
          ],
      };
      // Get base options and set specific titles for this chart
      const actualVsPredictedOptions = baseChartOptions("Regression: Actual vs. Predicted", "Actual Values", "Predicted Values");

      // 2. Prepare data for Residual Plot (Residuals vs. Predicted Values)
      let residualData = null;
      let residualOptions = null;
      // Check if residuals data is available and valid
      if (residuals && Array.isArray(residuals) && residuals.length === predictions.length) {
          residualData = {
              datasets: [{
                  label: "Residuals",
                  // Map predicted values (x-axis) and residuals (y-axis)
                  data: predictions.map((pred, i) => ({ x: pred, y: residuals[i] })),
                  backgroundColor: "rgba(255, 159, 64, 0.6)", // Point color
                  borderColor: "rgba(255, 159, 64, 1)",      // Point border color
                  pointRadius: 4,                             // Point size
                  pointHoverRadius: 6                         // Point size on hover
              }],
          };
          // Get base options and set specific titles for the residual plot
          residualOptions = baseChartOptions("Residual Plot", "Predicted Values", "Residuals (Actual - Predicted)");
      }

      // Return the JSX for the regression results section
      return (
          <div className="mt-6 w-full space-y-6 p-4 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-white text-center">Regression Results ({algorithm || 'N/A'})</h2>
              {/* Display key regression metrics if available */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-4">
                  {metrics.r2_score !== undefined && <p className="text-md lg:text-lg text-gray-300 p-3 bg-gray-700 rounded shadow">R² Score: <span className="font-bold text-white">{metrics.r2_score.toFixed(3)}</span></p>}
                  {metrics.mae !== undefined && <p className="text-md lg:text-lg text-gray-300 p-3 bg-gray-700 rounded shadow">MAE: <span className="font-bold text-white">{metrics.mae.toFixed(3)}</span></p>}
                  {metrics.mse !== undefined && <p className="text-md lg:text-lg text-gray-300 p-3 bg-gray-700 rounded shadow">MSE: <span className="font-bold text-white">{metrics.mse.toFixed(3)}</span></p>}
                  {/* Can add RMSE derived from MSE: Math.sqrt(metrics.mse).toFixed(3) */}
              </div>
              {/* Container for the regression charts, arranged in a grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Actual vs Predicted Plot */}
                  <div className="w-full h-[350px] sm:h-[450px]">
                      <div className="relative w-full h-full p-4 bg-gray-800 rounded shadow">
                          <Scatter data={actualVsPredictedData} options={actualVsPredictedOptions} />
                      </div>
                  </div>
                  {/* Residual Plot (only render if residualData was successfully created) */}
                  {residualData && (
                      <div className="w-full h-[350px] sm:h-[450px]">
                          <div className="relative w-full h-full p-4 bg-gray-800 rounded shadow">
                              <Scatter data={residualData} options={residualOptions} />
                          </div>
                      </div>
                  )}
              </div>
              {/* Placeholder for potential future Feature Importance chart */}
              {/* {plot_data.feature_importances && <div className="mt-6">Feature Importance Chart...</div>} */}
          </div>
      );
  }

  // === CLASSIFICATION TASK ===
  if (task === "classification") {
      // Validate required data for classification (predictions and actual values)
       if (!predictions || !y_test || !Array.isArray(predictions) || !Array.isArray(y_test) || predictions.length !== y_test.length) {
          // Show error message if data is missing or mismatched
          return <div className="mt-6 text-yellow-400 p-4 bg-gray-700 rounded shadow">Classification results received, but missing or mismatched 'predictions' or 'y_test' data.</div>;
      }

      // --- Prepare data for remaining classification plots ---

      // 1. ROC Curve Data & Options - REMOVED

      // 2. Precision-Recall Curve Data & Options - REMOVED

      // 3. Prepare data for Class Distribution Bar Chart
      const classCountsActual = {}; // Counts for actual classes in y_test
      y_test.forEach((c) => (classCountsActual[c] = (classCountsActual[c] || 0) + 1));
      const classCountsPredicted = {}; // Counts for predicted classes
      predictions.forEach((c) => (classCountsPredicted[c] = (classCountsPredicted[c] || 0) + 1));
      // Ensure all unique classes from both actual and predicted sets are included and sorted
      const uniqueClasses = [...new Set([...Object.keys(classCountsActual), ...Object.keys(classCountsPredicted)])].sort();
      const classDistData = {
          // Use provided class_labels if available and matching, otherwise use the unique class keys
          labels: class_labels && class_labels.length === uniqueClasses.length ? class_labels : uniqueClasses,
          datasets: [
              // Dataset for actual class distribution
              {
                  label: "Actual Distribution",
                  // Map counts for each unique class, defaulting to 0 if a class is missing in actual data
                  data: uniqueClasses.map(c => classCountsActual[c] || 0),
                  backgroundColor: "rgba(255, 99, 132, 0.7)", // Bar color
                  borderColor: "rgba(255, 99, 132, 1)",      // Bar border color
                  borderWidth: 1,                             // Bar border width
              },
              // Dataset for predicted class distribution
              {
                  label: "Predicted Distribution",
                  // Map counts for each unique class, defaulting to 0 if a class is missing in predictions
                  data: uniqueClasses.map(c => classCountsPredicted[c] || 0),
                  backgroundColor: "rgba(54, 162, 235, 0.7)",  // Bar color
                  borderColor: "rgba(54, 162, 235, 1)",       // Bar border color
                  borderWidth: 1,                              // Bar border width
              },
          ],
      };
      // Get base options and set specific titles for the bar chart
      const classDistOptions = baseChartOptions("Class Distribution (Actual vs. Predicted)", "Class Label", "Count");

      // Return the JSX for the classification results section
      return (
          <div className="mt-6 w-full space-y-6 p-4 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-white text-center">Classification Results ({algorithm || 'N/A'})</h2>

              {/* Display key classification metrics if available */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
                  {metrics.accuracy !== undefined && <p className="text-md lg:text-lg text-gray-300 p-3 bg-gray-700 rounded shadow">Accuracy: <span className="font-bold text-white">{metrics.accuracy.toFixed(3)}</span></p>}
                  {metrics.precision !== undefined && <p className="text-md lg:text-lg text-gray-300 p-3 bg-gray-700 rounded shadow">Precision: <span className="font-bold text-white">{metrics.precision.toFixed(3)}</span></p>}
                  {metrics.recall !== undefined && <p className="text-md lg:text-lg text-gray-300 p-3 bg-gray-700 rounded shadow">Recall: <span className="font-bold text-white">{metrics.recall.toFixed(3)}</span></p>}
                  {metrics.f1_score !== undefined && <p className="text-md lg:text-lg text-gray-300 p-3 bg-gray-700 rounded shadow">F1-Score: <span className="font-bold text-white">{metrics.f1_score.toFixed(3)}</span></p>}
                  {/* AUC Display REMOVED */}
              </div>

              {/* Display the Confusion Matrix using the helper component */}
              {/* Check if confusion_matrix exists in plot_data OR metrics */}
              {(plot_data.confusion_matrix || metrics.confusion_matrix) &&
                 <ConfusionMatrixDisplay matrix={plot_data.confusion_matrix || metrics.confusion_matrix} labels={class_labels} />
              }

              {/* Container for the remaining classification charts */}
              <div className="mt-6">
                  {/* ROC Curve - REMOVED */}
                  {/* Precision-Recall Curve - REMOVED */}

                  {/* Class Distribution Bar Chart */}
                  <div className="w-full h-[350px] sm:h-[450px]">
                      <div className="relative w-full h-full p-4 bg-gray-800 rounded shadow">
                          <Bar data={classDistData} options={classDistOptions} />
                      </div>
                  </div>
              </div>
          </div>
      );
  }


  // --- Fallback ---
  // This message is shown if the task type is not recognized or if essential data is missing.
  console.warn(`ChartDisplay: Unhandled task type '${task}' or missing essential data for this task. Result object:`, result);
  return (
    <div className="mt-6 text-red-400 p-4 bg-gray-700 rounded shadow text-center">
        Cannot display charts. The task type '<span className="font-semibold">{task}</span>' is either not recognized or the required data (like predictions, y_test, pca, labels) is missing in the response from the backend. Please check the console logs and the backend API response.
    </div>
  );
};

// Export the component for use in other parts of the application
export default ChartDisplay;
