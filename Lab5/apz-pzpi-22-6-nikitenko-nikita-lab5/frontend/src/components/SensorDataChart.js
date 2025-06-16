import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function SensorDataChart({ disasterId }) {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!disasterId) {
        setChartData(null); // Reset on new selection
        setError('Select a disaster to view sensor data.'); // Provide a message
        setIsLoading(false);
        return;
    }
    
    setChartData(null); // Reset on new selection before fetching new data
    setError('');
    setIsLoading(true);

    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/api/sensors/disaster/${disasterId}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(response => {
        const data = response.data;
        if (data && data.length > 0) {
          // Визначаємо унікальні типи даних для відображення
          const dataTypes = [...new Set(data.map(d => d.type))];
          const datasets = dataTypes.map(type => {
            const filteredData = data.filter(d => d.type === type);
            // Використовуємо перший елемент для отримання одиниці виміру
            const unit = filteredData[0]?.unit || '';
            let borderColor;
            // Вибір кольору в залежності від типу даних
            switch (type) {
                case 'temperature': borderColor = '#F85149'; break; // Accent Red
                case 'pressure': borderColor = '#58A6FF'; break;    // Accent Blue
                case 'humidity': borderColor = '#3FB950'; break;    // Accent Green
                case 'wind_speed': borderColor = '#DAA520'; break;  // Accent Yellow
                default: borderColor = '#E6EDF3'; // Text Primary
            }

            return {
              label: `${type.charAt(0).toUpperCase() + type.slice(1)} (${unit})`, // Capitalize type and add unit
              data: filteredData.map(d => d.value),
              borderColor: borderColor,
              backgroundColor: `${borderColor}40`, // Додаємо прозорість до фонового кольору
              tension: 0.1,
              fill: true, // Заповнити область під лінією
            };
          });

          setChartData({
            labels: data.map(d => new Date(d.createdAt).toLocaleTimeString()),
            datasets: datasets,
          });
        } else {
          setChartData(null);
          setError('No sensor data available for this disaster.');
        }
      })
      .catch(err => {
        console.error('Error fetching sensor data:', err);
        setError('Failed to load sensor data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [disasterId]);

  const options = {
      responsive: true,
      maintainAspectRatio: false, // Дозволяє керувати висотою через CSS
      plugins: {
          legend: {
              position: 'top',
              labels: {
                  color: 'var(--text-primary)' // Колір тексту легенди
              }
          },
          title: {
              display: true,
              text: chartData ? (chartData.datasets.length > 0 ? `Sensor Data for ${chartData.datasets[0].label.split(' ')[0]}` : 'Sensor Data Analysis') : 'Sensor Data Analysis',
              color: 'var(--text-primary)'
          },
          tooltip: {
              callbacks: {
                  label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                          label += ': ';
                      }
                      if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                      }
                      return label;
                  }
              }
          }
      },
      scales: {
          y: {
              ticks: { color: 'var(--text-primary)' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              title: {
                  display: true,
                  text: chartData?.datasets[0]?.label.split(' ')[0] || 'Value', // Dynamic Y-axis title
                  color: 'var(--text-primary)'
              }
          },
          x: {
              ticks: { color: 'var(--text-primary)' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
      }
  };

  return (
    <div className="sensor-data-chart-container">
      <h4>Sensor Data Analysis</h4>
      {isLoading && <p className="loading-message">Loading sensor data...</p>}
      {error && <p className="error-message">{error}</p>}
      {chartData && !isLoading && !error ? (
          <div style={{ height: '250px' }}> {/* Fixed height for chart */}
            <Line data={chartData} options={options} />
          </div>
      ) : (!isLoading && !error && <p className="no-data-message">No chart data to display.</p>)}
    </div>
  );
}

export default SensorDataChart;