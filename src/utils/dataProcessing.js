import Papa from 'papaparse';
import { mean, standardDeviation, linearRegression, median } from 'simple-statistics';

export const parseCSVData = (csvText) => {
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
};

// Convert date to Day of Year (DOY) - Python compatible
export const getDayOfYear = (dateString) => {
  const date = new Date(dateString);
  // Используем тот же алгоритм, что и в Python: date.timetuple().tm_yday
  const start = new Date(date.getFullYear(), 0, 1); // 1 января
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1; // +1 чтобы соответствовать Python tm_yday
};

// Filter data by city and day of year with ±5 day window (Python compatible)
export const filterDataByCityAndDOY = (data, cityName, dayOfYear, window = 5) => {
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
};

export const calculateWeatherProbabilities = (filteredData, dateString = null) => {
  if (!filteredData || filteredData.length === 0) {
    return {
      temperature: { probability: 0, average: 0, min: 0, max: 0, median: 0, stdDev: 0 },
      precipitation: { probability: 0, average: 0, max: 0, median: 0, stdDev: 0 },
      humidity: { average: 0, min: 0, max: 0, median: 0, stdDev: 0 },
      wind: { average: 0, max: 0, median: 0, stdDev: 0 },
      uv: { average: 0, max: 0, median: 0, stdDev: 0 },
      comfort: { score: 0 },
      years: 0,
      dataQuality: { completeness: 0, reliability: 0 }
    };
  }

  // Extract numeric values from filtered data (NASA format)
  const maxTemps = filteredData.map(d => parseFloat(d.T2M_MAX) || 0).filter(t => !isNaN(t) && t !== 0);
  const minTemps = filteredData.map(d => parseFloat(d.T2M_MIN) || 0).filter(t => !isNaN(t) && t !== 0);
  const temperatures = filteredData.map(d => {
    const maxTemp = parseFloat(d.T2M_MAX) || 0;
    const minTemp = parseFloat(d.T2M_MIN) || 0;
    return (maxTemp + minTemp) / 2; // Average temperature
  }).filter(t => !isNaN(t) && t !== 0);
  
  const precipitations = filteredData.map(d => parseFloat(d.PRECTOTCORR) || 0).filter(p => !isNaN(p));
  const humidities = filteredData.map(d => parseFloat(d.RH2M) || 0).filter(h => !isNaN(h));
  const winds = filteredData.map(d => parseFloat(d.WS2M) || 0).filter(w => !isNaN(w));
  const uvIndices = filteredData.map(d => {
    const uv = parseFloat(d.ALLSKY_SFC_UV_INDEX) || 0;
    return uv === -999.0 ? 0 : uv; // Handle missing UV data
  }).filter(u => !isNaN(u));

  // Calculate soil moisture using empirical formula
  const soilMoistures = filteredData.map(d => {
    const T = (parseFloat(d.T2M_MAX) + parseFloat(d.T2M_MIN)) / 2; // Average temperature
    const RH = parseFloat(d.RH2M) || 0; // Relative humidity %
    const P = parseFloat(d.PRECTOTCORR) || 0; // Precipitation mm/day
    const W = parseFloat(d.WS2M) || 0; // Wind speed m/s
    
    // Empirical evaporation estimation (mm/day)
    const ET = 0.0023 * (T + 17.8) * Math.sqrt(Math.abs(T)) * (1 - RH / 100) * (1 + 0.1 * W);
    
    // Approximate soil moisture (mm)
    const SM = Math.max(-10, Math.min(30, P - ET)); // Clamp between -10 and 30
    
    return SM;
  }).filter(sm => !isNaN(sm));

  // Calculate probabilities based on historical data for this specific day
  const heatProbability = temperatures.length > 0 
    ? (temperatures.filter(t => t > 30).length / temperatures.length) * 100 
    : 0;
  
  const coldProbability = temperatures.length > 0 
    ? (temperatures.filter(t => t < -10).length / temperatures.length) * 100 
    : 0;
  
  const rainProbability = precipitations.length > 0 
    ? (precipitations.filter(p => p > 5).length / precipitations.length) * 100 
    : 0;

  // Calculate comprehensive statistics
  const avgTemp = temperatures.length > 0 ? mean(temperatures) : 0;
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;
  const medianTemp = temperatures.length > 0 ? median(temperatures) : 0;
  const stdDevTemp = temperatures.length > 0 ? standardDeviation(temperatures) : 0;
  
  const avgPrecip = precipitations.length > 0 ? mean(precipitations) : 0;
  const maxPrecip = precipitations.length > 0 ? Math.max(...precipitations) : 0;
  const medianPrecip = precipitations.length > 0 ? median(precipitations) : 0;
  const stdDevPrecip = precipitations.length > 0 ? standardDeviation(precipitations) : 0;
  
  const avgHumidity = humidities.length > 0 ? mean(humidities) : 0;
  const minHumidity = humidities.length > 0 ? Math.min(...humidities) : 0;
  const maxHumidity = humidities.length > 0 ? Math.max(...humidities) : 0;
  const medianHumidity = humidities.length > 0 ? median(humidities) : 0;
  const stdDevHumidity = humidities.length > 0 ? standardDeviation(humidities) : 0;
  
  const avgWind = winds.length > 0 ? mean(winds) : 0;
  const maxWind = winds.length > 0 ? Math.max(...winds) : 0;
  const medianWind = winds.length > 0 ? median(winds) : 0;
  const stdDevWind = winds.length > 0 ? standardDeviation(winds) : 0;
  
  const avgUV = uvIndices.length > 0 ? mean(uvIndices) : 0;
  const maxUV = uvIndices.length > 0 ? Math.max(...uvIndices) : 0;
  const medianUV = uvIndices.length > 0 ? median(uvIndices) : 0;
  const stdDevUV = uvIndices.length > 0 ? standardDeviation(uvIndices) : 0;

  const avgSoilMoisture = soilMoistures.length > 0 ? mean(soilMoistures) : 0;
  const minSoilMoisture = soilMoistures.length > 0 ? Math.min(...soilMoistures) : 0;
  const maxSoilMoisture = soilMoistures.length > 0 ? Math.max(...soilMoistures) : 0;
  const medianSoilMoisture = soilMoistures.length > 0 ? median(soilMoistures) : 0;
  const stdDevSoilMoisture = soilMoistures.length > 0 ? standardDeviation(soilMoistures) : 0;

  // Calculate data quality metrics
  const totalExpectedData = filteredData.length * 7; // 7 main metrics (including soil moisture)
  const actualDataPoints = temperatures.length + precipitations.length + humidities.length + winds.length + uvIndices.length + soilMoistures.length;
  const completeness = (actualDataPoints / totalExpectedData) * 100;
  const reliability = completeness > 80 ? 95 : completeness > 60 ? 85 : 70;

  // Calculate comfort score (0-10)
  const comfortScore = calculateComfortScore(avgTemp, avgHumidity, avgWind, avgUV, dateString);

  return {
    temperature: { 
      probability: Math.max(heatProbability, coldProbability), 
      average: Math.round(avgTemp * 10) / 10,
      min: Math.round(minTemp * 10) / 10,
      max: Math.round(maxTemp * 10) / 10,
      median: Math.round(medianTemp * 10) / 10,
      stdDev: Math.round(stdDevTemp * 10) / 10
    },
    precipitation: { 
      probability: Math.round(rainProbability * 10) / 10, 
      average: Math.round(avgPrecip * 10) / 10,
      max: Math.round(maxPrecip * 10) / 10,
      median: Math.round(medianPrecip * 10) / 10,
      stdDev: Math.round(stdDevPrecip * 10) / 10
    },
    humidity: { 
      average: Math.round(avgHumidity * 10) / 10,
      min: Math.round(minHumidity * 10) / 10,
      max: Math.round(maxHumidity * 10) / 10,
      median: Math.round(medianHumidity * 10) / 10,
      stdDev: Math.round(stdDevHumidity * 10) / 10
    },
    wind: { 
      average: Math.round(avgWind * 10) / 10,
      max: Math.round(maxWind * 10) / 10,
      median: Math.round(medianWind * 10) / 10,
      stdDev: Math.round(stdDevWind * 10) / 10
    },
    uv: { 
      average: Math.round(avgUV * 10) / 10,
      max: Math.round(maxUV * 10) / 10,
      median: Math.round(medianUV * 10) / 10,
      stdDev: Math.round(stdDevUV * 10) / 10
    },
    soilMoisture: { 
      average: Math.round(avgSoilMoisture * 10) / 10,
      min: Math.round(minSoilMoisture * 10) / 10,
      max: Math.round(maxSoilMoisture * 10) / 10,
      median: Math.round(medianSoilMoisture * 10) / 10,
      stdDev: Math.round(stdDevSoilMoisture * 10) / 10
    },
    comfort: { score: Math.round(comfortScore * 10) / 10 },
    years: filteredData.length,
    dataQuality: {
      completeness: Math.round(completeness * 10) / 10,
      reliability: Math.round(reliability * 10) / 10
    }
  };
};

const calculateComfortScore = (temp, humidity, wind, uv, dateString = null) => {
  let score = 10;
  
  // Определяем сезон по дате
  let month = 6; // по умолчанию лето
  if (dateString) {
    const date = new Date(dateString);
    month = date.getMonth() + 1; // 1-12
  }
  
  // Сезонные весовые коэффициенты
  let tempWeight = 1.0;
  let humidityWeight = 1.0;
  let windWeight = 1.0;
  let uvWeight = 1.0;
  
  // Зима (декабрь, январь, февраль) - ветер и влажность критичнее
  if ([12, 1, 2].includes(month)) {
    windWeight = 1.5;
    humidityWeight = 1.3;
  }
  // Лето (июнь, июль, август) - УФ и жара критичнее
  else if ([6, 7, 8].includes(month)) {
    uvWeight = 1.5;
    tempWeight = 1.3;
  }

  // Проверка на экстремальные условия
  if (temp > 40 || uv > 10 || wind > 20 || temp < -20) {
    return 2; // Форсированная низкая оценка для экстремальных условий
  }

  // Temperature factor (optimal range: 18-24°C)
  let tempPenalty = 0;
  if (temp < 10 || temp > 30) tempPenalty = 3;
  else if (temp < 15 || temp > 25) tempPenalty = 2;
  else if (temp < 18 || temp > 24) tempPenalty = 1;
  score -= tempPenalty * tempWeight;

  // Humidity factor (optimal range: 40-60%)
  let humidityPenalty = 0;
  if (humidity < 30 || humidity > 80) humidityPenalty = 2;
  else if (humidity < 40 || humidity > 60) humidityPenalty = 1;
  score -= humidityPenalty * humidityWeight;

  // Wind factor (optimal range: 2-8 m/s)
  let windPenalty = 0;
  if (wind < 1 || wind > 15) windPenalty = 2;
  else if (wind < 2 || wind > 10) windPenalty = 1;
  score -= windPenalty * windWeight;

  // UV factor (optimal range: 2-6)
  let uvPenalty = 0;
  if (uv < 1 || uv > 8) uvPenalty = 1;
  score -= uvPenalty * uvWeight;

  // Мягкое сглаживание для более реалистичного распределения
  const totalPenalty = tempPenalty * tempWeight + humidityPenalty * humidityWeight + 
                      windPenalty * windWeight + uvPenalty * uvWeight;
  score = Math.min(10, Math.max(0, 10 - totalPenalty * 0.9));

  return Math.max(0, Math.min(10, score));
};

