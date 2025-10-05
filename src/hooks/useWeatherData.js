import { useState, useCallback } from 'react';
import { calculateWeatherProbabilities, generateTrendData, getDayOfYear, filterDataByCityAndDOY } from '../utils/dataProcessing';
import nasaDataService from '../services/nasaDataService';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeWeatherData = useCallback(async (city, selectedDate, variable = 'T2M_MAX') => {
    if (!city || !selectedDate) {
      setError('Пожалуйста, выберите город и дату');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting weather analysis for:', city.name, selectedDate);
      
      // Load NASA data for the selected city and date with ±5 day window
      const weatherDataResult = await nasaDataService.getWeatherDataForDate(
        city.name, 
        city.csvFile, 
        selectedDate,
        5 // ±5 day window for better calculation
      );
      
      console.log('Weather data result:', weatherDataResult);
      console.log(`Found ${weatherDataResult.totalRecords} records for ${city.name} within ±${weatherDataResult.window} days of ${selectedDate}`);
      
      if (weatherDataResult.data.length === 0) {
        setError(`Нет данных для ${city.name} на ${selectedDate} (±5 дней). Попробуйте другую дату.`);
        setWeatherData(null);
        setTrendData(null);
        return;
      }
      
      // Calculate probabilities based on historical data for this day
      const probabilities = calculateWeatherProbabilities(weatherDataResult.data, selectedDate);
      console.log('Calculated probabilities:', probabilities);
      setWeatherData(probabilities);

      // Generate trend data using all available data for this city and selected variable
      const allCityData = await nasaDataService.loadCityData(city.name, city.csvFile);
      const trends = generateTrendData(allCityData, variable);
      setTrendData(trends);

    } catch (err) {
      console.error('Error in weather analysis:', err);
      setError(`Ошибка загрузки данных: ${err.message}`);
      setWeatherData(null);
      setTrendData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetData = useCallback(() => {
    setWeatherData(null);
    setTrendData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    weatherData,
    trendData,
    isLoading,
    error,
    analyzeWeatherData,
    resetData
  };
};

