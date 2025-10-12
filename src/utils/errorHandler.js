/**
 * Утилиты для обработки ошибок и retry-логики
 */

// Типы ошибок
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Конфигурация retry
export const RetryConfig = {
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_DELAY: 1000,
  DEFAULT_BACKOFF_MULTIPLIER: 2,
  MAX_DELAY: 10000
};

/**
 * Создает задержку
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Вычисляет задержку с экспоненциальным backoff
 */
const calculateDelay = (attempt, baseDelay = RetryConfig.DEFAULT_DELAY) => {
  const delay = baseDelay * Math.pow(RetryConfig.DEFAULT_BACKOFF_MULTIPLIER, attempt - 1);
  return Math.min(delay, RetryConfig.MAX_DELAY);
};

/**
 * Определяет, стоит ли повторять запрос на основе ошибки
 */
const shouldRetry = (error, attempt, maxRetries) => {
  if (attempt >= maxRetries) return false;
  
  // Повторяем для сетевых ошибок и временных проблем с API
  if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
  if (error.message?.includes('NetworkError')) return true;
  if (error.message?.includes('Failed to fetch')) return true;
  if (error.status >= 500) return true; // Серверные ошибки
  if (error.status === 429) return true; // Rate limiting
  if (error.status === 408) return true; // Timeout
  
  return false;
};

/**
 * Выполняет запрос с retry-логикой
 */
export const fetchWithRetry = async (
  url, 
  options = {}, 
  retryConfig = {}
) => {
  const {
    maxRetries = RetryConfig.DEFAULT_MAX_RETRIES,
    baseDelay = RetryConfig.DEFAULT_DELAY,
    onRetry = null
  } = retryConfig;

  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        
        if (shouldRetry(error, attempt, maxRetries)) {
          lastError = error;
          const delayMs = calculateDelay(attempt, baseDelay);
          
          if (onRetry) {
            onRetry(attempt, maxRetries, delayMs, error);
          }
          
          await delay(delayMs);
          continue;
        }
        
        throw error;
      }
      
      return response;
      
    } catch (error) {
      lastError = error;
      
      // Обработка AbortError (timeout)
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Запрос превысил время ожидания');
        timeoutError.type = ErrorTypes.TIMEOUT;
        timeoutError.originalError = error;
        
        if (shouldRetry(timeoutError, attempt, maxRetries)) {
          const delayMs = calculateDelay(attempt, baseDelay);
          
          if (onRetry) {
            onRetry(attempt, maxRetries, delayMs, timeoutError);
          }
          
          await delay(delayMs);
          continue;
        }
        
        throw timeoutError;
      }
      
      // Обработка сетевых ошибок
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Проблемы с сетевым подключением');
        networkError.type = ErrorTypes.NETWORK;
        networkError.originalError = error;
        
        if (shouldRetry(networkError, attempt, maxRetries)) {
          const delayMs = calculateDelay(attempt, baseDelay);
          
          if (onRetry) {
            onRetry(attempt, maxRetries, delayMs, networkError);
          }
          
          await delay(delayMs);
          continue;
        }
        
        throw networkError;
      }
      
      // Если не стоит повторять, выбрасываем ошибку
      if (!shouldRetry(error, attempt, maxRetries)) {
        throw error;
      }
      
      // Повторяем запрос
      const delayMs = calculateDelay(attempt, baseDelay);
      
      if (onRetry) {
        onRetry(attempt, maxRetries, delayMs, error);
      }
      
      await delay(delayMs);
    }
  }
  
  // Если дошли сюда, значит все попытки исчерпаны
  throw lastError;
};

/**
 * Классифицирует ошибку по типу
 */
export const classifyError = (error) => {
  if (error.type) return error.type;
  
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return ErrorTypes.TIMEOUT;
  }
  
  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return ErrorTypes.NETWORK;
  }
  
  if (error.status >= 400 && error.status < 500) {
    return ErrorTypes.VALIDATION;
  }
  
  if (error.status >= 500) {
    return ErrorTypes.API;
  }
  
  return ErrorTypes.UNKNOWN;
};

/**
 * Получает пользовательское сообщение об ошибке
 */
export const getErrorMessage = (error, context = '') => {
  const errorType = classifyError(error);
  
  const messages = {
    [ErrorTypes.NETWORK]: 'Проблемы с сетевым подключением. Проверьте интернет-соединение и попробуйте снова.',
    [ErrorTypes.API]: 'Ошибка сервера. Попробуйте позже или обратитесь в поддержку.',
    [ErrorTypes.VALIDATION]: 'Некорректные данные. Проверьте введенную информацию.',
    [ErrorTypes.TIMEOUT]: 'Запрос превысил время ожидания. Попробуйте снова.',
    [ErrorTypes.UNKNOWN]: 'Произошла неизвестная ошибка. Попробуйте обновить страницу.'
  };
  
  let message = messages[errorType] || messages[ErrorTypes.UNKNOWN];
  
  // Добавляем контекст если есть
  if (context) {
    message = `${context}: ${message}`;
  }
  
  // Добавляем детали для разработчиков в development режиме
  if (import.meta.env.DEV && error.message) {
    message += ` (${error.message})`;
  }
  
  return message;
};

/**
 * Логирует ошибку для отладки
 */
export const logError = (error, context = '') => {
  const errorInfo = {
    message: error.message,
    type: classifyError(error),
    status: error.status,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack
  };
  
  console.error('Error occurred:', errorInfo);
  
  // В production можно отправлять ошибки в сервис мониторинга
  if (import.meta.env.PROD) {
    // TODO: Интеграция с Sentry или другим сервисом мониторинга
  }
};

/**
 * Создает fallback-данные для различных компонентов
 */
export const createFallbackData = (type) => {
  const fallbacks = {
    weatherData: {
      temperature: { average: 0, min: 0, max: 0, median: 0, stdDev: 0 },
      precipitation: { probability: 0, average: 0, max: 0, median: 0, stdDev: 0 },
      humidity: { average: 0, min: 0, max: 0, median: 0, stdDev: 0 },
      wind: { average: 0, max: 0, median: 0, stdDev: 0 },
      uv: { average: 0, max: 0, median: 0, stdDev: 0 },
      soilMoisture: { average: 0, min: 0, max: 0, median: 0, stdDev: 0 },
      comfort: { score: 0 },
      years: 0,
      dataQuality: { completeness: 0, reliability: 0 }
    },
    trendData: {
      labels: [],
      values: []
    },
    aiAnalysis: 'Анализ временно недоступен. Попробуйте позже.',
    alternativeDates: 'Альтернативные даты временно недоступны. Попробуйте позже.',
    climateInsights: 'Климатический анализ временно недоступен. Попробуйте позже.',
    dustStormAnalysis: 'Анализ пыльных бурь временно недоступен. Попробуйте позже.'
  };
  
  return fallbacks[type] || null;
};
