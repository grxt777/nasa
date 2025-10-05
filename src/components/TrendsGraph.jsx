import React, { useState } from 'react';
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
  Filler
} from 'chart.js';
import { TrendingUp, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendsGraph = ({ trendData, selectedCity }) => {
  const [selectedVariable, setSelectedVariable] = useState('T2M_MAX');

  if (!trendData || !trendData.labels || trendData.labels.length === 0) {
    return null;
  }

  const variableOptions = [
    { value: 'T2M_MAX', label: 'Максимальная температура', color: '#ef4444' },
    { value: 'T2M_MIN', label: 'Минимальная температура', color: '#3b82f6' },
    { value: 'T2M_AVG', label: 'Средняя температура', color: '#f59e0b' },
    { value: 'RH2M', label: 'Влажность', color: '#06b6d4' },
    { value: 'WS2M', label: 'Скорость ветра', color: '#8b5cf6' },
    { value: 'PRECTOTCORR', label: 'Осадки', color: '#10b981' }
  ];

  const selectedOption = variableOptions.find(opt => opt.value === selectedVariable);

  const chartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: selectedOption?.label || 'Данные',
        data: trendData.values,
        borderColor: selectedOption?.color || '#3b82f6',
        backgroundColor: `${selectedOption?.color || '#3b82f6'}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: selectedOption?.color || '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: selectedOption?.color || '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const unit = selectedVariable.includes('T2M') ? '°C' : 
                        selectedVariable === 'RH2M' ? '%' :
                        selectedVariable === 'WS2M' ? ' м/с' :
                        selectedVariable === 'PRECTOTCORR' ? ' мм' : '';
            return `${selectedOption?.label || 'Значение'}: ${value.toFixed(1)}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          },
          callback: function(value) {
            const unit = selectedVariable.includes('T2M') ? '°C' : 
                        selectedVariable === 'RH2M' ? '%' :
                        selectedVariable === 'WS2M' ? ' м/с' :
                        selectedVariable === 'PRECTOTCORR' ? ' мм' : '';
            return value.toFixed(1) + unit;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Calculate trend line
  const calculateTrend = (data) => {
    if (data.length < 2) return null;
    
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };

  const trend = calculateTrend(trendData.values);
  const trendLine = trend ? trendData.values.map((_, i) => trend.slope * i + trend.intercept) : null;

  const chartDataWithTrend = {
    ...chartData,
    datasets: [
      ...chartData.datasets,
      ...(trendLine ? [{
        label: 'Линия тренда',
        data: trendLine,
        borderColor: '#6b7280',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0
      }] : [])
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Тренды по годам</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <select
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {variableOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-64 mb-4">
        <Line data={chartDataWithTrend} options={options} />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">Период</div>
          <div className="font-semibold text-gray-900">
            {trendData.labels[0]} - {trendData.labels[trendData.labels.length - 1]}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Среднее</div>
          <div className="font-semibold text-gray-900">
            {trendData.values.length > 0 ? 
              (trendData.values.reduce((a, b) => a + b, 0) / trendData.values.length).toFixed(1) : 
              '0'
            }
            {selectedVariable.includes('T2M') ? '°C' : 
             selectedVariable === 'RH2M' ? '%' :
             selectedVariable === 'WS2M' ? ' м/с' :
             selectedVariable === 'PRECTOTCORR' ? ' мм' : ''}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Тренд</div>
          <div className={`font-semibold ${trend && trend.slope > 0 ? 'text-red-600' : trend && trend.slope < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
            {trend ? (trend.slope > 0 ? '↗ Рост' : trend.slope < 0 ? '↘ Снижение' : '→ Стабильно') : '—'}
          </div>
        </div>
      </div>

      {selectedCity && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Анализ для {selectedCity.name}:</strong> Данные показывают изменения климатических показателей 
            за {trendData.labels.length} лет. {trend && trend.slope > 0 ? 'Наблюдается тенденция к росту.' : 
            trend && trend.slope < 0 ? 'Наблюдается тенденция к снижению.' : 'Показатели остаются стабильными.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendsGraph;