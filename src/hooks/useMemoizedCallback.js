import { useCallback, useRef } from 'react';

/**
 * Hook для мемоизации функций с глубоким сравнением зависимостей
 * @param {Function} callback - функция для мемоизации
 * @param {Array} deps - массив зависимостей
 * @returns {Function} - мемоизированная функция
 */
export const useMemoizedCallback = (callback, deps) => {
  const ref = useRef();
  
  // Глубокое сравнение зависимостей
  const depsChanged = !ref.current || 
    deps.length !== ref.current.deps.length ||
    deps.some((dep, index) => {
      const prevDep = ref.current.deps[index];
      return dep !== prevDep && 
        (typeof dep === 'object' ? JSON.stringify(dep) !== JSON.stringify(prevDep) : true);
    });

  if (depsChanged) {
    ref.current = {
      callback,
      deps: [...deps]
    };
  }

  return ref.current.callback;
};

/**
 * Hook для мемоизации значений с глубоким сравнением
 * @param {Function} factory - функция для создания значения
 * @param {Array} deps - массив зависимостей
 * @returns {any} - мемоизированное значение
 */
export const useDeepMemo = (factory, deps) => {
  const ref = useRef();
  
  const depsChanged = !ref.current || 
    deps.length !== ref.current.deps.length ||
    deps.some((dep, index) => {
      const prevDep = ref.current.deps[index];
      return dep !== prevDep && 
        (typeof dep === 'object' ? JSON.stringify(dep) !== JSON.stringify(prevDep) : true);
    });

  if (depsChanged) {
    ref.current = {
      value: factory(),
      deps: [...deps]
    };
  }

  return ref.current.value;
};

export default useMemoizedCallback;
