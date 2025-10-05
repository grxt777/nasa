import React from 'react';
import { MapPin, Calendar, Download, FileText, RotateCcw, Play, FileDown } from 'lucide-react';
import { cities } from '../data/cities';

const Sidebar = ({ 
  selectedCity, 
  onCityChange, 
  selectedDate, 
  onDateChange, 
  selectedEvent,
  onEventChange,
  onShowResults, 
  onDownloadCSV, 
  onDownloadJSON, 
  onDownloadPDF,
  onReset, 
  isLoading, 
  hasData 
}) => {

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full fixed left-0 top-0 z-50 lg:relative lg:z-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Анализ Погоды</h1>
        <p className="text-sm text-gray-500">Исторические данные NASA</p>
      </div>

      {/* Inputs Section */}
      <div className="p-6 space-y-6">
        {/* City Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Город
          </label>
          <select
            value={selectedCity?.id || ''}
            onChange={(e) => {
              const city = cities.find(c => c.id === e.target.value);
              onCityChange(city);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Выберите город</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Дата
          </label>
          <input
            type="date"
            value={selectedDate || ''}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Выберите дату"
          />
        </div>

        {/* Event Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Событие (опционально)
          </label>
          <input
            type="text"
            value={selectedEvent || ''}
            onChange={(e) => onEventChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Например: свадьба, пикник, конференция..."
          />
        </div>

        {/* Selected Info */}
        {selectedCity && selectedDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">Выбранные параметры:</h3>
            <p className="text-sm text-blue-700">
              <strong>{selectedCity.name}</strong>, {selectedCity.country}
            </p>
            <p className="text-sm text-blue-700">
              {new Date(selectedDate).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 space-y-3">
        {/* Main Action Button */}
        <button
          onClick={onShowResults}
          disabled={!selectedCity || !selectedDate || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Анализ...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Показать результаты
            </>
          )}
        </button>

        {/* Secondary Actions */}
        {hasData && (
          <div className="space-y-2">
            <button
              onClick={onDownloadPDF}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Скачать PDF
            </button>
            
            <button
              onClick={onDownloadCSV}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Скачать CSV
            </button>
            
            <button
              onClick={onDownloadJSON}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Скачать JSON
            </button>
            
            <button
              onClick={onReset}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Сбросить
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 border-t border-gray-200 flex-1">
        <h3 className="font-medium text-gray-900 mb-3">Как использовать:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Выберите город из списка</p>
          <p>2. Укажите дату (например, "15 июля")</p>
          <p>3. Нажмите "Показать результаты"</p>
          <p>4. Получите анализ на основе исторических данных NASA</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
