import { useState, useEffect } from 'react';

/**
 * Hook для дебаунса значений
 * @param {any} value - значение для дебаунса
 * @param {number} delay - задержка в миллисекундах
 * @returns {any} - дебаунсированное значение
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook для дебаунса функций
 * @param {Function} callback - функция для дебаунса
 * @param {number} delay - задержка в миллисекундах
 * @returns {Function} - дебаунсированная функция
 */
export const useDebouncedCallback = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState(null);

  const debouncedCallback = (...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(newTimer);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
};

export default useDebounce;
