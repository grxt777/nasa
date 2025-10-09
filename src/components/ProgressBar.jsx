import React from 'react';

const ProgressBar = ({ 
  progress = 0, 
  text = 'Загрузка...', 
  className = '',
  showPercentage = true 
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {text && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{text}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
