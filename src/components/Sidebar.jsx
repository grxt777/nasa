import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Download, FileText, RotateCcw, Play, FileDown, ChevronDown } from 'lucide-react';
import { cities } from '../data/cities';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

const Sidebar = ({ 
  selectedCity, 
  onCityChange, 
  selectedDate, 
  onDateChange, 
  selectedEvent,
  onEventChange,
  onShowResults, 
  onDownloadCSV, 
  onDownloadJSON, 
  onDownloadPDF,
  onReset, 
  isLoading, 
  loadingProgress,
  loadingStage,
  hasData,
  onClose
}) => {
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleDownload = (format) => {
    setIsDownloadDropdownOpen(false);
    switch (format) {
      case 'pdf':
        onDownloadPDF();
        break;
      case 'csv':
        onDownloadCSV();
        break;
      case 'json':
        onDownloadJSON();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDownloadDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Weather Analysis</h1>
        <p className="text-sm text-gray-500">NASA Historical Data</p>
      </div>

      {/* Inputs Section */}
      <div className="p-6 space-y-6">
        {/* City Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            City
          </label>
          <select
            value={selectedCity?.id || ''}
            onChange={(e) => {
              const city = cities.find(c => c.id === e.target.value);
              onCityChange(city);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-sm"
          >
            <option value="">Select a city</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date
          </label>
          <input
            type="date"
            value={selectedDate || ''}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-sm"
            placeholder="Select a date"
          />
        </div>

        {/* Event Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Event (optional)
          </label>
          <input
            type="text"
            value={selectedEvent || ''}
            onChange={(e) => onEventChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-sm"
            placeholder="e.g., wedding, picnic, conference..."
          />
        </div>

        {/* Loading Progress */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Analysis Progress:</h3>
            <ProgressBar 
              progress={loadingProgress} 
              text={loadingStage}
              className="mb-2"
            />
            <div className="flex items-center gap-2 text-blue-600">
              <LoadingSpinner size="sm" showText={false} />
              <span className="text-xs">Processing data...</span>
            </div>
          </div>
        )}

        {/* Selected Info */}
        {selectedCity && selectedDate && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">Selected Parameters:</h3>
            <p className="text-sm text-blue-700">
              <strong>{selectedCity.name}</strong>, {selectedCity.country}
            </p>
            <p className="text-sm text-blue-700">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 space-y-3">
        {/* Main Action Button */}
        <button
          onClick={onShowResults}
          disabled={!selectedCity || !selectedDate || isLoading}
          className="w-full bg-white text-blue-600 border-2 border-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 hover:scale-105 hover:shadow-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" text="Analyzing..." className="text-blue-600" />
          ) : (
            <>
              <Play className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              Show Results
            </>
          )}
        </button>

        {/* Secondary Actions */}
        {hasData && (
          <div className="space-y-2">
            {/* Download Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                className="w-full bg-white text-green-600 border-2 border-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform"
              >
                <Download className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                Download Data
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDownloadDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDownloadDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-600 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 hover:scale-105 flex items-center gap-2 text-sm font-medium text-gray-700 transition-all duration-200 ease-in-out transform"
                  >
                    <FileDown className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownload('csv')}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 hover:scale-105 flex items-center gap-2 text-sm font-medium text-gray-700 transition-all duration-200 ease-in-out transform"
                  >
                    <Download className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleDownload('json')}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 hover:scale-105 flex items-center gap-2 text-sm font-medium text-gray-700 rounded-b-lg transition-all duration-200 ease-in-out transform"
                  >
                    <FileText className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                    JSON
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={onReset}
              className="w-full bg-white text-gray-600 border-2 border-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform"
            >
              <RotateCcw className="w-4 h-4 transition-transform duration-300 hover:scale-110 hover:rotate-180" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 border-t border-gray-200 flex-1">
        <h3 className="font-medium text-gray-900 mb-3">How to use:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Select a city from the list</p>
          <p>2. Specify a date (e.g., "July 15")</p>
          <p>3. Click "Show Results"</p>
          <p>4. Get analysis based on NASA historical data</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
