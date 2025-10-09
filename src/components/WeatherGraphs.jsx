import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AnimatedCard from './AnimatedCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeatherGraphs = ({ weatherData, trendData, selectedVariable, onVariableChange }) => {
  if (!weatherData || !trendData) {
    return null;
  }

  const variableOptions = [
    { value: 'T2M_MAX', label: 'Maximum Temperature', unit: '°C', color: '#f97316' },
    { value: 'T2M_MIN', label: 'Minimum Temperature', unit: '°C', color: '#3b82f6' },
    { value: 'T2M_AVG', label: 'Average Temperature', unit: '°C', color: '#10b981' },
    { value: 'PRECTOTCORR', label: 'Precipitation', unit: 'mm', color: '#06b6d4' },
    { value: 'RH2M', label: 'Humidity', unit: '%', color: '#8b5cf6' },
    { value: 'WS2M', label: 'Wind Speed', unit: 'm/s', color: '#6b7280' },
    { value: 'ALLSKY_SFC_UV_INDEX', label: 'UV Index', unit: '', color: '#f59e0b' }
  ];

  const selectedOption = variableOptions.find(opt => opt.value === selectedVariable);

  const chartData = {
    labels: trendData.labels || [],
    datasets: [
      {
        label: selectedOption?.label || 'Data',
        data: trendData.values || [],
        borderColor: selectedOption?.color || '#3b82f6',
        backgroundColor: `${selectedOption?.color || '#3b82f6'}20`,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `Trend of ${selectedOption?.label || 'data'} by years`,
        font: {
          size: 16,
          family: 'Wix Madefor Display, sans-serif'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}${selectedOption?.unit || ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          font: {
            family: 'Wix Madefor Display, sans-serif'
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      },
      y: {
        title: {
          display: true,
          text: `${selectedOption?.label || 'Value'} (${selectedOption?.unit || ''})`,
          font: {
            family: 'Wix Madefor Display, sans-serif'
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <AnimatedCard direction="scale" delay={200} duration={700}>
      <div className="nasa-card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Wix Madefor Display, sans-serif' }}>
                Trend Chart
              </h3>
              <p className="text-gray-600 text-sm">Historical data by years</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Variable:</label>
            <select
              value={selectedVariable}
              onChange={(e) => onVariableChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {variableOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className="h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 max-w-full overflow-hidden">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <AnimatedCard direction="bottom" delay={300} duration={500}>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {trendData.values ? Math.round(Math.min(...trendData.values) * 10) / 10 : 0}
              </div>
              <div className="text-sm text-gray-600">Minimum</div>
            </div>
          </AnimatedCard>
          <AnimatedCard direction="bottom" delay={400} duration={500}>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {trendData.values ? Math.round(Math.max(...trendData.values) * 10) / 10 : 0}
              </div>
              <div className="text-sm text-gray-600">Maximum</div>
            </div>
          </AnimatedCard>
          <AnimatedCard direction="bottom" delay={500} duration={500}>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {trendData.values ? Math.round(trendData.values.reduce((a, b) => a + b, 0) / trendData.values.length * 10) / 10 : 0}
              </div>
              <div className="text-sm text-gray-600">Average</div>
            </div>
          </AnimatedCard>
          <AnimatedCard direction="bottom" delay={600} duration={500}>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {trendData.values ? trendData.values.length : 0}
              </div>
              <div className="text-sm text-gray-600">Years of Data</div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default WeatherGraphs;
