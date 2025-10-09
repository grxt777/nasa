import { useState, useCallback } from 'react';
import { calculateWeatherProbabilities, generateTrendData, getDayOfYear, filterDataByCityAndDOY } from '../utils/dataProcessing';
import nasaDataService from '../services/nasaDataService';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);

  const analyzeWeatherData = useCallback(async (city, selectedDate, variable = 'T2M_MAX') => {
    if (!city || !selectedDate) {
      setError('Пожалуйста, выберите город и дату');
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStage('Инициализация...');
    setError(null);

    try {
      console.log('Starting weather analysis for:', city.name, selectedDate);
      
      // Этап 1: Загрузка данных NASA
      setLoadingProgress(20);
      setLoadingStage('Загрузка данных NASA...');
      
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
      
      // Этап 2: Расчет вероятностей
      setLoadingProgress(50);
      setLoadingStage('Анализ погодных данных...');
      
      const probabilities = calculateWeatherProbabilities(weatherDataResult.data, selectedDate);
      console.log('Calculated probabilities:', probabilities);
      setWeatherData(probabilities);

      // Этап 3: Генерация трендов
      setLoadingProgress(80);
      setLoadingStage('Построение графиков...');
      
      const allCityData = await nasaDataService.loadCityData(city.name, city.csvFile);
      const trends = generateTrendData(allCityData, variable);
      setTrendData(trends);
      
      // Завершение
      setLoadingProgress(100);
      setLoadingStage('Готово!');

    } catch (err) {
      console.error('Error in weather analysis:', err);
      setError(`Ошибка загрузки данных: ${err.message}`);
      setWeatherData(null);
      setTrendData(null);
    } finally {
      setIsLoading(false);
      // Небольшая задержка перед сбросом прогресса для лучшего UX
      setTimeout(() => {
        setLoadingProgress(0);
        setLoadingStage('');
      }, 1000);
    }
  }, []);

  const resetData = useCallback(() => {
    setWeatherData(null);
    setTrendData(null);
    setError(null);
    setIsLoading(false);
    setLoadingProgress(0);
    setLoadingStage('');
  }, []);

  return {
    weatherData,
    trendData,
    isLoading,
    loadingProgress,
    loadingStage,
    error,
    analyzeWeatherData,
    resetData
  };
};

