import React, { useState } from 'react';
import { Key, Check, X, Eye, EyeOff } from 'lucide-react';
import geminiService from '../services/geminiService';

const ApiKeyConfig = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Пожалуйста, введите API ключ');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Test the API key with a simple request
      geminiService.setApiKey(apiKey);
      
      // Make a test call to validate the key
      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Test'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
          }
        })
      });

      if (testResponse.ok) {
        setIsValid(true);
        onApiKeySet(apiKey);
        // Save to localStorage
        localStorage.setItem('gemini_api_key', apiKey);
      } else {
        setIsValid(false);
        setError('Неверный API ключ. Проверьте правильность ввода.');
      }
    } catch (err) {
      setIsValid(false);
      setError('Ошибка при проверке API ключа. Проверьте подключение к интернету.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      validateApiKey();
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Настройка ИИ-анализа</h3>
          <p className="text-sm text-gray-600">Введите API ключ Gemini для получения персонализированных рекомендаций</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваш Gemini API ключ..."
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {isValid === true && <Check className="w-4 h-4 text-green-500" />}
              {isValid === false && <X className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={validateApiKey}
            disabled={isValidating || !apiKey.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Проверка...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Проверить ключ
              </>
            )}
          </button>

          {isValid === true && (
            <span className="text-sm text-green-600 font-medium">
              ✅ API ключ настроен успешно
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          <p className="font-medium mb-1">Как получить API ключ:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Перейдите на <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a></li>
            <li>Войдите в свой Google аккаунт</li>
            <li>Нажмите "Create API Key"</li>
            <li>Скопируйте ключ и вставьте в поле выше</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyConfig;
