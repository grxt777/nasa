import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Thermometer, 
  Droplets, 
  Calendar,
  Loader2,
  BarChart3,
  Activity,
  Download,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import geminiService from '../services/geminiService';
import nasaDataService from '../services/nasaDataService';

const ClimateHistoryDashboard = ({ weatherData, selectedCity, selectedDate }) => {
  const [aiInsights, setAiInsights] = useState('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [climateData, setClimateData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  
  // Performance optimization states
  const [visibleCharts, setVisibleCharts] = useState(new Set(['temperature']));
  const [devicePerformance, setDevicePerformance] = useState('high');
  const [animationFrameRate, setAnimationFrameRate] = useState(60);
  const [isMobile, setIsMobile] = useState(false);
  
  // Export and audit trail states
  const [auditLog, setAuditLog] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Refs for performance monitoring
  const performanceRef = useRef({ frameCount: 0, lastTime: 0 });
  const intersectionObserverRef = useRef(null);
  const chartRefs = useRef({});

  // Performance detection and optimization
  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Performance monitoring
    const measurePerformance = () => {
      const now = performance.now();
      performanceRef.current.frameCount++;
      
      if (now - performanceRef.current.lastTime >= 1000) {
        const fps = performanceRef.current.frameCount;
        performanceRef.current.frameCount = 0;
        performanceRef.current.lastTime = now;
        
        // Adjust performance based on FPS
        if (fps < 30) {
          setDevicePerformance('low');
          setAnimationFrameRate(30);
        } else if (fps < 45) {
          setDevicePerformance('medium');
          setAnimationFrameRate(45);
        } else {
          setDevicePerformance('high');
          setAnimationFrameRate(60);
        }
      }
      
      requestAnimationFrame(measurePerformance);
    };
    
    requestAnimationFrame(measurePerformance);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Initialize audit log from localStorage
  useEffect(() => {
    const existingLogs = JSON.parse(localStorage.getItem('climateAnalysisLogs') || '[]');
    setAuditLog(existingLogs);
  }, []);

  // Intersection Observer for lazy loading charts
  useEffect(() => {
    if (!intersectionObserverRef.current) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const chartId = entry.target.dataset.chartId;
            if (entry.isIntersecting) {
              setVisibleCharts(prev => new Set([...prev, chartId]));
            }
          });
        },
        { 
          rootMargin: '50px',
          threshold: 0.1 
        }
      );
    }

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);

  // Early return if no city selected
  if (!selectedCity) {
    return (
      <div className="space-y-6">
        <AnimatedCard direction="scale" delay={300} duration={700}>
          <div className="nasa-card mb-4 sm:mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-green-50">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">Climate History Dashboard</h2>
                <p className="text-sm text-gray-500">25 years of climate data analysis (1999-2024)</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>Please select a city to view climate data</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Select a city to view climate history</p>
                <p className="text-gray-500 text-sm mt-2">Choose a city from the sidebar to see 25 years of NASA climate data</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    );
  }

  // Calculate mean temperature for anomaly calculations
  const meanTemp = climateData.length > 0 
    ? climateData.reduce((sum, d) => sum + d.temperature, 0) / climateData.length
    : 15;

  // Audit trail logging
  const logAnalysisRequest = useCallback((action, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      city: selectedCity?.name || 'Unknown',
      date: selectedDate || 'Unknown',
      details,
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
    };
    
    setAuditLog(prev => [...prev, logEntry]);
    
    // Store in localStorage for persistence
    const existingLogs = JSON.parse(localStorage.getItem('climateAnalysisLogs') || '[]');
    existingLogs.push(logEntry);
    localStorage.setItem('climateAnalysisLogs', JSON.stringify(existingLogs.slice(-100))); // Keep last 100 entries
  }, [selectedCity, selectedDate]);

  // Export functions
  const exportChartAsPNG = useCallback(async (chartId, chartName) => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector(`#${chartId} canvas`);
      if (!canvas) {
        // For SVG charts, convert to canvas
        const svg = document.querySelector(`#${chartId} svg`);
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = svg.clientWidth || 500;
          canvas.height = svg.clientHeight || 280;
          
          // Use a more reliable method for SVG to Canvas conversion
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          const img = document.createElement('img');
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.download = `${chartName}-${selectedCity?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL();
            link.click();
            URL.revokeObjectURL(url);
          };
          img.onerror = () => {
            console.error('Failed to load SVG for PNG export');
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
      } else {
        const link = document.createElement('a');
        link.download = `${chartName}-${selectedCity?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
      
      logAnalysisRequest('export_png', { chartId, chartName });
    } catch (error) {
      console.error('PNG export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedCity, logAnalysisRequest]);

  const exportChartAsCSV = useCallback((chartId, chartName) => {
    try {
      let csvData = '';
      
      switch (chartId) {
        case 'temperature-chart':
          csvData = 'Year,Temperature,Anomaly\n';
          climateData.forEach(d => {
            const anomaly = d.temperature - meanTemp;
            csvData += `${d.year},${d.temperature.toFixed(2)},${anomaly.toFixed(2)}\n`;
          });
          break;
          
        case 'extreme-weather-chart':
          csvData = 'Year,Hot Days,Rainy Days,Total Extreme Days\n';
          climateData.forEach(d => {
            csvData += `${d.year},${d.hotDays || 0},${d.rainyDays || 0},${(d.hotDays || 0) + (d.rainyDays || 0)}\n`;
          });
          break;
          
        case 'seasonal-shift-chart':
          csvData = 'Year,First Warm Day,Date\n';
          climateData.forEach(d => {
            const date = new Date(2024, 0, d.firstWarmDay || 90);
            csvData += `${d.year},${d.firstWarmDay || 90},"${date.toLocaleDateString()}"\n`;
          });
          break;
          
        case 'timelapse-chart':
          csvData = 'Year,Temperature,Anomaly,Hot Days,Rainy Days\n';
          climateData.forEach(d => {
            const anomaly = d.temperature - meanTemp;
            csvData += `${d.year},${d.temperature.toFixed(2)},${anomaly.toFixed(2)},${d.hotDays || 0},${d.rainyDays || 0}\n`;
          });
          break;
      }
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.download = `${chartName}-${selectedCity?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();
      
      logAnalysisRequest('export_csv', { chartId, chartName });
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  }, [climateData, meanTemp, selectedCity, logAnalysisRequest]);

  const exportPDFReport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Create a comprehensive PDF report
      const reportData = {
        title: `Climate Analysis Report - ${selectedCity?.name || 'Unknown City'}`,
        generatedAt: new Date().toISOString(),
        city: selectedCity?.name || 'Unknown',
        date: selectedDate || 'Unknown',
        dataSource: dataError ? 'Fallback Data' : 'Real NASA Data',
        performance: devicePerformance,
        climateData: climateData,
        meanTemperature: meanTemp,
        insights: aiInsights,
        auditLog: auditLog.slice(-10) // Last 10 entries
      };
      
      // For now, export as JSON (in a real app, you'd use a PDF library like jsPDF)
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = `climate-report-${selectedCity?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
      link.href = URL.createObjectURL(blob);
      link.click();
      
      logAnalysisRequest('export_pdf_report', { reportData });
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedCity, selectedDate, dataError, devicePerformance, climateData, meanTemp, aiInsights, auditLog, logAnalysisRequest]);

  // Load real NASA climate data
  useEffect(() => {
    if (selectedCity && selectedCity.csvFile) {
      loadClimateData();
      logAnalysisRequest('load_climate_data', { 
        city: selectedCity.name, 
        csvFile: selectedCity.csvFile 
      });
    }
  }, [selectedCity, logAnalysisRequest]);

  const loadClimateData = async () => {
    setIsLoadingData(true);
    setDataError('');
    
    try {
      const csvFileName = selectedCity.csvFile;
      if (!csvFileName) {
        throw new Error('No CSV file specified for this city');
      }
      
      const allData = await nasaDataService.loadCityData(selectedCity.name, csvFileName);
      
      if (!allData || !Array.isArray(allData) || allData.length === 0) {
        throw new Error('No climate data available for this city');
      }

      // Process NASA data to extract yearly statistics
      const yearlyData = processNASAData(allData);
      
      if (!yearlyData || !Array.isArray(yearlyData) || yearlyData.length === 0) {
        throw new Error('Failed to process climate data');
      }
      
      setClimateData(yearlyData);
    } catch (error) {
      setDataError(`Error loading climate data: ${error.message}`);
      // Fallback to mock data if real data fails
      setClimateData(generateMockData());
    } finally {
      setIsLoadingData(false);
    }
  };

  // Process NASA CSV data to extract yearly climate statistics
  const processNASAData = (rawData) => {
    const yearlyStats = {};
    
    rawData.forEach((record, index) => {
      try {
        // Validate record structure
        if (!record || typeof record !== 'object') {
          return;
        }
        
        const year = parseInt(record.YEAR);
        if (isNaN(year) || year < 1990 || year > 2030) {
          return;
        }
        
        if (!yearlyStats[year]) {
          yearlyStats[year] = {
            year,
            temperatures: [],
            precipitations: [],
            hotDays: 0,
            rainyDays: 0,
            firstWarmDay: null
          };
        }
        
        const tempMax = parseFloat(record.T2M_MAX);
        const precipitation = parseFloat(record.PRECTOTCORR);
        
        if (!isNaN(tempMax) && tempMax > -100 && tempMax < 100) {
          yearlyStats[year].temperatures.push(tempMax);
          
          // Count hot days (>35°C)
          if (tempMax > 35) {
            yearlyStats[year].hotDays++;
          }
          
          // Track first warm day (>20°C)
          if (tempMax > 20 && yearlyStats[year].firstWarmDay === null) {
            const doy = parseInt(record.DOY);
            if (!isNaN(doy) && doy > 0 && doy <= 366) {
              yearlyStats[year].firstWarmDay = doy;
            }
          }
        }
        
        if (!isNaN(precipitation) && precipitation >= 0 && precipitation < 1000) {
          yearlyStats[year].precipitations.push(precipitation);
          
          // Count heavy rain days (>20mm)
          if (precipitation > 20) {
            yearlyStats[year].rainyDays++;
          }
        }
      } catch (error) {
        // Silent error handling
      }
    });
    
    // Convert to array and calculate averages
    const climateData = Object.values(yearlyStats).map(yearData => {
      const avgTemp = yearData.temperatures.length > 0 
        ? yearData.temperatures.reduce((sum, temp) => sum + temp, 0) / yearData.temperatures.length
        : 0;
      
      const avgPrecip = yearData.precipitations.length > 0
        ? yearData.precipitations.reduce((sum, precip) => sum + precip, 0) / yearData.precipitations.length
        : 0;
      
      return {
        year: yearData.year,
        temperature: avgTemp,
        precipitation: avgPrecip,
        hotDays: yearData.hotDays,
        rainyDays: yearData.rainyDays,
        firstWarmDay: yearData.firstWarmDay || 90, // Default to day 90 if no warm day found
        monthlyTemps: [] // Will be calculated separately if needed
      };
    });
    
    return climateData.sort((a, b) => a.year - b.year);
  };

  // Fallback mock data generator
  const generateMockData = () => {
    const years = Array.from({ length: 26 }, (_, i) => 1999 + i);
    const baseTemp = 15; // Base temperature
    
    return years.map(year => {
      const trend = (year - 1999) * 0.05; // Gradual warming trend
      const anomaly = (Math.random() - 0.5) * 3; // Random anomaly
      const hotDays = Math.floor(Math.random() * 20 + 5 + trend * 2);
      const rainyDays = Math.floor(Math.random() * 15 + 3);
      const firstWarmDay = Math.floor(Math.random() * 30 + 60); // Day 60-90 (March-May)
      
      return {
        year,
        temperature: baseTemp + trend + anomaly,
        anomaly: anomaly,
        hotDays,
        rainyDays,
        firstWarmDay,
        monthlyTemps: Array.from({ length: 12 }, (_, month) => 
          baseTemp + trend + Math.sin((month - 3) * Math.PI / 6) * 10 + Math.random() * 2
        )
      };
    });
  };

  // Load AI insights
  useEffect(() => {
    if (weatherData && selectedCity && selectedDate) {
      loadAIInsights();
    }
  }, [weatherData, selectedCity, selectedDate]);

  const loadAIInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError('');
    
    try {
      let apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) apiKey = geminiService.apiKey;
      if (!apiKey) {
        setInsightsError('Gemini API key not configured');
        setIsLoadingInsights(false);
        return;
      }
      geminiService.setApiKey(apiKey);

      // Calculate climate insights from historical data
      const avgHotDays = climateData.length > 0 ? Math.round(climateData.reduce((sum, d) => sum + (d.hotDays || 0), 0) / climateData.length) : 0;
      const avgRainyDays = climateData.length > 0 ? Math.round(climateData.reduce((sum, d) => sum + (d.rainyDays || 0), 0) / climateData.length) : 0;
      const avgFirstWarmDay = climateData.length > 0 ? Math.round(climateData.reduce((sum, d) => sum + (d.firstWarmDay || 90), 0) / climateData.length) : 90;
      const tempTrend = climateData.length > 0 ? (climateData[climateData.length - 1].temperature - climateData[0].temperature) : 0;
      const aboveAverageYears = climateData.filter(d => (d.temperature - meanTemp) > 0).length;
      const belowAverageYears = climateData.filter(d => (d.temperature - meanTemp) < 0).length;

      // Create a simple climate analysis text
      const climateInsights = `Climate Analysis for ${selectedCity.name} (1999-2024):

Temperature Trends:
- Average temperature: ${meanTemp.toFixed(1)}°C
- Temperature trend: ${tempTrend > 0 ? '+' : ''}${tempTrend.toFixed(1)}°C over 25 years
- Above-average years: ${aboveAverageYears}, Below-average years: ${belowAverageYears}

Extreme Weather Patterns:
- Average hot days (>35°C): ${avgHotDays} per year
- Average heavy rain days (>20mm): ${avgRainyDays} per year

Seasonal Changes:
- First warm day (>20°C): Average day ${avgFirstWarmDay} of the year
${avgFirstWarmDay < 80 ? '- Spring appears to be arriving earlier' : avgFirstWarmDay > 100 ? '- Spring appears to be arriving later' : '- Spring timing appears stable'}

Climate Summary:
${tempTrend > 0.5 ? 'The city shows a warming trend over the past 25 years, with increasing temperatures.' : tempTrend < -0.5 ? 'The city shows a cooling trend over the past 25 years.' : 'Temperature has remained relatively stable over the past 25 years.'}
${avgHotDays > 10 ? 'Hot days are frequent, indicating a warm climate.' : avgHotDays < 5 ? 'Hot days are rare, indicating a moderate climate.' : 'Hot days occur occasionally.'}
${avgRainyDays > 15 ? 'Heavy rainfall events are common, suggesting a wet climate.' : avgRainyDays < 5 ? 'Heavy rainfall events are rare, suggesting a dry climate.' : 'Heavy rainfall events occur moderately.'}`;

      setAiInsights(climateInsights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setInsightsError(`Error loading AI insights: ${error.message}`);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Temperature Anomalies Chart Component
  const TemperatureAnomaliesChart = () => {
    if (isLoadingData) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Temperature Anomalies</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading NASA data...</span>
            </div>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Loading climate data...</p>
            </div>
          </div>
        </div>
      );
    }

    if (dataError) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Temperature Anomalies</h3>
            <div className="text-sm text-red-500">Using fallback data</div>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">⚠️ {dataError}</p>
              <p className="text-gray-600 text-sm">Showing mock data instead</p>
            </div>
          </div>
        </div>
      );
    }

    if (climateData.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Temperature Anomalies</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No climate data available</p>
            </div>
          </div>
        </div>
      );
    }

    // Calculate anomalies from real data
    const dataWithAnomalies = climateData.map(d => ({
      ...d,
      anomaly: d.temperature - meanTemp
    }));
    
    if (dataWithAnomalies.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Temperature Anomalies</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No data available for visualization</p>
            </div>
          </div>
        </div>
      );
    }
    
    const maxAnomaly = Math.max(...dataWithAnomalies.map(d => Math.abs(d.anomaly)));
    
    if (isNaN(maxAnomaly) || maxAnomaly === 0) {
      console.warn('Invalid maxAnomaly:', maxAnomaly);
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Temperature Anomalies</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Invalid data for visualization</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Temperature Anomalies</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Below Average Temperature</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium">Above Average Temperature</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => exportChartAsPNG('temperature-chart', 'temperature-anomalies')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as PNG"
              >
                <Image className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => exportChartAsCSV('temperature-chart', 'temperature-anomalies')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        <div id="temperature-chart" className="relative h-80 bg-gray-50 rounded-lg p-6">
          <svg className="w-full h-full" viewBox="0 0 500 280">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map(y => (
              <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#e5e7eb" strokeWidth="1" />
            ))}
            {[0, 125, 250, 375, 500].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="280" stroke="#e5e7eb" strokeWidth="1" />
            ))}
            
            {/* Zero line */}
            <line x1="0" y1="125" x2="500" y2="125" stroke="#374151" strokeWidth="2" />
            
            {/* Data points and lines */}
            {dataWithAnomalies.map((d, i) => {
              const x = (i / Math.max(dataWithAnomalies.length - 1, 1)) * 500;
              const y = 125 - ((d.anomaly || 0) / Math.max(maxAnomaly, 1)) * 100;
              const color = (d.anomaly || 0) > 0 ? '#ef4444' : '#3b82f6';
              
              return (
                <g key={d.year}>
                  <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="4" fill={color} />
                  <text x={x.toFixed(2)} y="270" textAnchor="middle" fontSize="10" fill="#6b7280">
                    {i % 3 === 0 ? d.year : ''}
                  </text>
                </g>
              );
            })}
            
            {/* Trend line */}
            <path
              d={dataWithAnomalies.map((d, i) => {
                const x = (i / Math.max(dataWithAnomalies.length - 1, 1)) * 500;
                const y = 125 - ((d.anomaly || 0) / Math.max(maxAnomaly, 1)) * 100;
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
              }).join(' ')}
              stroke="#6366f1"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Mean temperature: {meanTemp.toFixed(1)}°C</p>
          <p>Temperature range: {dataWithAnomalies.length > 0 ? Math.min(...dataWithAnomalies.map(d => d.temperature || 0)).toFixed(1) : '0.0'}°C to {dataWithAnomalies.length > 0 ? Math.max(...dataWithAnomalies.map(d => d.temperature || 0)).toFixed(1) : '0.0'}°C</p>
        </div>
      </div>
    );
  };

  // Extreme Weather Days Chart Component
  const ExtremeWeatherChart = () => {
    if (isLoadingData) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Extreme Weather Days</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading NASA data...</span>
            </div>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-2" />
              <p className="text-gray-600">Loading climate data...</p>
            </div>
          </div>
        </div>
      );
    }

    if (dataError) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Extreme Weather Days</h3>
            <div className="text-sm text-red-500">Using fallback data</div>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">⚠️ {dataError}</p>
              <p className="text-gray-600 text-sm">Showing mock data instead</p>
            </div>
          </div>
        </div>
      );
    }

    if (climateData.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Extreme Weather Days</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No climate data available</p>
            </div>
          </div>
        </div>
      );
    }

    if (climateData.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Extreme Weather Days</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No data available for visualization</p>
            </div>
          </div>
        </div>
      );
    }

    const maxDays = Math.max(...climateData.map(d => d.hotDays + d.rainyDays));
    
    if (isNaN(maxDays) || maxDays === 0) {
      console.warn('Invalid maxDays:', maxDays);
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Extreme Weather Days</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Invalid data for visualization</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Extreme Weather Days</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="font-medium">Hot Days (&gt;35°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Heavy Rain Days (&gt;20mm)</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => exportChartAsPNG('extreme-weather-chart', 'extreme-weather-days')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as PNG"
              >
                <Image className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => exportChartAsCSV('extreme-weather-chart', 'extreme-weather-days')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        <div id="extreme-weather-chart" className="relative h-80 bg-gray-50 rounded-lg p-6">
          <svg className="w-full h-full" viewBox="0 0 500 280">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map(y => (
              <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#e5e7eb" strokeWidth="1" />
            ))}
            
            {/* Bars */}
            {climateData.map((d, i) => {
              const x = (i / Math.max(climateData.length - 1, 1)) * 500;
              const barWidth = 15;
              const hotHeight = ((d.hotDays || 0) / Math.max(maxDays, 1)) * 200;
              const rainyHeight = ((d.rainyDays || 0) / Math.max(maxDays, 1)) * 200;
              
              return (
                <g key={d.year}>
                  <rect
                    x={(x - barWidth/2).toFixed(2)}
                    y={(250 - hotHeight).toFixed(2)}
                    width={barWidth}
                    height={hotHeight.toFixed(2)}
                    fill="#f97316"
                  />
                  <rect
                    x={(x - barWidth/2).toFixed(2)}
                    y={(250 - hotHeight - rainyHeight).toFixed(2)}
                    width={barWidth}
                    height={rainyHeight.toFixed(2)}
                    fill="#3b82f6"
                  />
                  <text x={x.toFixed(2)} y="260" textAnchor="middle" fontSize="10" fill="#6b7280">
                    {i % 3 === 0 ? d.year : ''}
                  </text>
                </g>
              );
            })}
            
            {/* 5-year moving average trend line */}
            <path
              d={climateData.map((d, i) => {
                if (i < 4) return '';
                const x = (i / Math.max(climateData.length - 1, 1)) * 500;
                const avg = climateData.slice(i - 4, i + 1).reduce((sum, day) => sum + (day.hotDays || 0) + (day.rainyDays || 0), 0) / 5;
                const y = 250 - (avg / Math.max(maxDays, 1)) * 200;
                return `${i === 4 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
              }).filter(Boolean).join(' ')}
              stroke="#6366f1"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Average hot days per year: {climateData.length > 0 ? Math.round(climateData.reduce((sum, d) => sum + (d.hotDays || 0), 0) / climateData.length) : 0}</p>
          <p>Average rainy days per year: {climateData.length > 0 ? Math.round(climateData.reduce((sum, d) => sum + (d.rainyDays || 0), 0) / climateData.length) : 0}</p>
        </div>
      </div>
    );
  };

  // Seasonal Shift Chart Component
  const SeasonalShiftChart = () => {
    if (isLoadingData) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Seasonal Shift</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading NASA data...</span>
            </div>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">Loading climate data...</p>
            </div>
          </div>
        </div>
      );
    }

    if (dataError) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Seasonal Shift</h3>
            <div className="text-sm text-red-500">Using fallback data</div>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">⚠️ {dataError}</p>
              <p className="text-gray-600 text-sm">Showing mock data instead</p>
            </div>
          </div>
        </div>
      );
    }

    if (climateData.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Seasonal Shift</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No climate data available</p>
            </div>
          </div>
        </div>
      );
    }

    if (climateData.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Seasonal Shift</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No data available for visualization</p>
            </div>
          </div>
        </div>
      );
    }

    const earliestDay = Math.min(...climateData.map(d => d.firstWarmDay));
    const latestDay = Math.max(...climateData.map(d => d.firstWarmDay));
    
    if (isNaN(earliestDay) || isNaN(latestDay) || earliestDay === latestDay) {
      console.warn('Invalid seasonal shift data:', { earliestDay, latestDay });
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Seasonal Shift</h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Invalid data for visualization</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Seasonal Shift</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Early Spring (Feb-Mar)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium">Late Spring (Apr-May)</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => exportChartAsPNG('seasonal-shift-chart', 'seasonal-shift')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as PNG"
              >
                <Image className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => exportChartAsCSV('seasonal-shift-chart', 'seasonal-shift')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        <div id="seasonal-shift-chart" className="relative h-80 bg-gray-50 rounded-lg p-6">
          <svg className="w-full h-full" viewBox="0 0 500 280">
            {/* Month markers */}
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
              <g key={month}>
                <line x1={i * 83.33} y1="0" x2={i * 83.33} y2="280" stroke="#e5e7eb" strokeWidth="1" />
                <text x={i * 83.33 + 41.67} y="270" textAnchor="middle" fontSize="11" fill="#6b7280">
                  {month}
                </text>
              </g>
            ))}
            
            {/* Data points */}
            {climateData.map((d, i) => {
              const x = (i / Math.max(climateData.length - 1, 1)) * 500;
              const normalizedDay = ((d.firstWarmDay || 90) - earliestDay) / Math.max(latestDay - earliestDay, 1);
              const y = 40 + normalizedDay * 150;
              const color = `hsl(${120 + normalizedDay * 120}, 70%, 50%)`;
              
              return (
                <g key={d.year}>
                  <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="4" fill={color} />
                  <text x={x.toFixed(2)} y="270" textAnchor="middle" fontSize="9" fill="#6b7280">
                    {i % 4 === 0 ? d.year : ''}
                  </text>
                </g>
              );
            })}
            
            {/* Trend line */}
            <path
              d={climateData.map((d, i) => {
                const x = (i / Math.max(climateData.length - 1, 1)) * 500;
                const normalizedDay = ((d.firstWarmDay || 90) - earliestDay) / Math.max(latestDay - earliestDay, 1);
                const y = 40 + normalizedDay * 150;
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
              }).join(' ')}
              stroke="#6366f1"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-medium text-gray-800">First day with temperature &gt;20°C each year</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-600 font-medium">Earliest: Day {earliestDay}</p>
              <p className="text-xs text-gray-500">({new Date(2024, 0, earliestDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</p>
            </div>
            <div>
              <p className="text-green-600 font-medium">Latest: Day {latestDay}</p>
              <p className="text-xs text-gray-500">({new Date(2024, 0, latestDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Simple Time-Lapse Animation Component
  const TimeLapseAnimation = () => {
    const [currentYear, setCurrentYear] = useState(1999);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Optimized animation interval based on device performance
    const getAnimationInterval = useCallback(() => {
      switch (devicePerformance) {
        case 'low': return 400; // 2.5 FPS
        case 'medium': return 300; // 3.3 FPS
        default: return 200; // 5 FPS
      }
    }, [devicePerformance]);
    
    useEffect(() => {
      if (isPlaying) {
        const interval = setInterval(() => {
          setCurrentYear(prev => {
            if (prev >= 2024) {
              setIsPlaying(false);
              return 1999;
            }
            return prev + 1;
          });
        }, getAnimationInterval());
        return () => clearInterval(interval);
      }
    }, [isPlaying, getAnimationInterval]);
    
    const currentData = climateData.find(d => d.year === currentYear);
    const anomaly = currentData ? currentData.temperature - meanTemp : 0;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Climate Time-Lapse</h3>
            <div className="text-xs text-gray-500 mt-1">
              {dataError ? (
                <span className="text-orange-600">⚠️ Using fallback data</span>
              ) : climateData.length > 0 ? (
                <span className="text-green-600">✅ Real NASA data • {selectedCity.name}</span>
              ) : (
                <span className="text-gray-500">No data available</span>
              )}
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100">
                {devicePerformance} perf • {animationFrameRate}fps
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => exportChartAsPNG('timelapse-chart', 'climate-timelapse')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as PNG"
              >
                <Image className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => exportChartAsCSV('timelapse-chart', 'climate-timelapse')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export as CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
        
        <div id="timelapse-chart" className="bg-gray-50 rounded-lg p-6">
          {/* Data cards */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-blue-600 mb-4">{currentYear}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500">Temperature</div>
                <div className="text-xl font-semibold">{(currentData?.temperature || 0).toFixed(1)}°C</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500">Anomaly</div>
                <div className={`text-xl font-semibold ${anomaly > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  {anomaly > 0 ? '+' : ''}{anomaly.toFixed(1)}°C
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500">Hot Days</div>
                <div className="text-xl font-semibold text-orange-500">{currentData?.hotDays || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500">Rainy Days</div>
                <div className="text-xl font-semibold text-blue-500">{currentData?.rainyDays || 0}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1999"
            max="2024"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-500">{currentYear}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Climate History Dashboard */}
      <AnimatedCard direction="scale" delay={300} duration={700}>
        <div className="nasa-card mb-4 sm:mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-green-50">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Climate History Dashboard</h2>
                  <p className="text-sm text-gray-500">25 years of climate data analysis (1999-2024)</p>
                </div>
                <button
                  onClick={exportPDFReport}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  title="Export Full Report"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Export Report</span>
                </button>
              </div>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                {isLoadingData ? (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading NASA data...</span>
                  </div>
                ) : dataError ? (
                  <div className="flex items-center gap-1 text-orange-600">
                    <span>⚠️ Using fallback data</span>
                  </div>
                ) : climateData.length > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-green-600">
                    <span>✅ Real NASA data ({climateData.length} years)</span>
                    <span className="text-gray-500">• {selectedCity.name}</span>
                    <span className="text-gray-500">• {climateData[0]?.year}-{climateData[climateData.length-1]?.year}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>No data available</span>
                  </div>
                )}
                
                {/* Performance indicator */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    devicePerformance === 'low' ? 'bg-red-100 text-red-700' :
                    devicePerformance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {devicePerformance} performance
                  </span>
                  {isMobile && (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      Mobile optimized
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Grid with Lazy Loading */}
          <div className="space-y-8 mb-6">
            <div 
              className="w-full"
              data-chart-id="temperature"
              ref={(el) => {
                if (el && intersectionObserverRef.current) {
                  intersectionObserverRef.current.observe(el);
                }
              }}
            >
              {visibleCharts.has('temperature') && <TemperatureAnomaliesChart />}
              {!visibleCharts.has('temperature') && (
                <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">Loading temperature chart...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className="w-full"
              data-chart-id="extreme"
              ref={(el) => {
                if (el && intersectionObserverRef.current) {
                  intersectionObserverRef.current.observe(el);
                }
              }}
            >
              {visibleCharts.has('extreme') && <ExtremeWeatherChart />}
              {!visibleCharts.has('extreme') && (
                <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">Loading extreme weather chart...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className="w-full"
              data-chart-id="seasonal"
              ref={(el) => {
                if (el && intersectionObserverRef.current) {
                  intersectionObserverRef.current.observe(el);
                }
              }}
            >
              {visibleCharts.has('seasonal') && <SeasonalShiftChart />}
              {!visibleCharts.has('seasonal') && (
                <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">Loading seasonal shift chart...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className="w-full"
              data-chart-id="timelapse"
              ref={(el) => {
                if (el && intersectionObserverRef.current) {
                  intersectionObserverRef.current.observe(el);
                }
              }}
            >
              {visibleCharts.has('timelapse') && <TimeLapseAnimation />}
              {!visibleCharts.has('timelapse') && (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">Loading time-lapse animation...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* AI Insights */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Climate Insights</h3>
            </div>
            
            {isLoadingInsights && (
              <div className="flex items-center gap-2 text-green-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing climate data...</span>
              </div>
            )}
            
            {insightsError && (
              <div className="text-sm text-red-600">{insightsError}</div>
            )}
            
            {aiInsights && !isLoadingInsights && !insightsError && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-800 leading-relaxed">{aiInsights}</p>
              </div>
            )}
            
            {!aiInsights && !isLoadingInsights && !insightsError && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">AI insights will appear here after data analysis...</p>
              </div>
            )}
          </div>
          
          {/* Audit Trail */}
          {auditLog.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Analysis Log</h3>
                <span className="text-xs text-gray-500">({auditLog.length} entries)</span>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="space-y-2 text-xs">
                  {auditLog.slice(-10).reverse().map((entry, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="text-gray-400 font-mono text-xs">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-gray-500">
                        {entry.city} • {entry.date}
                      </span>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <span className="text-gray-400">
                          ({Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <p>Analysis log tracks all user actions for reproducibility and audit purposes.</p>
                <p>Data stored locally in browser. Last 100 entries kept.</p>
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default ClimateHistoryDashboard;