export const generateTrendData = (data, variable) => {
  if (!data || data.length === 0) return { labels: [], values: [] };

  // Group data by year
  const yearlyData = {};
  data.forEach(record => {
    const year = parseInt(record.YEAR) || 0;
    if (!yearlyData[year]) {
      yearlyData[year] = [];
    }
    yearlyData[year].push(record);
  });

  // Calculate yearly averages
  const years = Object.keys(yearlyData).sort((a, b) => parseInt(a) - parseInt(b));
  const values = years.map(year => {
    const yearData = yearlyData[year];
    const variableData = yearData.map(d => {
      if (variable === 'T2M_MAX') {
        return parseFloat(d.T2M_MAX) || 0;
      } else if (variable === 'T2M_MIN') {
        return parseFloat(d.T2M_MIN) || 0;
      } else if (variable === 'T2M_AVG') {
        const max = parseFloat(d.T2M_MAX) || 0;
        const min = parseFloat(d.T2M_MIN) || 0;
        return (max + min) / 2;
      } else {
        return parseFloat(d[variable]) || 0;
      }
    }).filter(v => !isNaN(v) && v !== 0);
    return variableData.length > 0 ? mean(variableData) : 0;
  });

  return {
    labels: years,
    values: values
  };
};

export const calculateLinearRegression = (x, y) => {
  if (x.length !== y.length || x.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);

  return { slope, intercept, r2 };
};

