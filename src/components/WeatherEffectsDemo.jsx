import React, { useState } from 'react';
import { Sparkles, Cloud, CloudRain, Wind, Sun, CloudFog, Snowflake, Zap } from 'lucide-react';

/**
 * Демонстрационная панель для тестирования погодных эффектов
 * Показывается только в режиме разработки
 */
const WeatherEffectsDemo = ({ onApplyEffects }) => {
  const [demoWeather, setDemoWeather] = useState({
    temperature: 20,
    humidity: 50,
    windSpeed: 5,
    precipitation: 0,
    uvIndex: 5,
    comfortScore: 7
  });

  const presets = [
    {
      name: 'Солнечный день',
      icon: Sun,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      data: { temperature: 28, humidity: 45, windSpeed: 3, precipitation: 0, uvIndex: 9, comfortScore: 8.5 }
    },
    {
      name: 'Дождь',
      icon: CloudRain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      data: { temperature: 15, humidity: 85, windSpeed: 8, precipitation: 4.5, uvIndex: 2, comfortScore: 5.5 }
    },
    {
      name: 'Гроза',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      data: { temperature: 18, humidity: 90, windSpeed: 15, precipitation: 12, uvIndex: 1, comfortScore: 3 }
    },
    {
      name: 'Снег',
      icon: Snowflake,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      data: { temperature: -3, humidity: 75, windSpeed: 6, precipitation: 3, uvIndex: 1, comfortScore: 4 }
    },
    {
      name: 'Ветрено',
      icon: Wind,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      data: { temperature: 22, humidity: 50, windSpeed: 18, precipitation: 0, uvIndex: 6, comfortScore: 6 }
    },
    {
      name: 'Смог',
      icon: CloudFog,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      data: { temperature: 25, humidity: 70, windSpeed: 2, precipitation: 0, uvIndex: 3, comfortScore: 2 }
    },
    {
      name: 'Идеально',
      icon: Sparkles,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      data: { temperature: 24, humidity: 55, windSpeed: 4, precipitation: 0, uvIndex: 5, comfortScore: 9.5 }
    }
  ];

  const handlePresetClick = (preset) => {
    setDemoWeather(preset.data);
    if (onApplyEffects) {
      onApplyEffects(preset.data);
    }
  };

  const handleSliderChange = (key, value) => {
    const newWeather = { ...demoWeather, [key]: parseFloat(value) };
    setDemoWeather(newWeather);
    if (onApplyEffects) {
      onApplyEffects(newWeather);
    }
  };

  // Показываем только в dev режиме
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="nasa-card mb-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">🧪 Демо погодных эффектов</h3>
          <p className="text-xs text-gray-600">Тестирование визуальных эффектов (только в dev режиме)</p>
        </div>
      </div>

      {/* Пресеты */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Быстрые пресеты:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {presets.map((preset) => {
            const IconComponent = preset.icon;
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset)}
                className={`${preset.bgColor} ${preset.color} p-3 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2`}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-xs font-medium">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ручная настройка */}
      <div className="bg-white rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-4">Ручная настройка:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Temperature */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              🌡 Температура: {demoWeather.temperature}°C
            </label>
            <input
              type="range"
              min="-10"
              max="45"
              step="0.5"
              value={demoWeather.temperature}
              onChange={(e) => handleSliderChange('temperature', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-10°C</span>
              <span>45°C</span>
            </div>
          </div>

          {/* Humidity */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              💧 Влажность: {demoWeather.humidity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={demoWeather.humidity}
              onChange={(e) => handleSliderChange('humidity', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              💨 Ветер: {demoWeather.windSpeed} м/с
            </label>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={demoWeather.windSpeed}
              onChange={(e) => handleSliderChange('windSpeed', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 м/с</span>
              <span>30 м/с</span>
            </div>
          </div>

          {/* Precipitation */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              🌧 Осадки: {demoWeather.precipitation} мм
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={demoWeather.precipitation}
              onChange={(e) => handleSliderChange('precipitation', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 мм</span>
              <span>20 мм</span>
            </div>
          </div>

          {/* UV Index */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ☀️ UV индекс: {demoWeather.uvIndex}
            </label>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={demoWeather.uvIndex}
              onChange={(e) => handleSliderChange('uvIndex', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>15</span>
            </div>
          </div>

          {/* Comfort Score */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              😊 Комфорт: {demoWeather.comfortScore.toFixed(1)}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={demoWeather.comfortScore}
              onChange={(e) => handleSliderChange('comfortScore', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Active Effects Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-2">Активные эффекты:</p>
          <div className="flex flex-wrap gap-2">
            {demoWeather.precipitation > 0.3 && demoWeather.temperature >= 5 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">🌧 Дождь</span>
            )}
            {demoWeather.precipitation > 5 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">⚡ Гроза</span>
            )}
            {demoWeather.precipitation > 0.3 && demoWeather.temperature < 5 && (
              <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">❄️ Снег</span>
            )}
            {demoWeather.windSpeed > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">💨 Ветер</span>
            )}
            {demoWeather.uvIndex > 6 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">☀️ UV свечение</span>
            )}
            {demoWeather.comfortScore > 7 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">✨ Комфорт</span>
            )}
            {demoWeather.comfortScore < 4 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">🌫 Смог</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherEffectsDemo;

