import React from 'react';

const AnimatedNumber = ({ 
  value, 
  duration = 2000, 
  decimals = 1, 
  prefix = '', 
  suffix = '',
  className = ''
}) => {
  const formatValue = (val) => {
    if (decimals === 0) {
      return Math.round(val).toString();
    }
    return val.toFixed(decimals);
  };

  return (
    <span className={className}>
      {prefix}{formatValue(parseFloat(value) || 0)}{suffix}
    </span>
  );
};

export default AnimatedNumber;
