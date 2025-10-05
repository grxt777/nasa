import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Loader2
} from 'lucide-react';
import geminiService from '../services/geminiService';
import nasaDataService from '../services/nasaDataService';
import { calculateDetailedWeatherStats } from '../utils/dataProcessing';

const AIAnalysis = ({ weatherData, selectedCity, selectedDate, selectedEvent }) => {
  const [aiAnalysis, setAIAnalysis] = useState('');
  const [aiTruncated, setAITruncated] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');

  useEffect(() => {
    if (weatherData && selectedCity && selectedDate) {
      loadAIAnalysis();
    }
  }, [weatherData, selectedCity, selectedDate, selectedEvent]);

  const loadAIAnalysis = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionsError('');
    try {
      let apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) apiKey = geminiService.apiKey;
      if (!apiKey) {
        setSuggestionsError('API ключ Gemini не настроен. Обратитесь к администратору.');
        setIsLoadingSuggestions(false);
        return;
      }
      geminiService.setApiKey(apiKey);

      // Use detailed stats for AI analysis
      console.log('WeatherData for AI analysis:', weatherData);
      
      // The weatherData from useWeatherData is the result of calculateWeatherProbabilities
      // We need to get the raw data from nasaDataService
      const rawDataResult = await nasaDataService.getWeatherDataForDate(
        selectedCity.name, 
        selectedCity.csvFile, 
        selectedDate,
        5 // ±5 day window
      );
      
      console.log('Raw data result:', rawDataResult);
      console.log('Raw data array:', rawDataResult.data);
      
      const detailedStats = calculateDetailedWeatherStats(rawDataResult.data);
      console.log('Detailed stats calculated:', detailedStats);
      const aiResult = await geminiService.generateAIWeatherAnalysis({
        weatherStats: detailedStats,
        city: selectedCity.name,
        dateStr: selectedDate,
        eventName: selectedEvent || ''
      });
      setAIAnalysis(aiResult.text);
      setAITruncated(!!aiResult.truncated);
      
      // Store AI rating and summary for ProbabilityCards
      if (aiResult.rating || aiResult.summary) {
        // Store in a way that can be accessed by other components
        window.aiAnalysisData = {
          rating: aiResult.rating,
          summary: aiResult.summary
        };
      }

    } catch (error) {
      console.error('Error loading AI analysis:', error);
      setSuggestionsError(`Ошибка загрузки ИИ-анализа: ${error.message}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  if (!weatherData) {
    return null;
  }

  const formatAIText = (text) => {
    if (!text) return null;
    
    // Split text into lines and process each line
    const lines = text.split('\n').filter(line => line.trim());
    const formattedElements = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;
      
      // Check for numbered lists (1., 2., 3., etc.)
      if (/^\d+\./.test(trimmedLine)) {
        formattedElements.push(
          <div key={index} className="flex items-start gap-3 mb-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {trimmedLine.match(/^\d+/)[0]}
            </div>
            <div className="text-gray-800 text-sm leading-relaxed">
              {trimmedLine.replace(/^\d+\.\s*/, '')}
            </div>
      </div>
    );
  }
      // Check for bullet points (-, •, etc.)
      else if (/^[-•]\s/.test(trimmedLine)) {
        formattedElements.push(
          <div key={index} className="flex items-start gap-3 mb-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-gray-800 text-sm leading-relaxed">
              {trimmedLine.replace(/^[-•]\s*/, '')}
          </div>
          </div>
        );
      }
      // Check for headers (lines that end with :)
      else if (trimmedLine.endsWith(':') && trimmedLine.length < 50) {
        formattedElements.push(
          <div key={index} className="mt-4 mb-2">
            <h4 className="text-gray-900 font-semibold text-sm">
              {trimmedLine.replace(':', '')}
            </h4>
          </div>
        );
      }
      // Check for bold text (wrapped in **)
      else if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
        formattedElements.push(
          <div key={index} className="mb-2">
            <div className="text-gray-800 text-sm leading-relaxed">
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={partIndex} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </div>
          </div>
        );
      }
      // Check for italic text (wrapped in *)
      else if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*.*?\*)/);
        formattedElements.push(
          <div key={index} className="mb-2">
            <div className="text-gray-800 text-sm leading-relaxed">
              {parts.map((part, partIndex) => {
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <em key={partIndex} className="italic text-gray-700">{part.slice(1, -1)}</em>;
                }
                return part;
              })}
            </div>
          </div>
        );
      }
      // Check for emoji headers (lines starting with emoji)
      else if (/^[🌡️💧🌪️☀️👕🎯📅🌍📊✅⚠️❌]/.test(trimmedLine)) {
        formattedElements.push(
          <div key={index} className="mt-3 mb-2">
            <div className="text-gray-900 font-medium text-sm">
              {trimmedLine}
            </div>
          </div>
        );
      }
      // Regular paragraphs
      else {
        formattedElements.push(
          <div key={index} className="mb-2">
            <div className="text-gray-800 text-sm leading-relaxed">
              {trimmedLine}
            </div>
          </div>
        );
      }
    });
    
    return formattedElements;
  };

  return (
    <div className="space-y-6">
      {/* Main AI Analysis Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-xl bg-blue-50">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Анализ дня</h2>
            <p className="text-sm text-gray-500">Глубокий анализ погодных условий</p>
          </div>
        </div>
        {isLoadingSuggestions ? (
          <div className="flex items-center gap-2 text-blue-600"><Loader2 className="animate-spin" /> Загрузка AI-анализа...</div>
        ) : suggestionsError ? (
          <div className="text-red-600 font-medium">{suggestionsError}</div>
        ) : aiAnalysis ? (
          <div className="space-y-1">
            <div className="text-base text-gray-800 leading-relaxed">
              {formatAIText(aiAnalysis)}
            </div>
            {aiTruncated && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Ответ был обрезан из-за ограничения длины. Попробуйте упростить запрос.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Нет анализа для выбранных параметров.</div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
