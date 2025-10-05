import React, { useState } from 'react';
import nasaDataService from '../services/nasaDataService';

const DataTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDataLoading = async () => {
    setLoading(true);
    try {
      // Test loading London data
      const data = await nasaDataService.loadCityData('London', 'nasa_weather_London_1999_2024.csv');
      console.log('Loaded data:', data);
      setTestResult(`Successfully loaded ${data.length} records for London`);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-2">NASA Data Test</h3>
      <button 
        onClick={testDataLoading}
        disabled={loading}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Data Loading'}
      </button>
      {testResult && (
        <div className="mt-2 text-sm text-yellow-700">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default DataTest;
