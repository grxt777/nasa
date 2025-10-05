import React from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SuitabilityAssessment = ({ weatherData }) => {
  if (!weatherData) {
    return null;
  }

  const comfortScore = weatherData.comfort?.score || 0;
  
  const getComfortDescription = (score) => {
    if (score >= 8) return 'Отличные условия для прогулок и мероприятий';
    if (score >= 6) return 'Комфортно, возможны лёгкие неудобства';
    if (score >= 4) return 'Допустимо, но стоит быть осторожным';
    if (score >= 2) return 'Вероятно, жара/холод/высокая влажность';
    return 'Не рекомендуется выходить на улицу';
  };

  const getComfortColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComfortBgColor = (score) => {
    if (score >= 8) return 'bg-green-50';
    if (score >= 6) return 'bg-blue-50';
    if (score >= 4) return 'bg-yellow-50';
    if (score >= 2) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getComfortBorderColor = (score) => {
    if (score >= 8) return 'border-green-200';
    if (score >= 6) return 'border-blue-200';
    if (score >= 4) return 'border-yellow-200';
    if (score >= 2) return 'border-orange-200';
    return 'border-red-200';
  };

  const getTrendIcon = (score) => {
    if (score >= 8) return TrendingUp;
    if (score >= 4) return Minus;
    return TrendingDown;
  };

  const getTrendColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = (score) => {
    if (score >= 8) return '🌤 Отлично';
    if (score >= 6) return '🙂 Хорошо';
    if (score >= 4) return '😐 Нормально';
    if (score >= 2) return '⚠️ Неудобно';
    return '🚫 Экстремально';
  };

  const TrendIcon = getTrendIcon(comfortScore);

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${getComfortBorderColor(comfortScore)} p-8 mb-8`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${getComfortBgColor(comfortScore)}`}>
            <Gauge className={`w-8 h-8 ${getComfortColor(comfortScore)}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Оценка пригодности</h2>
            <p className="text-sm text-gray-500">Общий балл комфорта для мероприятий на открытом воздухе</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${getTrendColor(comfortScore)}`}>
          <TrendIcon className="w-6 h-6" />
          <span className="text-sm font-medium">
            {getStatusText(comfortScore)}
          </span>
        </div>
      </div>

      <div className="text-center">
        <div className={`text-6xl font-bold ${getComfortColor(comfortScore)} mb-2`}>
          {comfortScore.toFixed(1)}
        </div>
        <div className="text-lg text-gray-600">из 10</div>
        <div className={`text-sm font-medium ${getComfortColor(comfortScore)} mt-2`}>
          {getComfortDescription(comfortScore)}
        </div>
      </div>
    </div>
  );
};

export default SuitabilityAssessment;
