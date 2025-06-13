import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function SensorDataChart({ disasterId }) {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!disasterId) return;
    
    setChartData(null); // Reset on new selection
    setError('');

    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/api/sensors/disaster/${disasterId}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(response => {
        const data = response.data;
        if (data && data.length > 0) {
          setChartData({
            labels: data.map(d => new Date(d.createdAt).toLocaleTimeString()),
            datasets: [
              {
                label: `${data[0].type} (${data[0].unit})`,
                data: data.map(d => d.value),
                borderColor: '#e94560',
                backgroundColor: 'rgba(233, 69, 96, 0.2)',
                fill: true,
                tension: 0.3
              },
            ],
          });
        } else {
            setError('No detailed sensor data available for this event.');
        }
      })
      .catch(error => {
          console.error('Error fetching sensor data:', error)
          setError('Could not load sensor data.');
    });
  }, [disasterId]);

  const options = {
      plugins: {
          legend: { labels: { color: 'white' } }
      },
      scales: {
          y: { ticks: { color: 'white' } },
          x: { ticks: { color: 'white' } }
      }
  }

  if (error) return <p>{error}</p>;
  if (!chartData) return <p>Loading sensor data...</p>;

  return <Line data={chartData} options={options} />;
}

export default SensorDataChart;