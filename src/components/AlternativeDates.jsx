import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Loader2
} from 'lucide-react';
import geminiService from '../services/geminiService';

const AlternativeDates = ({ weatherData, selectedCity, selectedDate, selectedEvent }) => {
  const [alternativeDates, setAlternativeDates] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');

  useEffect(() => {
    if (weatherData && selectedCity && selectedDate) {
      loadAlternativeDates();
    }
  }, [weatherData, selectedCity, selectedDate, selectedEvent]);

  const loadAlternativeDates = async () => {
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

      // Keep alternative dates logic as is
      const alternatives = await geminiService.generateAlternativeDates(
        selectedCity.name,
        selectedDate,
        weatherData,
        selectedEvent
      );
      setAlternativeDates(alternatives);
    } catch (error) {
      console.error('Error loading alternative dates:', error);
      setSuggestionsError(`Ошибка загрузки альтернативных дат: ${error.message}`);
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
        // Clean up any markdown formatting
        let cleanLine = trimmedLine.replace(/^\d+\.\s*/, '');
        cleanLine = cleanLine.replace(/\*\*/g, ''); // Remove **
        cleanLine = cleanLine.replace(/\*/g, ''); // Remove *
        
        // Check if line contains a date pattern (YYYY-MM-DD)
        const dateMatch = cleanLine.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const date = dateMatch[1];
          const beforeDate = cleanLine.substring(0, dateMatch.index);
          const afterDate = cleanLine.substring(dateMatch.index + date.length);
          
          formattedElements.push(
            <div key={index} className="flex items-start gap-3 mb-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {trimmedLine.match(/^\d+/)[0]}
              </div>
              <div className="text-gray-800 text-sm leading-relaxed">
                {beforeDate}<strong className="font-bold text-gray-900">{date}</strong>{afterDate}
              </div>
            </div>
          );
        } else {
          formattedElements.push(
            <div key={index} className="flex items-start gap-3 mb-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {trimmedLine.match(/^\d+/)[0]}
              </div>
              <div className="text-gray-800 text-sm leading-relaxed">
                {cleanLine}
              </div>
            </div>
          );
        }
      }
      // Check for bullet points (-, •, etc.)
      else if (/^[-•]\s/.test(trimmedLine)) {
        let cleanLine = trimmedLine.replace(/^[-•]\s*/, '');
        cleanLine = cleanLine.replace(/\*\*/g, ''); // Remove **
        cleanLine = cleanLine.replace(/\*/g, ''); // Remove *
        
        formattedElements.push(
          <div key={index} className="flex items-start gap-3 mb-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-gray-800 text-sm leading-relaxed">
              {cleanLine}
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
        let cleanLine = trimmedLine;
        cleanLine = cleanLine.replace(/\*\*/g, ''); // Remove **
        cleanLine = cleanLine.replace(/\*/g, ''); // Remove *
        
        formattedElements.push(
          <div key={index} className="mb-2">
            <div className="text-gray-800 text-sm leading-relaxed">
              {cleanLine}
            </div>
          </div>
        );
      }
    });
    
    return formattedElements;
  };

  return (
    <div className="space-y-6">
      {/* Alternative Dates */}
      {alternativeDates && (
        <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6 w-full">
          <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Wix Madefor Display, sans-serif' }}>
                  Альтернативные даты
                </h3>
                <p className="text-purple-600 font-medium">Лучшие варианты для планирования</p>
              </div>
            </div>
            {isLoadingSuggestions ? (
              <div className="flex items-center gap-2 text-purple-600"><Loader2 className="animate-spin" /> Загрузка альтернативных дат...</div>
            ) : suggestionsError ? (
              <div className="text-red-600 font-medium">{suggestionsError}</div>
            ) : (
              <div className="space-y-1">
                {formatAIText(alternativeDates)}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default AlternativeDates;