export const formatWeatherData = (data) => {
  if (!data) return null;

  return {
    temperature: {
      probability: data.temperature?.probability || 0,
      average: data.temperature?.average || 0,
      unit: '%'
    },
    precipitation: {
      probability: data.precipitation?.probability || 0,
      average: data.precipitation?.average || 0,
      unit: 'mm'
    },
    humidity: {
      average: data.humidity?.average || 0,
      unit: '%'
    },
    wind: {
      average: data.wind?.average || 0,
      unit: 'm/s'
    },
    uv: {
      average: data.uv?.average || 0,
      unit: ''
    },
    comfort: {
      score: data.comfort?.score || 0,
      unit: '/10'
    }
  };
};

// Calculates detailed weather statistics similar to the provided Python logic
export const calculateDetailedWeatherStats = (filteredData) => {
  if (!filteredData || filteredData.length === 0) {
    return {
      temp_avg: 0,
      temp_std: 0,
      hot_prob: 0,
      cold_prob: 0,
      temp_trend: [],
      rain_avg: 0,
      rain_prob: 0,
      heavy_prob: 0,
      rain_trend: [],
      rh_avg: 0,
      very_humid: 0,
      wind_avg: 0,
      strong_wind: 0,
      wind_trend: [],
      uv_avg: 0,
      uv_high: 0,
      uv_extreme: 0
    };
  }

  // Helper to group by year
  const groupByYear = (data, field) => {
    const yearly = {};
    data.forEach(d => {
      const year = d.YEAR;
      if (!yearly[year]) yearly[year] = [];
      yearly[year].push(parseFloat(d[field]));
    });
    return yearly;
  };

  // 1️⃣ Temperature
  const t_max = filteredData.map(d => parseFloat(d.T2M_MAX)).filter(v => !isNaN(v));
  const t_min = filteredData.map(d => parseFloat(d.T2M_MIN)).filter(v => !isNaN(v));
  
  // Calculate average temperature as mean of max and min temperatures
  const temperatures = filteredData.map(d => {
    const maxTemp = parseFloat(d.T2M_MAX) || 0;
    const minTemp = parseFloat(d.T2M_MIN) || 0;
    return (maxTemp + minTemp) / 2; // Average temperature
  }).filter(t => !isNaN(t) && t !== 0);
  
  const temp_avg = temperatures.length ? mean(temperatures) : 0;
  const temp_std = temperatures.length ? standardDeviation(temperatures) : 0;
  const hot_prob = temperatures.length ? (temperatures.filter(v => v > 35).length / temperatures.length) * 100 : 0;
  const cold_prob = temperatures.length ? (temperatures.filter(v => v < 5).length / temperatures.length) * 100 : 0;
  // Trend: last 7 years - calculate average temperature for each year
  const tempByYear = {};
  filteredData.forEach(d => {
    const year = d.YEAR;
    const maxTemp = parseFloat(d.T2M_MAX) || 0;
    const minTemp = parseFloat(d.T2M_MIN) || 0;
    const avgTemp = (maxTemp + minTemp) / 2;
    if (!tempByYear[year]) tempByYear[year] = [];
    tempByYear[year].push(avgTemp);
  });
  
  const temp_trend = Object.keys(tempByYear)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .slice(-7)
    .map(year => mean(tempByYear[year]));

  // 2️⃣ Precipitation
  const rain = filteredData.map(d => parseFloat(d.PRECTOTCORR)).filter(v => !isNaN(v));
  const rain_avg = rain.length ? mean(rain) : 0;
  const rain_prob = rain.length ? (rain.filter(v => v > 1).length / rain.length) * 100 : 0;
  const heavy_prob = rain.length ? (rain.filter(v => v > 10).length / rain.length) * 100 : 0;
  const rainByYear = groupByYear(filteredData, 'PRECTOTCORR');
  const rain_trend = Object.keys(rainByYear)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .slice(-7)
    .map(year => mean(rainByYear[year]));

  // 3️⃣ Humidity
  const humidity = filteredData.map(d => parseFloat(d.RH2M)).filter(v => !isNaN(v));
  const rh_avg = humidity.length ? mean(humidity) : 0;
  const very_humid = humidity.length ? (humidity.filter(v => v > 80).length / humidity.length) * 100 : 0;

  // 4️⃣ Wind
  const wind = filteredData.map(d => parseFloat(d.WS2M)).filter(v => !isNaN(v));
  const wind_avg = wind.length ? mean(wind) : 0;
  const strong_wind = wind.length ? (wind.filter(v => v > 10).length / wind.length) * 100 : 0;
  const windByYear = groupByYear(filteredData, 'WS2M');
  const wind_trend = Object.keys(windByYear)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .slice(-7)
    .map(year => mean(windByYear[year]));

  // 5️⃣ UV index (exclude -999)
  const uv = filteredData
    .map(d => parseFloat(d.ALLSKY_SFC_UV_INDEX))
    .filter(v => !isNaN(v) && v !== -999);
  let uv_avg, uv_high, uv_extreme;
  if (uv.length > 0) {
    uv_avg = mean(uv);
    uv_high = (uv.filter(v => v >= 6).length / uv.length) * 100;
    uv_extreme = (uv.filter(v => v >= 11).length / uv.length) * 100;
  } else {
    uv_avg = 0;
    uv_high = 0;
    uv_extreme = 0;
  }

  return {
    temp_avg,
    temp_std,
    hot_prob,
    cold_prob,
    temp_trend,
    rain_avg,
    rain_prob,
    heavy_prob,
    rain_trend,
    rh_avg,
    very_humid,
    wind_avg,
    strong_wind,
    wind_trend,
    uv_avg,
    uv_high,
    uv_extreme
  };
};

// loadCityData function removed - it used Node.js fs and path modules
// This functionality is now handled by nasaDataService.js in the browser

/**
 * Returns all records within ±window days of year for all years, for a given date string (YYYY-MM-DD).
 * Python compatible implementation.
 */
export const getDayWindow = (data, dateStr, window = 5) => {
  const targetDOY = getDayOfYear(dateStr);
  return data.filter(record => {
    const doy = parseInt(record.DOY || record.doy || 0);
    return doy >= (targetDOY - window) && doy <= (targetDOY + window);
  });
};
