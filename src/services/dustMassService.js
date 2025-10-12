import Papa from 'papaparse';

class DustMassService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.baseUrl = import.meta.env.BASE_URL || '/';
  }

  // Get dust mass data for specific city and date
  async getDustMassData(cityName, dateString) {
    try {
      const fileName = await this.findCityFile(cityName);
      const cacheKey = `dustMass_${fileName}_${dateString}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('📦 Используем кэшированные данные dust mass для:', cityName);
          return cached.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }

      const base = import.meta.env.BASE_URL || '/';
      const url = `${base.replace(/\/$/, '')}/nasa_dusmass25/${fileName}`;
      
      console.log('🌪️ Загружаем dust mass данные по URL:', url);
      const response = await fetch(url);
      console.log('📡 Ответ сервера:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to load dust mass data: ${response.status}`);
      }
      
      const csvText = await response.text();
      const data = await this.parseCSVData(csvText);
      
      // Filter data for the specific date
      const filteredData = this.filterDataByDate(data, dateString);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: filteredData,
        timestamp: Date.now()
      });
      
      console.log('💾 Dust mass данные сохранены в кэш для:', cityName);
      return filteredData;
    } catch (error) {
      console.error(`Error loading dust mass data for ${cityName}:`, error);
      throw error;
    }
  }

  async findCityFile(cityName) {
    console.log('🔍 Поиск файла dust mass для города:', cityName);
    
    // Map city names to dust mass file names
    const cityMappings = {
      'andijan': 'andijan.csv',
      'bukhara': 'bukhara.csv',
      'fergana': 'fergana.csv',
      'gulistan': 'gulistan.csv',
      'jizzakh': 'jizzakh.csv',
      'karshi': 'karshi.csv',
      'namangan': 'namangan.csv',
      'navoi': 'navoi.csv',
      'nukus': 'nukus.csv',
      'samarkand': 'samarkand.csv',
      'tashkent': 'tashkent.csv',
      'termez': 'termez.csv',
      'urgench': 'urgench.csv',
      'zarafshan': 'zarafshan.csv',
      // Additional mappings for common cities
      'london': 'tashkent.csv', // Fallback to available data
      'newyork': 'tashkent.csv',
      'tokyo': 'tashkent.csv',
      'paris': 'tashkent.csv',
      'sydney': 'tashkent.csv',
      'beijing': 'tashkent.csv',
      'cairo': 'tashkent.csv',
      'delhi': 'tashkent.csv',
      'dubai': 'tashkent.csv',
      'istanbul': 'tashkent.csv',
      'madrid': 'tashkent.csv',
      'rome': 'tashkent.csv',
      'seoul': 'tashkent.csv',
      'bangkok': 'tashkent.csv',
      'mexico': 'tashkent.csv',
      'buenos': 'tashkent.csv',
      'chicago': 'tashkent.csv'
    };

    const normalizedCityName = cityName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
    console.log('🔍 Нормализованное название:', normalizedCityName);
    
    // Try exact match first
    if (cityMappings[normalizedCityName]) {
      console.log('✅ Точное совпадение найдено:', cityMappings[normalizedCityName]);
      return cityMappings[normalizedCityName];
    }

    // Try partial matches
    for (const [key, fileName] of Object.entries(cityMappings)) {
      if (normalizedCityName.includes(key) || key.includes(normalizedCityName)) {
        console.log('✅ Частичное совпадение найдено:', fileName);
        return fileName;
      }
    }

    // Default fallback
    console.log('⚠️ Совпадение не найдено, используем fallback: tashkent.csv');
    return 'tashkent.csv';
  }

  parseCSVData(csvText) {
    return new Promise((resolve, reject) => {
      // Skip first 9 lines (metadata) and start from line 10
      const lines = csvText.split('\n');
      const dataLines = lines.slice(9); // Skip first 9 lines
      const csvDataOnly = dataLines.join('\n');
      
      Papa.parse(csvDataOnly, {
        header: false, // Нет заголовков в CSV
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('CSV parsing failed: ' + results.errors[0].message));
          } else {
            console.log('📊 CSV parsed successfully:', results.data.length, 'records');
            
            // Преобразуем данные в нужный формат
            const formattedData = results.data.map(row => ({
              time: row[0], // Первая колонка - время
              mean_M2T1NXAER_5_12_4_DUSMASS25: row[1] // Вторая колонка - значение
            }));
            
            resolve(formattedData);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  filterDataByDate(data, dateString) {
    console.log('🔍 Фильтрация dust mass данных для дня года:', dateString);
    console.log('📊 Всего записей для фильтрации:', data.length);
    
    const targetDate = new Date(dateString);
    const targetMonth = targetDate.getMonth() + 1; // 1-12
    const targetDay = targetDate.getDate(); // 1-31
    console.log('🎯 Целевой день года:', `${targetMonth}-${targetDay}`);
    
    const filteredData = data.filter(record => {
      if (!record.time || !record.mean_M2T1NXAER_5_12_4_DUSMASS25) {
        return false;
      }
      
      // Парсим дату из формата "1999-01-01 00:30:00"
      const dateTimeStr = record.time;
      const datePart = dateTimeStr.split(' ')[0]; // "1999-01-01"
      const [year, month, day] = datePart.split('-').map(Number);
      
      // Собираем все данные за этот день года (месяц-день) с 1999 по 2025
      return month === targetMonth && day === targetDay;
    });

    console.log('✅ Отфильтровано записей за день года:', filteredData.length);
    
    if (filteredData.length > 0) {
      console.log('📋 Пример отфильтрованной записи:', filteredData[0]);
    } else {
      console.log('⚠️ Нет данных для фильтрации! Проверьте:');
      console.log('  - Город:', cityName);
      console.log('  - Дата:', dateString);
      console.log('  - Целевой день года:', `${targetMonth}-${targetDay}`);
      console.log('  - Всего записей в файле:', data.length);
    }

    // Convert to our format
    const result = filteredData.map(record => {
      // Парсим дату из формата "1999-01-01 00:30:00"
      const dateTimeStr = record.time;
      const [datePart, timePart] = dateTimeStr.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      
      const value = parseFloat(record.mean_M2T1NXAER_5_12_4_DUSMASS25);
      
      return {
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, // HH:MM format
        value: isNaN(value) ? 0 : value,
        timestamp: new Date(year, month - 1, day, hour, minute).getTime(),
        year: year,
        month: month,
        day: day
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
    
    console.log('📈 Итоговый результат:', result.length, 'записей за день года');
    return result;
  }


  // Calculate dust storm risk based on historical data for the same day of year
  calculateRiskLevel(dustMassData) {
    if (!dustMassData || dustMassData.length === 0) {
      return { level: 'Low', color: 'green', description: 'No data available' };
    }

    const values = dustMassData.map(d => d.value);
    const maxValue = Math.max(...values);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const minValue = Math.min(...values);
    
    // Статистика по годам
    const years = [...new Set(dustMassData.map(d => d.year))].sort();
    const yearsCount = years.length;
    
    // Среднее значение по часам (агрегация всех лет)
    const hourlyAverages = {};
    dustMassData.forEach(d => {
      if (!hourlyAverages[d.time]) {
        hourlyAverages[d.time] = [];
      }
      hourlyAverages[d.time].push(d.value);
    });
    
    const hourlyStats = Object.entries(hourlyAverages).map(([time, values]) => ({
      time,
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values)
    })).sort((a, b) => a.time.localeCompare(b.time));
    
    console.log('📊 Hourly stats созданы:', hourlyStats.length, 'часов');
    console.log('⏰ Первые 3 часа:', hourlyStats.slice(0, 3));
    
    const threshold = 1.0e-08; // NASA MERRA2 threshold
    
    // Определяем уровень риска на основе максимального значения за все годы
    let level, color, description;
    
    if (maxValue > 3 * threshold) {
      level = 'High';
      color = 'red';
      description = 'High risk of dust storm';
    } else if (maxValue > 2 * threshold) {
      level = 'Moderate';
      color = 'yellow';
      description = 'Moderate risk of dust storm';
    } else {
      level = 'Low';
      color = 'green';
      description = 'Low risk of dust storm';
    }

    // Находим час с максимальным средним значением за все годы
    const peakHour = hourlyStats.reduce((max, current) => 
      current.avg > max.avg ? current : max
    );
    
    console.log('🔍 Поиск пикового часа:');
    console.log('📊 Статистика по часам:', hourlyStats.slice(0, 5)); // Первые 5 часов
    console.log('⏰ Пиковый час:', peakHour);

    return {
      level,
      color,
      description,
      maxValue,
      avgValue,
      minValue,
      expectedStart: peakHour.time,
      threshold,
      yearsCount,
      hourlyStats,
      years: years
    };
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Dust mass кэш очищен');
  }
}

export default new DustMassService();
