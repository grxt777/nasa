import React, { useState } from 'react';
import { MapPin, Calendar, Globe } from 'lucide-react';

const Header = ({ selectedCity, onCityChange, selectedDate, onDateChange }) => {
  const cities = [
    { id: 'london', name: 'London', country: 'UK', lat: 51.5072, lng: -0.1276, csvFile: 'nasa_weather_London_1999_2024.csv' },
    { id: 'newyork', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, csvFile: 'nasa_weather_New_York_City_1999_2024.csv' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, csvFile: 'nasa_weather_Tokyo_1999_2024.csv' },
    { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, csvFile: 'nasa_weather_Paris_1999_2024.csv' },
    { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, csvFile: 'nasa_weather_Sydney_1999_2024.csv' },
    { id: 'moscow', name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6176, csvFile: 'nasa_weather_Berlin_1999_2024.csv' },
    { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, csvFile: 'nasa_weather_Beijing_1999_2024.csv' },
    { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, csvFile: 'nasa_weather_Cairo_1999_2024.csv' },
    { id: 'delhi', name: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, csvFile: 'nasa_weather_Delhi_1999_2024.csv' },
    { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, csvFile: 'nasa_weather_Dubai_1999_2024.csv' },
    { id: 'istanbul', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, csvFile: 'nasa_weather_Istanbul_1999_2024.csv' },
    { id: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, csvFile: 'nasa_weather_Madrid_1999_2024.csv' },
    { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, csvFile: 'nasa_weather_Rome_1999_2024.csv' },
    { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, csvFile: 'nasa_weather_Seoul_1999_2024.csv' },
    { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, csvFile: 'nasa_weather_Bangkok_1999_2024.csv' },
    { id: 'mexico', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, csvFile: 'nasa_weather_Mexico_City_1999_2024.csv' },
    { id: 'buenos', name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960, csvFile: 'nasa_weather_Buenos_Aires_1999_2024.csv' },
    { id: 'chicago', name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, csvFile: 'nasa_weather_Chicago_1999_2024.csv' },
    { id: 'losangeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, csvFile: 'nasa_weather_Los_Angeles_1999_2024.csv' },
    { id: 'oslo', name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522, csvFile: 'nasa_weather_Oslo_1999_2024.csv' },
    { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426, csvFile: 'nasa_weather_Reykjavik_1999_2024.csv' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Анализ Погоды</h1>
              <p className="text-sm text-gray-500">Исторические данные о погоде</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* City Selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Город
              </label>
              <select
                value={selectedCity?.id || ''}
                onChange={(e) => {
                  const city = cities.find(c => c.id === e.target.value);
                  onCityChange(city);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-3 top-8 w-4 h-4 text-gray-400" />
            </div>

            {/* Date Picker */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Выберите дату"
                />
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
