import { useState, useEffect, useRef } from 'react';

const AnimatedNumber = ({ 
  value, 
  duration = 2000, 
  decimals = 1, 
  prefix = '', 
  suffix = '',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          if (!hasAnimated) {
            startAnimation();
            setHasAnimated(true);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, hasAnimated]);

  const startAnimation = () => {
    const startTime = performance.now();
    const startValue = 0;
    const endValue = parseFloat(value) || 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Используем easing функцию для более плавной анимации
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Обновляем значение без анимации при изменении данных
  useEffect(() => {
    if (hasAnimated) {
      setDisplayValue(parseFloat(value) || 0);
    }
  }, [value, hasAnimated]);

  const formatValue = (val) => {
    if (decimals === 0) {
      return Math.round(val).toString();
    }
    return val.toFixed(decimals);
  };

  return (
    <span ref={elementRef} className={className}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
};

export default AnimatedNumber;
