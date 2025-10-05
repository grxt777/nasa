import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Globe, ZoomIn, ZoomOut } from 'lucide-react';

const InteractiveMap = ({ selectedCity, onCitySelect, cities }) => {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const mapRef = useRef(null);

  // Calculate map bounds based on cities
  const getMapBounds = () => {
    if (cities.length === 0) return { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 };
    
    const lats = cities.map(city => city.lat);
    const lngs = cities.map(city => city.lng);
    
    const padding = 20 / zoom; // Dynamic padding based on zoom
    return {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding
    };
  };

  const bounds = getMapBounds();

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat, lng) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    
    const rect = mapRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
    
    return { x, y };
  };

  const handleCityClick = (city) => {
    onCitySelect(city);
    // Center on selected city
    setCenter({ lat: city.lat, lng: city.lng });
    setZoom(Math.max(zoom, 3));
  };

  const resetView = () => {
    if (cities.length > 0) {
      const lats = cities.map(city => city.lat);
      const lngs = cities.map(city => city.lng);
      
      setCenter({
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
      });
      setZoom(1);
    }
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.5, 5));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Map Background */}
      <div 
        ref={mapRef}
        className="w-full h-full relative"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)
          `,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Grid Pattern */}
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

        {/* Latitude/Longitude Lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            {/* Latitude lines */}
            {[-60, -30, 0, 30, 60].map(lat => {
              const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
              return (
                <line
                  key={`lat-${lat}`}
                  x1="0"
                  y1={`${y}%`}
                  x2="100%"
                  y2={`${y}%`}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}
            {/* Longitude lines */}
            {[-120, -60, 0, 60, 120].map(lng => {
              const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
              return (
                <line
                  key={`lng-${lng}`}
                  x1={`${x}%`}
                  y1="0"
                  x2={`${x}%`}
                  y2="100%"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
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
                className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300 ${
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
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md px-3 py-1 whitespace-nowrap z-30">
                  <div className="text-sm font-semibold text-gray-900">{city.name}</div>
                  <div className="text-xs text-gray-600">{city.country}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
          <button
            onClick={resetView}
            className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Show all cities"
          >
            <Globe className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex flex-col gap-1">
            <button
              onClick={zoomIn}
              className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={zoomOut}
              className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Map Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 z-30">
          <div className="text-xs text-gray-600">
            <div className="font-semibold">Interactive Weather Map</div>
            <div>Click on any city to select it</div>
            <div className="text-gray-500 mt-1">Zoom: {zoom.toFixed(1)}x</div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 z-30">
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

export default InteractiveMap;