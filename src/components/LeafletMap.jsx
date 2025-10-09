import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AdvancedWeatherEffectsRenderer from '../utils/advancedWeatherEffects';

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap = ({ selectedCity, onCitySelect, cities, weatherData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const effectsRendererRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const worldBounds = [[-85, -180], [85, 180]];

    const map = L.map(mapRef.current, {
      minZoom: 2,
      worldCopyJump: true,
      // Mobile optimization
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: false, // Disable box zoom for mobile
      keyboard: true,
      dragging: true,
      // Enhanced settings for touch devices
      tap: true,
      tapTolerance: 15,
      // Performance optimization
      preferCanvas: false,
      zoomControl: true,
      attributionControl: true
    }).setView([20, 0], 2);
    mapInstanceRef.current = map;

    // Hard-limit vertical panning while keeping horizontal wrap (wide longitudinal bounds)
    map.setMaxBounds([[-85, -540], [85, 540]]);
    map.options.maxBoundsViscosity = 1.0;

    // Clamp only latitude to keep within poles while allowing horizontal wrap
    const clampLatitude = () => {
      const center = map.getCenter();
      const clampedLat = Math.max(-85, Math.min(85, center.lat));
      if (clampedLat !== center.lat) {
        map.panTo([clampedLat, center.lng], { animate: false });
      }
    };
    map.on('move', clampLatitude);
    map.on('drag', clampLatitude);
    map.on('moveend', clampLatitude);
    map.on('zoomend', clampLatitude);


    // Add base OSM layer
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add OpenWeather Clouds overlay (default ON)
    let owmKey = null;
    try {
      owmKey = typeof localStorage !== 'undefined' ? localStorage.getItem('owm_api_key') : null;
    } catch {}
    const envOwm = import.meta?.env?.VITE_OWM_API_KEY || null;
    const fallbackOwm = '68113ab7de795b5f96755f0fe903a960';
    const apiKey = (owmKey && owmKey.trim()) || (envOwm && String(envOwm).trim()) || fallbackOwm;

    const clouds = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
      attribution: 'Map data © OpenWeather',
      opacity: 0.6,
      className: 'owm-clouds-tiles'
    }).addTo(map);

    // Layer control
    L.control.layers(
      { 'OpenStreetMap': osm },
      { 'Clouds (OpenWeather)': clouds },
      { collapsed: true, position: 'topright' }
    ).addTo(map);

    // Add city markers
    const markers = cities.map(city => {
      const isSelected = selectedCity?.id === city.id;
      
      const marker = L.marker([city.lat, city.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
              isSelected 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-primary-600'
            }">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      });

      marker.on('click', () => {
        onCitySelect(city);
      });

      // Base tooltip
      const baseTooltip = `${city.name}, ${city.country}`;
      marker.bindTooltip(baseTooltip, {
        direction: 'top',
        offset: [0, -10],
        className: 'custom-tooltip'
      });

      return marker;
    });

    markers.forEach(marker => marker.addTo(map));
    markersRef.current = markers;

    // Fit map to show all markers
    if (cities.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      map.remove();
    };
  }, []);

  // Update markers when selectedCity changes
  useEffect(() => {
    if (!mapInstanceRef.current || markersRef.current.length === 0) return;

    markersRef.current.forEach((marker, index) => {
      const city = cities[index];
      const isSelected = selectedCity?.id === city.id;
      
      marker.setIcon(L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
            isSelected 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-primary-600'
          }">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      }));
    });

    // Center map on selected city
    if (selectedCity) {
      mapInstanceRef.current.setView([selectedCity.lat, selectedCity.lng], 6);
    }
  }, [selectedCity, cities]);

  // Initialize weather effects renderer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Create city coordinates for renderer
    const cityCoordinates = {};
    cities.forEach(city => {
      cityCoordinates[city.name] = [city.lat, city.lng];
    });

    // Initialize renderer (advanced version with 3D effects)
    effectsRendererRef.current = new AdvancedWeatherEffectsRenderer(
      mapInstanceRef.current,
      cityCoordinates
    );

    return () => {
      if (effectsRendererRef.current) {
        effectsRendererRef.current.destroy();
      }
    };
  }, [cities]);

  // Render weather effects when city or weather data changes
  useEffect(() => {
    if (!effectsRendererRef.current || !selectedCity || !weatherData) {
      // Stop effects if no data
      if (effectsRendererRef.current) {
        effectsRendererRef.current.stopEffects();
      }
      return;
    }

    // Prepare data for effects
    const effectsData = {
      temperature: weatherData.temperature?.average || 0,
      humidity: weatherData.humidity?.average || 0,
      windSpeed: weatherData.wind?.average || 0,
      precipitation: weatherData.precipitation?.average || 0,
      uvIndex: weatherData.uv?.average || 0,
      comfortScore: weatherData.comfort?.score || 5
    };

    // console.log('🌤️ Weather effects data:', effectsData);
    // console.log('🏙️ Selected city:', selectedCity.name);

    // Start effects
    effectsRendererRef.current.renderWeatherEffects(selectedCity.name, effectsData);

    // Update tooltip of selected city with weather data
    if (markersRef.current.length > 0) {
      const cityIndex = cities.findIndex(c => c.id === selectedCity.id);
      if (cityIndex !== -1 && markersRef.current[cityIndex]) {
        const marker = markersRef.current[cityIndex];
        const weatherTooltip = `
          <div class="weather-tooltip" style="font-family: 'Wix Madefor Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
            <div class="font-bold text-base mb-3">${selectedCity.name}, ${selectedCity.country}</div>
            <div class="text-sm space-y-2">
              <div>🌡 Temperature: ${effectsData.temperature.toFixed(1)}°C</div>
              <div>💧 Humidity: ${effectsData.humidity.toFixed(0)}%</div>
              <div>💨 Wind: ${effectsData.windSpeed.toFixed(1)} m/s</div>
              <div>🌧 Precipitation: ${effectsData.precipitation.toFixed(1)} mm</div>
              <div>☀️ UV: ${effectsData.uvIndex.toFixed(1)}</div>
              <div>😊 Comfort: ${effectsData.comfortScore.toFixed(1)}/10</div>
            </div>
          </div>
        `;
        marker.setTooltipContent(weatherTooltip);
      }
    }
  }, [selectedCity, weatherData, cities]);

  return (
    <div className="w-full max-w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[500px] rounded-lg overflow-hidden border border-blue-100 shadow-md">
      <div ref={mapRef} className="w-full h-full" style={{ maxWidth: '100%' }} />
    </div>
  );
};

export default LeafletMap;
