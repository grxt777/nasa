import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Download, FileText, RotateCcw, Play, FileDown, ChevronDown, Search, X } from 'lucide-react';
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
  onClose,
  isWaitingForMapClick,
  onMapClickModeChange,
  onConfirmMarker,
  markerCoordinates
}) => {
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState(cities);
  const [hasMarkerPlaced, setHasMarkerPlaced] = useState(false);
  const dropdownRef = useRef(null);
  const citySearchRef = useRef(null);

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
      if (citySearchRef.current && !citySearchRef.current.contains(event.target)) {
        setIsCitySearchOpen(false);
        setCitySearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter cities based on search query
  useEffect(() => {
    if (citySearchQuery.trim() === '') {
      setFilteredCities(cities);
    } else {
      const query = citySearchQuery.toLowerCase();
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        `${city.name}, ${city.country}`.toLowerCase().includes(query)
      );
      setFilteredCities(filtered);
    }
  }, [citySearchQuery]);

  // Handle city selection from search
  const handleCitySelect = (city) => {
    onCityChange(city);
    setIsCitySearchOpen(false);
    setCitySearchQuery('');
    onMapClickModeChange(false);
  };

  // Handle map click mode toggle
  const handleMapClickMode = () => {
    onMapClickModeChange(!isWaitingForMapClick);
    setIsCitySearchOpen(false);
    setCitySearchQuery('');
    setHasMarkerPlaced(false);
  };

  // Handle marker placement
  const handleMarkerPlaced = () => {
    setHasMarkerPlaced(true);
  };

  // Handle confirm marker selection
  const handleConfirmMarker = () => {
    if (onConfirmMarker) {
      onConfirmMarker();
    }
    setHasMarkerPlaced(false);
  };


  // Track marker placement
  useEffect(() => {
    if (markerCoordinates) {
      setHasMarkerPlaced(true);
    }
  }, [markerCoordinates]);

  // Prevent sidebar from closing when keyboard is open
  useEffect(() => {
    const handleKeyboardToggle = () => {
      // Не закрываем сайдбар при открытии клавиатуры
      const isKeyboardOpen = window.innerHeight < window.screen.height * 0.75;
      if (isKeyboardOpen) {
        // Предотвращаем закрытие сайдбара
        return;
      }
    };

    window.addEventListener('resize', handleKeyboardToggle);
    return () => {
      window.removeEventListener('resize', handleKeyboardToggle);
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
        <div className="relative" ref={citySearchRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            City
          </label>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={citySearchQuery}
              onChange={(e) => {
                setCitySearchQuery(e.target.value);
                setIsCitySearchOpen(true);
              }}
              onFocus={() => setIsCitySearchOpen(true)}
              placeholder={selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : "Search city..."}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-sm"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Map Click Button */}
          {!hasMarkerPlaced ? (
            <button
              onClick={handleMapClickMode}
              className={`w-full mt-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                isWaitingForMapClick 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isWaitingForMapClick ? 'Click on map to place marker' : 'Place marker on map'}
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-green-600 text-center">
                ✓ Marker placed successfully
              </div>
              <button
                onClick={handleConfirmMarker}
                className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm location
              </button>
              <button
                onClick={handleMapClickMode}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Place new marker
              </button>
            </div>
          )}

          {/* Search Results Dropdown */}
          {isCitySearchOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map(city => (
                  <div
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-gray-500">{city.country}</div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  {citySearchQuery.trim() ? 'City not found. Soon we will add this city!' : 'No cities available'}
                </div>
              )}
            </div>
          )}
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
