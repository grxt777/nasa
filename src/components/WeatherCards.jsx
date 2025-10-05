import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Sun, Loader2, CloudRain } from 'lucide-react';
import geminiService from '../services/geminiService';

const WeatherCards = ({ weatherData, selectedCity, selectedDate, selectedEvent }) => {
  const [aiComments, setAiComments] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState('');

  useEffect(() => {
    if (weatherData && selectedCity && selectedDate) {
      loadAIComments();
    }
  }, [weatherData, selectedCity, selectedDate, selectedEvent]);

  const loadAIComments = async () => {
    setIsLoadingComments(true);
    setCommentsError('');
    
    try {
      let apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) apiKey = geminiService.apiKey;
      if (!apiKey) {
        setCommentsError('API ключ Gemini не настроен');
        setIsLoadingComments(false);
        return;
      }
      geminiService.setApiKey(apiKey);

      const comments = await geminiService.generateWeatherParameterComments({
        city: selectedCity.name,
        dateStr: selectedDate,
        temperature: weatherData.temperature?.average || 0,
        rain: weatherData.precipitation?.average || 0,
        humidity: weatherData.humidity?.average || 0,
        wind: weatherData.wind?.average || 0,
        uv: weatherData.uv?.average || 0,
        soilMoisture: weatherData.soilMoisture?.average || 0,
        activity: selectedEvent || ''
      });
      
      setAiComments(comments);
    } catch (error) {
      console.error('Error loading AI comments:', error);
      setCommentsError(`Ошибка загрузки AI комментариев: ${error.message}`);
    } finally {
      setIsLoadingComments(false);
    }
  };

  if (!weatherData) {
    return null;
  }

  // Function to determine extreme weather conditions
  const getExtremeWeatherType = (weatherData) => {
    const conditions = [];
    
    // Very hot weather (>35°C)
    if (weatherData.temperature?.average > 35) {
      conditions.push('очень жаркая');
    }
    
    // Very cold weather (<5°C)
    if (weatherData.temperature?.average < 5) {
      conditions.push('очень холодная');
    }
    
    // Very windy (>15 m/s)
    if (weatherData.wind?.average > 15) {
      conditions.push('очень ветреная');
    }
    
    // Very humid (>80%)
    if (weatherData.humidity?.average > 80) {
      conditions.push('очень влажная');
    }
    
    // Very uncomfortable (comfort score < 3)
    if (weatherData.comfort?.score < 3) {
      conditions.push('очень некомфортная');
    }
    
    // High UV (>8)
    if (weatherData.uv?.average > 8) {
      conditions.push('очень солнечная');
    }
    
    // Heavy rain (>10mm)
    if (weatherData.precipitation?.average > 10) {
      conditions.push('очень дождливая');
    }
    
    if (conditions.length === 0) {
      return 'нормальная';
    }
    
    return conditions.join(', ');
  };

  const extremeWeatherType = getExtremeWeatherType(weatherData);

  const cards = [
    {
      title: 'Температура',
      icon: Thermometer,
      value: `${weatherData.temperature?.average || 0}°C`,
      subtitle: `мин: ${weatherData.temperature?.min || 0}°C, макс: ${weatherData.temperature?.max || 0}°C`,
      details: `медиана: ${weatherData.temperature?.median || 0}°C | σ: ${weatherData.temperature?.stdDev || 0}°C`,
      meteorologistComment: aiComments?.meteorologist?.temperature || '',
      aiAdvice: aiComments?.ai_advice?.temperature || '',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Осадки',
      icon: Droplets,
      value: `${weatherData.precipitation?.probability || 0}%`,
      subtitle: `вероятность дождя (среднее: ${weatherData.precipitation?.average || 0}мм)`,
      details: `медиана: ${weatherData.precipitation?.median || 0}мм | σ: ${weatherData.precipitation?.stdDev || 0}мм`,
      meteorologistComment: aiComments?.meteorologist?.rain || '',
      aiAdvice: aiComments?.ai_advice?.rain || '',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Влажность',
      icon: Droplets,
      value: `${weatherData.humidity?.average || 0}%`,
      subtitle: `средняя (мин: ${weatherData.humidity?.min || 0}%, макс: ${weatherData.humidity?.max || 0}%)`,
      details: `медиана: ${weatherData.humidity?.median || 0}% | σ: ${weatherData.humidity?.stdDev || 0}%`,
      meteorologistComment: aiComments?.meteorologist?.humidity || '',
      aiAdvice: aiComments?.ai_advice?.humidity || '',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    {
      title: 'Ветер',
      icon: Wind,
      value: `${weatherData.wind?.average || 0} м/с`,
      subtitle: `средняя скорость (макс: ${weatherData.wind?.max || 0} м/с)`,
      details: `медиана: ${weatherData.wind?.median || 0} м/с | σ: ${weatherData.wind?.stdDev || 0} м/с`,
      meteorologistComment: aiComments?.meteorologist?.wind || '',
      aiAdvice: aiComments?.ai_advice?.wind || '',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      title: 'УФ-индекс',
      icon: Sun,
      value: `${weatherData.uv?.average || 0}`,
      subtitle: `средний уровень (макс: ${weatherData.uv?.max || 0})`,
      details: `медиана: ${weatherData.uv?.median || 0} | σ: ${weatherData.uv?.stdDev || 0}`,
      meteorologistComment: aiComments?.meteorologist?.uv || '',
      aiAdvice: aiComments?.ai_advice?.uv || '',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Влажность почвы',
      icon: CloudRain,
      value: `${weatherData.soilMoisture?.average || 0} мм`,
      subtitle: `средняя (мин: ${weatherData.soilMoisture?.min || 0}мм, макс: ${weatherData.soilMoisture?.max || 0}мм)`,
      details: `медиана: ${weatherData.soilMoisture?.median || 0}мм | σ: ${weatherData.soilMoisture?.stdDev || 0}мм`,
      meteorologistComment: aiComments?.meteorologist?.soilMoisture || '',
      aiAdvice: aiComments?.ai_advice?.soilMoisture || '',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];


  return (
    <div className="space-y-6">
      {/* Extreme Weather Level Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            extremeWeatherType === 'нормальная' ? 'bg-green-500' :
            extremeWeatherType.includes('очень') ? 'bg-orange-500' :
            'bg-yellow-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">
            Уровень экстремальной погоды: {extremeWeatherType}
          </span>
        </div>
      </div>

      {/* Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border ${card.borderColor} p-6 hover:shadow-md transition-shadow`}
            >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <div className="text-sm text-gray-600">
                {card.subtitle}
              </div>
              
              {/* Additional details */}
              {card.details && (
                <div className="text-xs text-gray-500 mt-1">
                  {card.details}
                </div>
              )}

              {/* AI Comments */}
              {isLoadingComments && (
                <div className="flex items-center gap-2 text-blue-600 mt-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Загрузка AI комментариев...</span>
                </div>
              )}

              {commentsError && (
                <div className="text-xs text-red-600 mt-2">
                  {commentsError}
                </div>
              )}

              {aiComments && !isLoadingComments && !commentsError && (
                <div className="mt-3 space-y-2">
                  {card.meteorologistComment && (
                    <div className="text-xs">
                      <span className="font-medium text-gray-700">Метеоролог:</span>
                      <span className="text-gray-600 ml-1">{card.meteorologistComment}</span>
                    </div>
                  )}
                  {card.aiAdvice && (
                    <div className="text-xs">
                      <span className="font-medium text-blue-700">AI совет:</span>
                      <span className="text-blue-600 ml-1">{card.aiAdvice}</span>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default WeatherCards;
