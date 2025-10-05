import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Globe } from 'lucide-react';

const SimpleMap = ({ selectedCity, onCitySelect, cities }) => {
  const [hoveredCity, setHoveredCity] = useState(null);
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState({ minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 });

  // Calculate map bounds based on cities
  useEffect(() => {
    if (cities.length === 0) return;
    
    const lats = cities.map(city => city.lat);
    const lngs = cities.map(city => city.lng);
    
    const padding = 10; // degrees of padding
    setMapBounds({
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding
    });
  }, [cities]);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat, lng) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    
    const rect = mapRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * width;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * height;
    
    return { x, y };
  };

  const handleCityClick = (city) => {
    onCitySelect(city);
  };

  const resetView = () => {
    // Reset to show all cities
    if (cities.length > 0) {
      const lats = cities.map(city => city.lat);
      const lngs = cities.map(city => city.lng);
      
      const padding = 10;
      setMapBounds({
        minLat: Math.min(...lats) - padding,
        maxLat: Math.max(...lats) + padding,
        minLng: Math.min(...lngs) - padding,
        maxLng: Math.max(...lngs) + padding
      });
    }
  };

  const focusOnCity = (city) => {
    const padding = 5;
    setMapBounds({
      minLat: city.lat - padding,
      maxLat: city.lat + padding,
      minLng: city.lng - padding,
      maxLng: city.lng + padding
    });
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Map Background */}
      <div 
        ref={mapRef}
        className="w-full h-full relative"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)
          `
        }}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* City Markers */}
        {cities.map((city) => {
          const isSelected = selectedCity?.id === city.id;
          const isHovered = hoveredCity?.id === city.id;
          const position = latLngToPixel(city.lat, city.lng);
          
          return (
            <div
              key={city.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
              style={{
                left: position.x,
                top: position.y,
                zIndex: isSelected ? 20 : isHovered ? 15 : 10
              }}
              onClick={() => handleCityClick(city)}
              onMouseEnter={() => setHoveredCity(city)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Marker Shadow */}
              <div className="absolute top-1 left-1 w-8 h-8 bg-black opacity-20 rounded-full blur-sm"></div>
              
              {/* Main Marker */}
              <div
                className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary-600 text-white scale-110 shadow-xl'
                    : isHovered
                    ? 'bg-primary-100 text-primary-600 scale-105'
                    : 'bg-white text-primary-600 hover:bg-primary-50'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </div>
              
              {/* Selection Ring */}
              {isSelected && (
                <div className="absolute -inset-2 rounded-full border-2 border-primary-400 animate-pulse"></div>
              )}
              
              {/* City Label */}
              {(isSelected || isHovered) && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md px-3 py-1 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{city.name}</div>
                  <div className="text-xs text-gray-600">{city.country}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={resetView}
            className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Show all cities"
          >
            <Globe className="w-4 h-4 text-gray-600" />
          </button>
          
          {selectedCity && (
            <button
              onClick={() => focusOnCity(selectedCity)}
              className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Focus on selected city"
            >
              <Navigation className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Map Info */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="text-xs text-gray-600">
            <div className="font-semibold">Weather Analysis Map</div>
            <div>Click on any city to select it</div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
              <span>Available cities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              <span>Selected city</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
