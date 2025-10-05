import React from 'react';
import { Search, Download, RotateCcw, Loader2 } from 'lucide-react';

const ActionButtons = ({ 
  onShowResults, 
  onDownloadCSV, 
  onDownloadJSON, 
  onReset, 
  isLoading, 
  hasData 
}) => {
  const handleDownloadCSV = () => {
    // Mock CSV data - in real app this would generate actual CSV
    const csvData = `Date,Temperature,Precipitation,Humidity,Wind,UV Index,Comfort Score
2023-01-01,15.2,5.1,65,3.2,2,7.5
2023-01-02,18.7,0.0,58,4.1,3,8.2
2023-01-03,22.1,12.3,72,2.8,4,6.8`;
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weather-analysis-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    onDownloadCSV?.();
  };

  const handleDownloadJSON = () => {
    // Mock JSON data - in real app this would generate actual JSON
    const jsonData = {
      analysis: {
        city: 'London',
        dateRange: '2023-01-01 to 2023-12-31',
        temperature: { probability: 78, average: 15.2 },
        precipitation: { probability: 12, average: 5.1 },
        humidity: { average: 65 },
        wind: { average: 3.2 },
        uv: { average: 2 },
        comfort: { score: 7.5 }
      },
      recommendations: [
        'Provide shade and cooling stations',
        'Set up hydration stations',
        'Avoid scheduling during midday hours'
      ],
      alternativeDates: [
        { date: 'June 15-20', improvement: 15 },
        { date: 'September 1-5', improvement: 22 }
      ]
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weather-analysis-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    onDownloadJSON?.();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-8">
      <button
        onClick={onShowResults}
        disabled={isLoading}
        className="btn-primary flex items-center gap-2 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
        {isLoading ? 'Анализ...' : 'Показать результаты'}
      </button>

      <div className="flex gap-3">
        <button
          onClick={handleDownloadCSV}
          disabled={!hasData || isLoading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>

        <button
          onClick={handleDownloadJSON}
          disabled={!hasData || isLoading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          JSON
        </button>

        <button
          onClick={onReset}
          disabled={isLoading}
          className="btn-tertiary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
