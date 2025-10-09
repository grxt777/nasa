import React from 'react';

const LoadingSkeleton = ({ 
  type = 'card', 
  count = 1, 
  className = '' 
}) => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-28"></div>
      </div>
    </div>
  );

  const GraphSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const MapSkeleton = () => (
    <div className="w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden border border-gray-200 shadow-sm animate-pulse">
      <div className="w-full h-full bg-gray-200"></div>
    </div>
  );

  const TextSkeleton = () => (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'graph':
        return <GraphSkeleton />;
      case 'map':
        return <MapSkeleton />;
      case 'text':
        return <TextSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <div className={className}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
