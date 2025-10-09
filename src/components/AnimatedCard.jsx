import { useState, useEffect, useRef } from 'react';

const AnimatedCard = ({ 
  children, 
  direction = 'left', 
  delay = 0, 
  duration = 600,
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          if (!hasAnimated) {
            // Задержка перед началом анимации
            setTimeout(() => {
              setIsAnimated(true);
              setHasAnimated(true);
            }, delay);
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
    };
  }, [isVisible, delay, hasAnimated]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'left':
        return 'translateX(-100px)';
      case 'right':
        return 'translateX(100px)';
      case 'top':
        return 'translateY(-100px)';
      case 'bottom':
        return 'translateY(100px)';
      case 'scale':
        return 'scale(0.8)';
      default:
        return 'translateX(-100px)';
    }
  };

  const getFinalTransform = () => {
    return 'translateX(0) translateY(0) scale(1)';
  };

  const cardStyle = {
    transform: isAnimated ? getFinalTransform() : getInitialTransform(),
    opacity: isAnimated ? 1 : 0,
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return (
    <div
      ref={elementRef}
      style={cardStyle}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
