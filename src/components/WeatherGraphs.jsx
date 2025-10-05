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
    { value: 'T2M_MAX', label: 'Максимальная температура', unit: '°C', color: '#f97316' },
    { value: 'T2M_MIN', label: 'Минимальная температура', unit: '°C', color: '#3b82f6' },
    { value: 'T2M_AVG', label: 'Средняя температура', unit: '°C', color: '#10b981' },
    { value: 'PRECTOTCORR', label: 'Осадки', unit: 'мм', color: '#06b6d4' },
    { value: 'RH2M', label: 'Влажность', unit: '%', color: '#8b5cf6' },
    { value: 'WS2M', label: 'Скорость ветра', unit: 'м/с', color: '#6b7280' },
    { value: 'ALLSKY_SFC_UV_INDEX', label: 'УФ-индекс', unit: '', color: '#f59e0b' }
  ];

  const selectedOption = variableOptions.find(opt => opt.value === selectedVariable);

  const chartData = {
    labels: trendData.labels || [],
    datasets: [
      {
        label: selectedOption?.label || 'Данные',
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
        text: `Тренд ${selectedOption?.label || 'данных'} по годам`,
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
          text: 'Год',
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
          text: `${selectedOption?.label || 'Значение'} (${selectedOption?.unit || ''})`,
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Wix Madefor Display, sans-serif' }}>
              График трендов
            </h3>
            <p className="text-gray-600 text-sm">Исторические данные по годам</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Переменная:</label>
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

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {trendData.values ? Math.round(Math.min(...trendData.values) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-gray-600">Минимум</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {trendData.values ? Math.round(Math.max(...trendData.values) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-gray-600">Максимум</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {trendData.values ? Math.round(trendData.values.reduce((a, b) => a + b, 0) / trendData.values.length * 10) / 10 : 0}
          </div>
          <div className="text-sm text-gray-600">Среднее</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {trendData.values ? trendData.values.length : 0}
          </div>
          <div className="text-sm text-gray-600">Лет данных</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherGraphs;
