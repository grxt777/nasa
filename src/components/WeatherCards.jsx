import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Sun, Loader2, CloudRain, AlertTriangle, Shield, Zap, Activity } from 'lucide-react';
import geminiService from '../services/geminiService';
import AnimatedCard from './AnimatedCard';
import AnimatedNumber from './AnimatedNumber';

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
        setCommentsError('Gemini API key not configured');
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
      setCommentsError(`Error loading AI comments: ${error.message}`);
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
      conditions.push('very hot');
    }
    
    // Very cold weather (<5°C)
    if (weatherData.temperature?.average < 5) {
      conditions.push('very cold');
    }
    
    // Very windy (>15 m/s)
    if (weatherData.wind?.average > 15) {
      conditions.push('very windy');
    }
    
    // Very humid (>80%)
    if (weatherData.humidity?.average > 80) {
      conditions.push('very humid');
    }
    
    // Very uncomfortable (comfort score < 3)
    if (weatherData.comfort?.score < 3) {
      conditions.push('very uncomfortable');
    }
    
    // High UV (>8)
    if (weatherData.uv?.average > 8) {
      conditions.push('very sunny');
    }
    
    // Heavy rain (>10mm)
    if (weatherData.precipitation?.average > 10) {
      conditions.push('very rainy');
    }
    
    if (conditions.length === 0) {
      return 'normal';
    }
    
    return conditions.join(', ');
  };

  const extremeWeatherType = getExtremeWeatherType(weatherData);

  const cards = [
    {
      title: 'Temperature',
      icon: Thermometer,
      value: `${weatherData.temperature?.average || 0}°C`,
      subtitle: `min: ${weatherData.temperature?.min || 0}°C, max: ${weatherData.temperature?.max || 0}°C`,
      details: `median: ${weatherData.temperature?.median || 0}°C | σ: ${weatherData.temperature?.stdDev || 0}°C`,
      meteorologistComment: aiComments?.meteorologist?.temperature || '',
      aiAdvice: aiComments?.ai_advice?.temperature || '',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Precipitation',
      icon: Droplets,
      value: `${weatherData.precipitation?.probability || 0}%`,
      subtitle: `rain probability (average: ${weatherData.precipitation?.average || 0}mm)`,
      details: `median: ${weatherData.precipitation?.median || 0}mm | σ: ${weatherData.precipitation?.stdDev || 0}mm`,
      meteorologistComment: aiComments?.meteorologist?.rain || '',
      aiAdvice: aiComments?.ai_advice?.rain || '',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Humidity',
      icon: Droplets,
      value: `${weatherData.humidity?.average || 0}%`,
      subtitle: `average (min: ${weatherData.humidity?.min || 0}%, max: ${weatherData.humidity?.max || 0}%)`,
      details: `median: ${weatherData.humidity?.median || 0}% | σ: ${weatherData.humidity?.stdDev || 0}%`,
      meteorologistComment: aiComments?.meteorologist?.humidity || '',
      aiAdvice: aiComments?.ai_advice?.humidity || '',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    {
      title: 'Wind',
      icon: Wind,
      value: `${weatherData.wind?.average || 0} m/s`,
      subtitle: `average speed (max: ${weatherData.wind?.max || 0} m/s)`,
      details: `median: ${weatherData.wind?.median || 0} m/s | σ: ${weatherData.wind?.stdDev || 0} m/s`,
      meteorologistComment: aiComments?.meteorologist?.wind || '',
      aiAdvice: aiComments?.ai_advice?.wind || '',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      title: 'UV Index',
      icon: Sun,
      value: `${weatherData.uv?.average || 0}`,
      subtitle: `average level (max: ${weatherData.uv?.max || 0})`,
      details: `median: ${weatherData.uv?.median || 0} | σ: ${weatherData.uv?.stdDev || 0}`,
      meteorologistComment: aiComments?.meteorologist?.uv || '',
      aiAdvice: aiComments?.ai_advice?.uv || '',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Soil Moisture',
      icon: CloudRain,
      value: `${weatherData.soilMoisture?.average || 0} mm`,
      subtitle: `average (min: ${weatherData.soilMoisture?.min || 0}mm, max: ${weatherData.soilMoisture?.max || 0}mm)`,
      details: `median: ${weatherData.soilMoisture?.median || 0}mm | σ: ${weatherData.soilMoisture?.stdDev || 0}mm`,
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
      <AnimatedCard direction="top" delay={0} duration={500}>
        <div className="nasa-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                extremeWeatherType === 'normal' ? 'bg-green-50' :
                extremeWeatherType.includes('very') ? 'bg-orange-50' :
                'bg-yellow-50'
              }`}>
                {extremeWeatherType === 'normal' ? (
                  <Shield className={`w-5 h-5 ${
                    extremeWeatherType === 'normal' ? 'text-green-600' :
                    extremeWeatherType.includes('very') ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                ) : extremeWeatherType.includes('very') ? (
                  <AlertTriangle className={`w-5 h-5 ${
                    extremeWeatherType === 'normal' ? 'text-green-600' :
                    extremeWeatherType.includes('very') ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                ) : (
                  <Zap className={`w-5 h-5 ${
                    extremeWeatherType === 'normal' ? 'text-green-600' :
                    extremeWeatherType.includes('very') ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Extreme Weather Level</h3>
                <p className="text-sm text-gray-500">Current weather risk assessment</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              extremeWeatherType === 'normal' ? 'bg-green-100 text-green-700' :
              extremeWeatherType.includes('very') ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {extremeWeatherType.toUpperCase()}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Risk Level</span>
              <span>{extremeWeatherType === 'normal' ? 'Low' : extremeWeatherType.includes('very') ? 'High' : 'Medium'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  extremeWeatherType === 'normal' ? 'bg-green-500' :
                  extremeWeatherType.includes('very') ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}
                style={{
                  width: extremeWeatherType === 'normal' ? '20%' : 
                         extremeWeatherType.includes('very') ? '80%' : '50%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Weather Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <AnimatedCard
              key={index}
              direction={index % 2 === 0 ? 'left' : 'right'}
              delay={index * 100}
              duration={600}
              className="weather-card"
            >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className={`text-2xl sm:text-3xl font-bold ${card.color}`}>
                {card.title === 'Temperature' && (
                  <AnimatedNumber 
                    value={weatherData.temperature?.average || 0} 
                    decimals={1}
                    suffix="°C"
                    duration={1500}
                  />
                )}
                {card.title === 'Precipitation' && (
                  <AnimatedNumber 
                    value={weatherData.precipitation?.probability || 0} 
                    decimals={0}
                    suffix="%"
                    duration={1500}
                  />
                )}
                {card.title === 'Humidity' && (
                  <AnimatedNumber 
                    value={weatherData.humidity?.average || 0} 
                    decimals={0}
                    suffix="%"
                    duration={1500}
                  />
                )}
                {card.title === 'Wind' && (
                  <AnimatedNumber 
                    value={weatherData.wind?.average || 0} 
                    decimals={1}
                    suffix=" m/s"
                    duration={1500}
                  />
                )}
                {card.title === 'UV Index' && (
                  <AnimatedNumber 
                    value={weatherData.uv?.average || 0} 
                    decimals={1}
                    duration={1500}
                  />
                )}
                {card.title === 'Soil Moisture' && (
                  <AnimatedNumber 
                    value={weatherData.soilMoisture?.average || 0} 
                    decimals={1}
                    suffix=" mm"
                    duration={1500}
                  />
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
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
                  <span className="text-xs">Loading AI comments...</span>
                </div>
              )}

              {commentsError && (
                <div className="text-xs text-red-600 mt-2">
                  {commentsError}
                </div>
              )}

              {/* AI Comments */}
              {isLoadingComments && (
                <div className="flex items-center gap-2 text-blue-600 mt-2">
                  <div className="w-3 h-3 animate-spin border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-xs">Loading AI comments...</span>
                </div>
              )}

              <div className="mt-3 space-y-2">
                {card.meteorologistComment && (
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Meteorologist:</span>
                    <span className="text-gray-600 ml-1">{card.meteorologistComment}</span>
                  </div>
                )}
                {card.aiAdvice && (
                  <div className="text-xs">
                    <span className="font-medium text-blue-700">AI Advice:</span>
                    <span className="text-blue-600 ml-1">{card.aiAdvice}</span>
                  </div>
                )}
                {!card.meteorologistComment && !card.aiAdvice && !isLoadingComments && !commentsError && (
                  <div className="text-xs text-gray-500">
                    No comments available
                  </div>
                )}
              </div>
              
            </div>
            </AnimatedCard>
        );
      })}
      </div>
    </div>
  );
};

export default WeatherCards;
