import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import AnimatedCard from './AnimatedCard';
import dustMassService from '../services/dustMassService';
import geminiService from '../services/geminiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DustStormRiskCard = ({ selectedCity, selectedDate }) => {
  const [dustData, setDustData] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [hasData, setHasData] = useState(false);

  // Load dust mass data
  useEffect(() => {
    if (selectedCity && selectedDate) {
      loadDustData();
    }
  }, [selectedCity, selectedDate]);

  const loadDustData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🌪️ Загрузка данных dust mass для:', selectedCity.name, selectedDate);
      const data = await dustMassService.getDustMassData(selectedCity.name, selectedDate);
      
      if (data && data.length > 0) {
        setDustData(data);
        const risk = dustMassService.calculateRiskLevel(data);
        setRiskLevel(risk);
        setHasData(true);
        console.log('📊 Dust storm risk calculated:', risk);
        
        // Load AI analysis
        loadAIAnalysis(data, risk);
      } else {
        setError('No dust mass data available for the selected date. Dust mass data is available for 1999-2025 period.');
        setDustData(null);
        setRiskLevel(null);
        setHasData(false);
      }
    } catch (err) {
      console.error('Error loading dust data:', err);
      setError(`Error loading dust data: ${err.message}`);
      setDustData(null);
      setRiskLevel(null);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIAnalysis = async (dustData, risk) => {
    setIsLoadingAI(true);
    setAiError('');
    
    try {
      let apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) apiKey = geminiService.apiKey;
      if (!apiKey) {
        setAiError('Gemini API key not configured');
        setIsLoadingAI(false);
        return;
      }
      geminiService.setApiKey(apiKey);

      const maxValue = risk.maxValue;
      const avgValue = risk.avgValue;
      const riskLevel = risk.level;
      const expectedStart = risk.expectedStart;

      const aiAnalysis = await geminiService.generateDustStormAnalysis({
        city: selectedCity.name,
        date: selectedDate,
        maxDustMass: maxValue,
        avgDustMass: avgValue,
        riskLevel: riskLevel,
        expectedStart: expectedStart,
        dustData: dustData
      });

      setAiAnalysis(aiAnalysis);
    } catch (error) {
      console.error('Error loading AI analysis:', error);
      setAiError(`Error loading AI analysis: ${error.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const formatAIText = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n').filter(line => line.trim());
    const formattedElements = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) return;
      
      if (trimmedLine.startsWith('## ')) {
        formattedElements.push(
          <div key={index} className="mt-4 mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              {trimmedLine.replace('## ', '')}
            </h3>
          </div>
        );
      }
      else if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
        formattedElements.push(
          <div key={index} className="mb-2">
            <div className="text-gray-800">
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={partIndex} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </div>
          </div>
        );
      }
      else if (trimmedLine.startsWith('- ')) {
        formattedElements.push(
          <div key={index} className="flex items-start gap-3 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-gray-800">
              {trimmedLine.replace('- ', '')}
            </div>
          </div>
        );
      }
      else {
        formattedElements.push(
          <div key={index} className="mb-2">
            <div className="text-gray-800">
              {trimmedLine}
            </div>
          </div>
        );
      }
    });
    
    return formattedElements;
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Moderate':
        return <Wind className="w-5 h-5 text-yellow-500" />;
      case 'Low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Wind className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Chart configuration - показываем средние значения по часам за все годы
  const chartData = riskLevel?.hourlyStats ? {
    labels: riskLevel.hourlyStats.map(h => h.time),
    datasets: [
      {
        label: 'Average Dust Mass (kg/m²)',
        data: riskLevel.hourlyStats.map(h => h.avg),
        borderColor: riskLevel?.color === 'red' ? '#ef4444' : 
                    riskLevel?.color === 'yellow' ? '#f59e0b' : '#10b981',
        backgroundColor: riskLevel?.color === 'red' ? 'rgba(239, 68, 68, 0.1)' : 
                        riskLevel?.color === 'yellow' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Max Dust Mass (kg/m²)',
        data: riskLevel.hourlyStats.map(h => h.max),
        borderColor: riskLevel?.color === 'red' ? '#dc2626' : 
                    riskLevel?.color === 'yellow' ? '#d97706' : '#059669',
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
      }
    ]
  } : null;

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
        text: `Historical Dust Mass Trend - ${selectedDate} (${riskLevel?.yearsCount || 0} years)`,
        font: {
          size: 16,
          family: 'Wix Madefor Display, sans-serif'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toExponential(2)} kg/m²`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (UTC)',
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
          text: 'Dust Mass (kg/m²)',
          font: {
            family: 'Wix Madefor Display, sans-serif'
          }
        },
        grid: {
          color: '#f3f4f6'
        },
        type: 'logarithmic'
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Don't render the card if there's no data
  // Временно отключено для отладки
  // if (!hasData && !isLoading) {
  //   return null;
  // }

  return (
    <AnimatedCard direction="scale" delay={300} duration={700}>
      <div className="nasa-card mb-4 sm:mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-xl bg-orange-50">
            <Wind className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dust Storm Risk</h2>
            <p className="text-sm text-gray-500">Historical analysis for {selectedDate} (1999-2025)</p>
          </div>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
          <div><strong>Debug Info:</strong></div>
          <div>City: {selectedCity?.name || 'N/A'}</div>
          <div>Date: {selectedDate || 'N/A'}</div>
          <div>HasData: {hasData ? 'true' : 'false'}</div>
          <div>IsLoading: {isLoading ? 'true' : 'false'}</div>
          <div>Error: {error || 'none'}</div>
          <div>DustData: {dustData ? `${dustData.length} records` : 'null'}</div>
          <div>RiskLevel: {riskLevel ? riskLevel.level : 'null'}</div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-orange-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading dust mass data...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 font-medium">{error}</div>
        ) : dustData && riskLevel ? (
          <div className="space-y-6">
            
            {/* Risk Level Indicator */}
            <div className={`p-4 rounded-lg border ${getRiskColor(riskLevel.level)}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="animate-pulse">
                  {getRiskIcon(riskLevel.level)}
                </div>
                <div>
                  <h3 className="text-lg font-bold animate-fade-in">Risk Level: {riskLevel.level}</h3>
                  <p className="text-sm opacity-80 animate-fade-in-delay">{riskLevel.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="text-gray-600">Max Dust Mass</div>
                  <div className="font-semibold transition-all duration-300 hover:text-orange-600">{riskLevel.maxValue.toExponential(2)} kg/m²</div>
                  <div className="text-xs text-gray-500">All years</div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="text-gray-600">Average Dust Mass</div>
                  <div className="font-semibold transition-all duration-300 hover:text-orange-600">{riskLevel.avgValue.toExponential(2)} kg/m²</div>
                  <div className="text-xs text-gray-500">All years</div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="text-gray-600">Data Years</div>
                  <div className="font-semibold transition-all duration-300 hover:text-orange-600">{riskLevel.yearsCount} years</div>
                  <div className="text-xs text-gray-500">{riskLevel.years?.join(', ')}</div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <div className="text-gray-600">Peak Hour</div>
                  <div className="font-semibold flex items-center gap-1 transition-all duration-300 hover:text-orange-600">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                    {riskLevel.expectedStart}
                  </div>
                  <div className="text-xs text-gray-500">Avg peak time</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 rounded-lg p-4 shadow-lg transition-all duration-500 hover:shadow-xl animate-fade-in-delay">
              <div className="h-64 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
            </div>

            {/* AI Analysis */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Dust Storm Analysis</h3>
              {isLoadingAI ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating AI analysis...</span>
                </div>
              ) : aiError ? (
                <div className="text-sm text-red-600">{aiError}</div>
              ) : aiAnalysis ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm text-gray-800 leading-relaxed">
                    {formatAIText(aiAnalysis)}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">AI analysis will appear here after data analysis...</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AnimatedCard>
  );
};

export default DustStormRiskCard;
