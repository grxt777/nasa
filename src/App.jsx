import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LeafletMap from './components/LeafletMap';
import WeatherCards from './components/WeatherCards';
import WeatherGraphs from './components/WeatherGraphs';
import AIAnalysis from './components/AIAnalysis';
import AlternativeDates from './components/AlternativeDates';
import ApiKeyConfig from './components/ApiKeyConfig';
import LoadingSpinner from './components/LoadingSpinner';
import ProgressBar from './components/ProgressBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import { useWeatherData } from './hooks/useWeatherData';
import SuitabilityAssessment from './components/SuitabilityAssessment';
import ClimateHistoryDashboard from './components/ClimateHistoryDashboard';
import Footer from './components/Footer';
import { cities } from './data/cities';
import { Menu, X } from 'lucide-react';

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  // Sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [selectedVariable, setSelectedVariable] = useState('T2M_MAX');

  const {
    weatherData,
    trendData,
    isLoading,
    loadingProgress,
    loadingStage,
    error,
    analyzeWeatherData,
    resetData
  } = useWeatherData();

  // Automatic sidebar management on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event);
  };

  const handleVariableChange = (variable) => {
    setSelectedVariable(variable);
    if (selectedCity && selectedDate) {
      analyzeWeatherData(selectedCity, selectedDate, variable);
    }
  };

  const handleShowResults = () => {
    if (selectedCity && selectedDate) {
      analyzeWeatherData(selectedCity, selectedDate, selectedVariable);
    }
  };

  const handleReset = () => {
    setSelectedCity(null);
    setSelectedDate('');
    setSelectedEvent('');
    setSelectedVariable('T2M_MAX');
    resetData();
  };

  const handleDownloadCSV = () => {
    if (!selectedCity || !weatherData) return;
    
    // Get the CSV file name for the selected city
    const csvFileName = selectedCity.csvFile;
    
    // Create download link
    const link = document.createElement('a');
    link.href = `/nasa_weather_data/${csvFileName}`;
    link.download = csvFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (!weatherData) return;
    
    // Create JSON data with all weather information
    const jsonData = {
      city: selectedCity?.name,
      date: selectedDate,
      event: selectedEvent,
      weatherData: weatherData,
      generatedAt: new Date().toISOString()
    };
    
    // Create and download JSON file
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-analysis-${selectedCity?.name}-${selectedDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!weatherData) return;
    
    // Create a simple HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weather Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; }
          .card-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
          .card-content { margin: 5px 0; }
          .score { font-size: 24px; font-weight: bold; color: #059669; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Weather Analysis Report</h1>
          <p><strong>City:</strong> ${selectedCity?.name}</p>
          <p><strong>Date:</strong> ${selectedDate}</p>
          <p><strong>Event:</strong> ${selectedEvent || 'General'}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="card">
          <div class="card-title">Suitability Assessment</div>
          <div class="card-content">
            <div class="score">${weatherData.comfort?.score || 0}/10</div>
            <p>Overall comfort score for outdoor events</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Temperature</div>
          <div class="card-content">
            <p><strong>Average:</strong> ${weatherData.temperature?.average || 0}°C</p>
            <p><strong>Range:</strong> ${weatherData.temperature?.min || 0}°C - ${weatherData.temperature?.max || 0}°C</p>
            <p><strong>Median:</strong> ${weatherData.temperature?.median || 0}°C</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Precipitation</div>
          <div class="card-content">
            <p><strong>Probability:</strong> ${weatherData.precipitation?.probability || 0}%</p>
            <p><strong>Average:</strong> ${weatherData.precipitation?.average || 0}mm</p>
            <p><strong>Maximum:</strong> ${weatherData.precipitation?.max || 0}mm</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Humidity</div>
          <div class="card-content">
            <p><strong>Average:</strong> ${weatherData.humidity?.average || 0}%</p>
            <p><strong>Range:</strong> ${weatherData.humidity?.min || 0}% - ${weatherData.humidity?.max || 0}%</p>
            <p><strong>Median:</strong> ${weatherData.humidity?.median || 0}%</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Wind</div>
          <div class="card-content">
            <p><strong>Average Speed:</strong> ${weatherData.wind?.average || 0} m/s</p>
            <p><strong>Maximum Speed:</strong> ${weatherData.wind?.max || 0} m/s</p>
            <p><strong>Median:</strong> ${weatherData.wind?.median || 0} m/s</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">UV Index</div>
          <div class="card-content">
            <p><strong>Average:</strong> ${weatherData.uv?.average || 0}</p>
            <p><strong>Maximum:</strong> ${weatherData.uv?.max || 0}</p>
            <p><strong>Median:</strong> ${weatherData.uv?.median || 0}</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Soil Moisture</div>
          <div class="card-content">
            <p><strong>Average:</strong> ${weatherData.soilMoisture?.average || 0} mm</p>
            <p><strong>Range:</strong> ${weatherData.soilMoisture?.min || 0}mm - ${weatherData.soilMoisture?.max || 0}mm</p>
            <p><strong>Median:</strong> ${weatherData.soilMoisture?.median || 0}mm</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create and download HTML file (can be converted to PDF by browser)
    const dataBlob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-report-${selectedCity?.name}-${selectedDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const hasData = weatherData !== null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Mobile */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0 h-full w-72 z-50 lg:hidden transition-transform duration-300 ease-in-out`}>
        <Sidebar
          selectedCity={selectedCity}
          onCityChange={handleCitySelect}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          selectedEvent={selectedEvent}
          onEventChange={handleEventChange}
          onShowResults={handleShowResults}
          onDownloadCSV={handleDownloadCSV}
          onDownloadJSON={handleDownloadJSON}
          onDownloadPDF={handleDownloadPDF}
          onReset={handleReset}
          isLoading={isLoading}
          loadingProgress={loadingProgress}
          loadingStage={loadingStage}
          hasData={hasData}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Desktop */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} hidden lg:block transition-all duration-300 ease-in-out overflow-hidden`}>
          <Sidebar
            selectedCity={selectedCity}
            onCityChange={handleCitySelect}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            selectedEvent={selectedEvent}
            onEventChange={handleEventChange}
            onShowResults={handleShowResults}
            onDownloadCSV={handleDownloadCSV}
            onDownloadJSON={handleDownloadJSON}
            onDownloadPDF={handleDownloadPDF}
            onReset={handleReset}
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            loadingStage={loadingStage}
            hasData={hasData}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">NASA SmartWeather</h1>
              <p className="text-xs sm:text-sm text-gray-500">Historical data and forecasts based on 25 years of observations</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-2 sm:p-4 md:p-6">
        {/* Loading Progress */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <ProgressBar 
              progress={loadingProgress} 
              text={loadingStage}
              className="mb-2"
            />
            <div className="flex items-center gap-2 text-blue-600">
              <LoadingSpinner size="sm" showText={false} />
              <span className="text-sm">Analyzing weather data...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

            {/* API Key Configuration: show when no API key present */}
            {(!localStorage.getItem('gemini_api_key') && !import.meta.env.VITE_GEMINI_API_KEY) && (
              <div className="mb-6">
                <ApiKeyConfig onApiKeySet={() => { /* triggers rerender via localStorage */ }} />
              </div>
            )}

            {/* Data Test Component */}
            {/* <div className="mb-6">
              <DataTest />
            </div> */}

            {/* Interactive Map */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Interactive Map</h2>
              {isLoading ? (
                <LoadingSkeleton type="map" />
              ) : (
                <LeafletMap
                  selectedCity={selectedCity}
                  onCitySelect={handleCitySelect}
                  cities={cities}
                  weatherData={weatherData}
                />
              )}
            </div>


            {/* Weather Cards */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Weather Indicators</h2>
              {isLoading ? (
                <LoadingSkeleton type="card" count={6} />
              ) : hasData ? (
                <WeatherCards 
                  weatherData={weatherData} 
                  selectedCity={selectedCity}
                  selectedDate={selectedDate}
                  selectedEvent={selectedEvent}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a city and date to view weather indicators
                </div>
              )}
            </div>

            {/* AI Analysis */}
            <div className="mb-4 sm:mb-6">
              {isLoading ? (
                <LoadingSkeleton type="text" count={3} />
              ) : hasData ? (
                <AIAnalysis 
                  weatherData={weatherData} 
                  selectedCity={selectedCity} 
                  selectedDate={selectedDate}
                  selectedEvent={selectedEvent}
                />
              ) : null}
            </div>

            {/* Suitability Assessment */}
            {isLoading ? (
              <div className="mb-4 sm:mb-6">
                <LoadingSkeleton type="card" count={1} />
              </div>
            ) : hasData ? (
              <SuitabilityAssessment 
                weatherData={weatherData} 
                selectedCity={selectedCity}
                selectedDate={selectedDate}
                selectedEvent={selectedEvent}
              />
            ) : null}

            {/* Weather Graphs */}
            <div className="mb-4 sm:mb-6">
              {isLoading ? (
                <LoadingSkeleton type="graph" count={1} />
              ) : hasData ? (
                <WeatherGraphs
                  weatherData={weatherData}
                  trendData={trendData}
                  selectedVariable={selectedVariable}
                  onVariableChange={handleVariableChange}
                />
              ) : null}
            </div>

            {/* Alternative Dates */}
            <div className="mb-4 sm:mb-6">
              {isLoading ? (
                <LoadingSkeleton type="text" count={2} />
              ) : hasData ? (
                <AlternativeDates 
                  weatherData={weatherData} 
                  selectedCity={selectedCity} 
                  selectedDate={selectedDate}
                  selectedEvent={selectedEvent}
                />
              ) : null}
            </div>

            {/* Climate History Dashboard */}
            <div className="mb-4 sm:mb-6">
              {isLoading ? (
                <LoadingSkeleton type="text" count={2} />
              ) : hasData && weatherData && selectedCity ? (
                <ClimateHistoryDashboard 
                  weatherData={weatherData} 
                  selectedCity={selectedCity} 
                  selectedDate={selectedDate}
                />
              ) : null}
            </div>

        {/* Instructions for first-time users */}
        {!hasData && !isLoading && (
          <div className="text-center py-12 mt-8">
            <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Weather Analysis
              </h3>
              <p className="text-gray-600 mb-6">
                    Select a city and date in the left panel, then click "Show Results" to get detailed weather analysis based on NASA historical data.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                    <p>• Select a city from the list in the left panel</p>
                    <p>• Specify a specific date (e.g., "July 15")</p>
                    <p>• Get analysis based on data from all available years</p>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
        </div>
      </div>
    
    {/* Footer */}
    <Footer />
    </div>
  );
}

export default App;