import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap = ({ selectedCity, onCitySelect, cities }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const worldBounds = [[-85, -180], [85, 180]];

    const map = L.map(mapRef.current, {
      minZoom: 2,
      worldCopyJump: true
    }).setView([20, 0], 2);
    mapInstanceRef.current = map;

    // Clamp latitude to avoid panning beyond poles while allowing horizontal wrap
    map.on('moveend', () => {
      const center = map.getCenter();
      const clampedLat = Math.max(-85, Math.min(85, center.lat));
      if (clampedLat !== center.lat) {
        map.panTo([clampedLat, center.lng], { animate: false });
      }
    });

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
      opacity: 0.6
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

      marker.bindTooltip(`${city.name}, ${city.country}`, {
        direction: 'top',
        offset: [0, -10]
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

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default LeafletMap;
