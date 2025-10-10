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
      console.log('🔍 Поиск файла для города:', cityName);
      
      // Сначала проверяем альтернативные варианты для городов с особыми названиями
      const alternatives = [
        { city: 'Barrow (Utqiagvik)', file: 'nasa_weather_Barrow_Utqiagvik_1999_2024.csv' },
        { city: 'New York', file: 'nasa_weather_New_York_City_1999_2024.csv' },
        { city: 'Mexico City', file: 'nasa_weather_Mexico_City_1999_2024.csv' },
        { city: 'Los Angeles', file: 'nasa_weather_Los_Angeles_1999_2024.csv' },
        { city: 'Buenos Aires', file: 'nasa_weather_Buenos_Aires_1999_2024.csv' },
        { city: 'Haines Junction', file: 'nasa_weather_Haines_Junction_1999_2024.csv' },
        { city: 'Puerto Williams', file: 'nasa_weather_Puerto_Williams_1999_2024.csv' },
        { city: 'Port Vila', file: 'nasa_weather_Port_Vila_1999_2024.csv' },
        { city: 'Nuku\'alofa', file: 'nasa_weather_Nuku_alofa_1999_2024.csv' }
      ];
      
      console.log('🔍 Проверяем альтернативы для:', cityName);
      
      // Ищем альтернативный файл
      const alternative = alternatives.find(alt => {
        const matches = alt.city.toLowerCase() === cityName.toLowerCase();
        console.log(`🔍 Сравнение: "${alt.city}" === "${cityName}" = ${matches}`);
        return matches;
      });
      
      if (alternative) {
        console.log(`✅ Используем альтернативный файл: ${alternative.file}`);
        return alternative.file;
      }
      
      // Если альтернатива не найдена, формируем имя файла стандартным способом
      const fileName = `nasa_weather_${cityName.replace(/ /g, '_')}_1999_2024.csv`;
      console.log(`📁 Стандартный файл: ${fileName}`);
      
      return fileName;
      
    } catch (error) {
      console.error('Ошибка поиска файла:', error);
      throw error;
    }
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
    return data.filter(record => {
      const recordCity = record.CITY || record.city || '';
      const recordDOY = parseInt(record.DOY || record.doy || 0);
      
      // Normalize city names by replacing underscores with spaces and converting to lowercase
      const normalizedRecordCity = recordCity.toLowerCase().replace(/_/g, ' ');
      const normalizedCityName = cityName.toLowerCase().replace(/_/g, ' ');
      
      // Проверяем совпадение города и попадание в окно ±window дней
      const cityMatch = normalizedRecordCity === normalizedCityName;
      const doyMatch = recordDOY >= (dayOfYear - window) && recordDOY <= (dayOfYear + window);
      
      return cityMatch && doyMatch;
    });
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
