import Papa from 'papaparse';

class NasaDataService {
  constructor() {
    this.cache = new Map();
  }

  async loadCityData(cityName, csvFileName) {
    // Check cache first
    if (this.cache.has(csvFileName)) {
      return this.cache.get(csvFileName);
    }

    try {
      const response = await fetch(`/nasa_weather_data/${csvFileName}`);
      if (!response.ok) {
        throw new Error(`Failed to load data for ${cityName}: ${response.statusText}`);
      }

      const csvText = await response.text();
      const data = await this.parseCSVData(csvText);
      
      // Cache the data
      this.cache.set(csvFileName, data);
      return data;
    } catch (error) {
      console.error(`Error loading data for ${cityName}:`, error);
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
  async getWeatherDataForDate(cityName, csvFileName, dateString, window = 5) {
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
