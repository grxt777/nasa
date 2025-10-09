import React, { useState, useEffect } from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import AnimatedNumber from './AnimatedNumber';
import geminiService from '../services/geminiService';

const SuitabilityAssessment = ({ weatherData, selectedCity, selectedDate, selectedEvent }) => {
  const [aiAssessment, setAiAssessment] = useState(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);
  const [assessmentError, setAssessmentError] = useState('');

  if (!weatherData) {
    return null;
  }

  const comfortScore = weatherData.comfort?.score || 0;

  // Load AI assessment when weather data changes
  useEffect(() => {
    if (weatherData && selectedCity && selectedDate) {
      loadAIAssessment();
    }
  }, [weatherData, selectedCity, selectedDate, selectedEvent]);

  const loadAIAssessment = async () => {
    setIsLoadingAssessment(true);
    setAssessmentError('');
    
    try {
      let apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) apiKey = geminiService.apiKey;
      if (!apiKey) {
        setAssessmentError('Gemini API key not configured');
        setIsLoadingAssessment(false);
        return;
      }
      geminiService.setApiKey(apiKey);

      console.log('Loading AI assessment for:', {
        city: selectedCity.name,
        country: selectedCity.country,
        dateStr: selectedDate,
        event: selectedEvent || 'general outdoor activity',
        temperature: weatherData.temperature?.average || 0,
        humidity: weatherData.humidity?.average || 0,
        windSpeed: weatherData.wind?.average || 0,
        precipitation: weatherData.precipitation?.average || 0,
        uvIndex: weatherData.uv?.average || 0,
        comfortScore: comfortScore
      });

      const assessment = await geminiService.generateSuitabilityAssessment({
        city: selectedCity.name,
        country: selectedCity.country,
        dateStr: selectedDate,
        event: selectedEvent || 'general outdoor activity',
        temperature: weatherData.temperature?.average || 0,
        humidity: weatherData.humidity?.average || 0,
        windSpeed: weatherData.wind?.average || 0,
        precipitation: weatherData.precipitation?.average || 0,
        uvIndex: weatherData.uv?.average || 0,
        comfortScore: comfortScore
      });

      console.log('AI assessment result:', assessment);
      setAiAssessment(assessment);
    } catch (error) {
      console.error('Error loading AI assessment:', error);
      setAssessmentError(`Error loading AI assessment: ${error.message}`);
    } finally {
      setIsLoadingAssessment(false);
    }
  };
  
  const getComfortDescription = (score) => {
    if (score >= 8) return 'Excellent conditions for walks and outdoor events';
    if (score >= 6) return 'Comfortable, minor inconveniences possible';
    if (score >= 4) return 'Acceptable, but caution advised';
    if (score >= 2) return 'Likely heat/cold/high humidity';
    return 'Not recommended to go outside';
  };

  const getComfortColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComfortBgColor = (score) => {
    if (score >= 8) return 'bg-green-50';
    if (score >= 6) return 'bg-blue-50';
    if (score >= 4) return 'bg-yellow-50';
    if (score >= 2) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getComfortBorderColor = (score) => {
    if (score >= 8) return 'border-green-200';
    if (score >= 6) return 'border-blue-200';
    if (score >= 4) return 'border-yellow-200';
    if (score >= 2) return 'border-orange-200';
    return 'border-red-200';
  };

  const getTrendIcon = (score) => {
    if (score >= 8) return TrendingUp;
    if (score >= 4) return Minus;
    return TrendingDown;
  };

  const getTrendColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = (score) => {
    if (score >= 8) return '🌤 Excellent';
    if (score >= 6) return '🙂 Good';
    if (score >= 4) return '😐 Normal';
    if (score >= 2) return '⚠️ Uncomfortable';
    return '🚫 Extreme';
  };

  const TrendIcon = getTrendIcon(comfortScore);

  return (
    <AnimatedCard direction="scale" delay={100} duration={800}>
      <div className="nasa-card mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${getComfortBgColor(comfortScore)}`}>
              <Gauge className={`w-8 h-8 ${getComfortColor(comfortScore)}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Suitability Assessment</h2>
              <p className="text-sm text-gray-500">Overall comfort score for outdoor events</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 ${getTrendColor(comfortScore)}`}>
            <TrendIcon className="w-6 h-6" />
            <span className="text-sm font-medium">
              {getStatusText(comfortScore)}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className={`text-6xl font-bold ${getComfortColor(comfortScore)} mb-2`}>
            <AnimatedNumber 
              value={comfortScore} 
              decimals={1}
              duration={2000}
            />
          </div>
          <div className="text-lg text-gray-600">out of 10</div>
          
          {/* AI Assessment */}
          {isLoadingAssessment && (
            <div className="flex items-center justify-center gap-2 text-blue-600 mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading AI assessment...</span>
            </div>
          )}

          {assessmentError && (
            <div className="text-sm text-red-600 mt-4 text-center">
              {assessmentError}
            </div>
          )}

          {aiAssessment && !isLoadingAssessment && !assessmentError && (
            <div className={`text-sm font-medium ${getComfortColor(comfortScore)} mt-4 text-center`}>
              {aiAssessment.comment}
            </div>
          )}

          {!aiAssessment && !isLoadingAssessment && !assessmentError && (
            <div className={`text-sm font-medium ${getComfortColor(comfortScore)} mt-4 text-center`}>
              {getComfortDescription(comfortScore)}
            </div>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default SuitabilityAssessment;
