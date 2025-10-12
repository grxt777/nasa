import Papa from 'papaparse';
import { fetchWithRetry, getErrorMessage, logError, createFallbackData } from '../utils/errorHandler';

class NasaDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Кэш очищен');
  }

  async loadCityData(cityName, csvFileName = null) {
    // Если csvFileName не указан, ищем файл динамически
    if (!csvFileName) {
      csvFileName = await this.findCityFile(cityName);
    }

    // Check cache first
    const cacheKey = `${csvFileName}_${cityName}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Используем кэшированные данные для:', cityName);
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    try {
      const base = import.meta?.env?.BASE_URL || '/';
      const url = `${base.replace(/\/$/, '')}/nasa_weather_data/${csvFileName}`;
      
      const response = await fetchWithRetry(
        url,
        {},
        {
          maxRetries: 3,
          baseDelay: 500,
          onRetry: (attempt, maxRetries, delay, error) => {
            console.log(`Retrying data load for ${cityName} (${attempt}/${maxRetries}) after ${delay}ms. Error:`, error.message);
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Не удалось загрузить данные для ${cityName}: ${response.statusText}`);
      }

      const csvText = await response.text();
      const data = await this.parseCSVData(csvText);
      
      // Cache the data with timestamp
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      console.log('💾 Данные сохранены в кэш для:', cityName);
      return data;
    } catch (error) {
      logError(error, `loadCityData-${cityName}`);
      
      // Возвращаем fallback данные вместо выброса ошибки
      console.warn(`Using fallback data for ${cityName} due to loading error`);
      return [];
    }
  }

  async findCityFile(cityName) {
    try {
      // Проверяем кэш
      const cacheKey = `cityFile_${cityName.toLowerCase()}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      // Нормализуем название города для поиска
      const normalizedCityName = this.normalizeCityName(cityName);
      
      // Генерируем возможные варианты имени файла
      const possibleFileNames = this.generatePossibleFileNames(normalizedCityName);
      
      // Проверяем существование файлов
      for (const fileName of possibleFileNames) {
        try {
          const base = import.meta?.env?.BASE_URL || '/';
          const url = `${base.replace(/\/$/, '')}/nasa_weather_data/${fileName}`;
          
          // Проверяем существование файла через HEAD запрос
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            // Кэшируем результат
            this.cache.set(cacheKey, fileName);
            return fileName;
          }
        } catch (error) {
          // Продолжаем поиск
          continue;
        }
      }
      
      // Если файл не найден, возвращаем наиболее вероятное имя
      const fallbackFileName = `nasa_weather_${normalizedCityName.replace(/ /g, '_')}_1999_2024.csv`;
      // Кэшируем fallback результат
      this.cache.set(cacheKey, fallbackFileName);
      return fallbackFileName;
      
    } catch (error) {
      console.error('Ошибка поиска файла:', error);
      throw error;
    }
  }

  // Нормализация названия города
  normalizeCityName(cityName) {
    return cityName
      .trim()
      .replace(/\([^)]*\)/g, '') // Удаляем скобки и их содержимое
      .replace(/['"]/g, '') // Удаляем кавычки
      .replace(/\s+/g, ' ') // Нормализуем пробелы
      .trim();
  }

  // Генерация возможных имен файлов
  generatePossibleFileNames(normalizedCityName) {
    const baseName = normalizedCityName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const variants = [];
    
    // Основной вариант
    variants.push(`nasa_weather_${baseName.replace(/\s+/g, '_')}_1999_2024.csv`);
    
    // Варианты с заменой пробелов на подчеркивания
    variants.push(`nasa_weather_${baseName.replace(/\s+/g, '_')}_1999_2024.csv`);
    
    // Варианты для городов с составными названиями
    const words = baseName.split(/\s+/);
    if (words.length > 1) {
      // Соединяем слова подчеркиваниями
      variants.push(`nasa_weather_${words.join('_')}_1999_2024.csv`);
      
      // Для некоторых городов добавляем суффикс "City"
      if (!baseName.toLowerCase().includes('city')) {
        variants.push(`nasa_weather_${words.join('_')}_City_1999_2024.csv`);
      }
    }
    
    // Специальные случаи для известных городов
    const specialCases = {
      'new york': 'nasa_weather_New_York_City_1999_2024.csv',
      'mexico city': 'nasa_weather_Mexico_City_1999_2024.csv',
      'los angeles': 'nasa_weather_Los_Angeles_1999_2024.csv',
      'buenos aires': 'nasa_weather_Buenos_Aires_1999_2024.csv',
      'haines junction': 'nasa_weather_Haines_Junction_1999_2024.csv',
      'puerto williams': 'nasa_weather_Puerto_Williams_1999_2024.csv',
      'port vila': 'nasa_weather_Port_Vila_1999_2024.csv',
      'nuku alofa': 'nasa_weather_Nuku_alofa_1999_2024.csv',
      'barrow utqiagvik': 'nasa_weather_Barrow_Utqiagvik_1999_2024.csv'
    };
    
    const lowerCityName = baseName.toLowerCase();
    if (specialCases[lowerCityName]) {
      variants.unshift(specialCases[lowerCityName]); // Добавляем в начало списка
    }
    
    // Удаляем дубликаты
    return [...new Set(variants)];
  }

  parseCSVData(csvText) {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('CSV parsing failed: ' + results.errors[0].message));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  // Convert date string to Day of Year (DOY) - Python compatible
  getDayOfYear(dateString) {
    const date = new Date(dateString);
    // Используем тот же алгоритм, что и в Python: date.timetuple().tm_yday
    const start = new Date(date.getFullYear(), 0, 1); // 1 января
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1; // +1 чтобы соответствовать Python tm_yday
  }

  // Filter data by city and day of year with ±5 day window (Python compatible)
  filterDataByCityAndDOY(data, cityName, dayOfYear, window = 5) {
    const filteredData = data.filter(record => {
      const recordCity = record.CITY || record.city || '';
      const recordDOY = parseInt(record.DOY || record.doy || 0);
      
      // Улучшенная нормализация названий городов
      const normalizedRecordCity = this.normalizeCityNameForMatching(recordCity);
      const normalizedCityName = this.normalizeCityNameForMatching(cityName);
      
      // Проверяем совпадение города с улучшенной логикой
      const cityMatch = this.isCityMatch(normalizedRecordCity, normalizedCityName);
      const doyMatch = recordDOY >= (dayOfYear - window) && recordDOY <= (dayOfYear + window);
      
      return cityMatch && doyMatch;
    });
    
    return filteredData;
  }

  // Нормализация названия города для сопоставления
  normalizeCityNameForMatching(cityName) {
    return cityName
      .toLowerCase()
      .replace(/_/g, ' ') // Заменяем подчеркивания на пробелы
      .replace(/[^a-zA-Z0-9\s]/g, '') // Удаляем специальные символы
      .replace(/\s+/g, ' ') // Нормализуем пробелы
      .trim();
  }

  // Улучшенная логика сопоставления городов
  isCityMatch(recordCity, targetCity) {
    // Точное совпадение
    if (recordCity === targetCity) {
      return true;
    }
    
    // Проверяем, содержит ли одно название другое
    if (recordCity.includes(targetCity) || targetCity.includes(recordCity)) {
      return true;
    }
    
    // Специальные случаи для известных городов
    const cityMappings = {
      'new york': ['new york city', 'nyc'],
      'mexico city': ['mexico'],
      'los angeles': ['la'],
      'buenos aires': ['buenos'],
      'haines junction': ['haines'],
      'puerto williams': ['puerto'],
      'port vila': ['port'],
      'nuku alofa': ['nuku'],
      'barrow utqiagvik': ['barrow', 'utqiagvik']
    };
    
    const lowerTargetCity = targetCity.toLowerCase();
    const lowerRecordCity = recordCity.toLowerCase();
    
    // Проверяем специальные случаи
    for (const [key, variants] of Object.entries(cityMappings)) {
      if (lowerTargetCity === key) {
        for (const variant of variants) {
          if (lowerRecordCity.includes(variant) || variant.includes(lowerRecordCity)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // Get weather data for specific city and date with ±5 day window
  async getWeatherDataForDate(cityName, csvFileName = null, dateString, window = 5) {
    try {
      const allData = await this.loadCityData(cityName, csvFileName);
      const dayOfYear = this.getDayOfYear(dateString);
      const filteredData = this.filterDataByCityAndDOY(allData, cityName, dayOfYear, window);
      
      return {
        cityName,
        date: dateString,
        dayOfYear,
        window,
        data: filteredData,
        totalRecords: filteredData.length
      };
    } catch (error) {
      console.error(`Error getting weather data for ${cityName} on ${dateString}:`, error);
      throw error;
    }
  }


  // Clear cache (useful for testing or memory management)
  clearCache() {
    this.cache.clear();
  }
}

export default new NasaDataService();
