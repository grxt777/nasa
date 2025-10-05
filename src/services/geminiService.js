class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }



  async generateAlternativeDates(cityName, currentDate, weatherData, selectedEvent = '') {
    if (!this.apiKey) { 
      throw new Error('Gemini API key not provided');
    }

    let eventContext = '';
    if (selectedEvent && selectedEvent.trim()) {
      eventContext = ` for "${selectedEvent}"`;
    }

    const prompt = `Предложи 3 лучшие даты для "${selectedEvent}" в городе ${cityName} вместо ${currentDate}.

Требования:
- Даты в формате YYYY-MM-DD
- Краткое объяснение для каждой даты (1 предложение)
- Учитывай сезонность и особенности активности "${selectedEvent}"
- Ответ на русском языке
- НЕ используй markdown форматирование (**, *, \`\`\`)

Формат ответа:
1. YYYY-MM-DD: объяснение
2. YYYY-MM-DD: объяснение  
3. YYYY-MM-DD: объяснение`;

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Gemini API Error Response:', errorBody);
        
        if (response.status === 404) {
          throw new Error('Gemini API error: 404 Not Found. Возможно, модель недоступна для вашего API-ключа или эндпоинт устарел.');
        } else if (response.status === 400) {
          throw new Error('Gemini API error: 400 Bad Request. Проверьте корректность запроса и параметров.');
        } else if (response.status === 403) {
          throw new Error('Gemini API error: 403 Forbidden. Проверьте права доступа вашего API-ключа.');
        } else if (response.status === 429) {
          throw new Error('Gemini API error: 429 Too Many Requests. Превышен лимит запросов. Попробуйте позже.');
        }
        
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}. Response: ${errorBody}`);
      }

      const data = await response.json();
      
      // Check if response has candidates and content
      if (
        data.candidates &&
        Array.isArray(data.candidates) &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        Array.isArray(data.candidates[0].content.parts) &&
        data.candidates[0].content.parts[0] &&
        typeof data.candidates[0].content.parts[0].text === 'string' &&
        data.candidates[0].content.parts[0].text.trim().length > 0
      ) {
        return data.candidates[0].content.parts[0].text;
      } else if (
        data.candidates &&
        Array.isArray(data.candidates) &&
        data.candidates[0] &&
        data.candidates[0].finishReason === 'MAX_TOKENS'
      ) {
        // Handle case where response was truncated due to token limit
        throw new Error('Ответ Gemini был обрезан из-за ограничения токенов. Попробуйте упростить запрос или увеличить лимит токенов.');
      } else {
        throw new Error('Invalid response from Gemini API: ' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error calling Gemini API for alternative dates:', error);
      throw error;
    }
  }

  /**
   * Generate AI comments for individual weather parameters (like Python get_weather_analysis)
   */
  async generateWeatherParameterComments({ city, dateStr, temperature, rain, humidity, wind, uv, soilMoisture, activity = '' }) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not provided');
    }

    const prompt = `Анализ погоды для ${city} на ${dateStr}. Активность: ${activity}.

Данные: ${temperature.toFixed(1)}°C, ${rain.toFixed(1)}мм, ${humidity.toFixed(0)}%, ${wind.toFixed(1)}м/с, УФ ${uv.toFixed(1)}, влажность почвы ${soilMoisture.toFixed(1)}мм.

Дай JSON:
{
  "meteorologist": {
    "temperature": "краткий факт о температуре",
    "rain": "краткий факт об осадках", 
    "humidity": "краткий факт о влажности",
    "wind": "краткий факт о ветре",
    "uv": "краткий факт об УФ",
    "soilMoisture": "краткий факт о влажности почвы"
  },
  "ai_advice": {
    "temperature": "совет по температуре для ${activity}",
    "rain": "совет по осадкам для ${activity}",
    "humidity": "совет по влажности для ${activity}",
    "wind": "совет по ветру для ${activity}",
    "uv": "совет по УФ для ${activity}",
    "soilMoisture": "совет по влажности почвы для ${activity}"
  },
  "risk_level": "low|moderate|high"
}`;

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}. Response: ${errorBody}`);
      }

      const data = await response.json();
      
      // Handle MAX_TOKENS finishReason gracefully
      if (
        data.candidates &&
        Array.isArray(data.candidates) &&
        data.candidates[0]
      ) {
        const candidate = data.candidates[0];
        const parts = candidate.content && candidate.content.parts;
        const text = parts && Array.isArray(parts) && parts[0] && typeof parts[0].text === 'string' ? parts[0].text : '';
        
        if (candidate.finishReason === 'MAX_TOKENS') {
          if (text && text.trim().length > 0) {
            return { text, truncated: true };
          } else {
            throw new Error('Ответ Gemini был обрезан из-за ограничения токенов. Попробуйте упростить запрос или увеличить лимит токенов.');
          }
        } else if (text && text.trim().length > 0) {
          // Parse JSON response
          let jsonText = text.trim();
          if (jsonText.includes('```json')) {
            const start = jsonText.indexOf('```json') + 7;
            const end = jsonText.indexOf('```', start);
            if (end === -1) {
              jsonText = jsonText.substring(start).trim();
            } else {
              jsonText = jsonText.substring(start, end).trim();
            }
          }
          
          try {
            return JSON.parse(jsonText);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw response:', text);
            throw new Error('Ошибка парсинга JSON ответа от Gemini');
          }
        }
      }
      throw new Error('Invalid response from Gemini API: ' + JSON.stringify(data));
    } catch (error) {
      console.error('Error calling Gemini API (WeatherParameterComments):', error);
      throw error;
    }
  }

  /**
   * Advanced AI analysis for the day, matching the Python script logic and output format.
   * Returns Gemini's response as a string.
   */
  async generateAIWeatherAnalysis({ weatherStats, city, dateStr, eventName = '' }) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not provided');
    }

    // Debug: Log weatherStats to see what we're getting
    console.log('WeatherStats received:', weatherStats);
    
    // Ideal temperature logic
    let idealTemp = 20;
    if (eventName && eventName.toLowerCase().includes('wedding')) idealTemp = 24;
    else if (eventName && eventName.toLowerCase().includes('ski')) idealTemp = 10;
    
    // Extract values with proper fallback
    const tempAvg = weatherStats.temp_avg !== undefined ? weatherStats.temp_avg : 0;
    const tempDev = Math.abs(tempAvg - idealTemp);
    const rainProb = weatherStats.rain_prob !== undefined ? weatherStats.rain_prob : 0;
    const windAvg = weatherStats.wind_avg !== undefined ? weatherStats.wind_avg : 0;
    const rhAvg = weatherStats.rh_avg !== undefined ? weatherStats.rh_avg : 0;
    const uvAvg = weatherStats.uv_avg !== undefined ? weatherStats.uv_avg : 0;
    
    // Debug: Log extracted values
    console.log('Extracted values:', { tempAvg, rainProb, windAvg, rhAvg, uvAvg });

    const dayAnalysisPrompt = `Ты — опытный метеоролог и аналитик погоды. Проанализируй погодные условия для события "${eventName}" в городе ${city} на дату ${dateStr}.

Метеорологические данные:
- Средняя температура: ${tempAvg.toFixed(1)}°C (отклонение от идеала для ${eventName}: ${tempDev.toFixed(1)}°C)
- Вероятность дождя: ${rainProb.toFixed(1)}%
- Средняя влажность: ${rhAvg.toFixed(1)}%
- Скорость ветра: ${windAvg.toFixed(1)} м/с
- УФ-индекс: ${uvAvg.toFixed(1)}

Создай анализ в следующем формате:

[2-3 предложения с общим анализом погодных условий для данного дня и их влиянием на ${eventName}]

После текста добавь JSON в отдельном блоке:

\`\`\`json
{
  "summary": "[2-3 предложения с общим анализом]"
}
\`\`\`
`;

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: dayAnalysisPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}. Response: ${errorBody}`);
      }

      const data = await response.json();
      // Handle MAX_TOKENS finishReason gracefully
      if (
        data.candidates &&
        Array.isArray(data.candidates) &&
        data.candidates[0]
      ) {
        const candidate = data.candidates[0];
        const parts = candidate.content && candidate.content.parts;
        const text = parts && Array.isArray(parts) && parts[0] && typeof parts[0].text === 'string' ? parts[0].text : '';
        if (candidate.finishReason === 'MAX_TOKENS') {
          if (text && text.trim().length > 0) {
            return { text, truncated: true };
          } else {
            throw new Error('Ответ Gemini был обрезан из-за ограничения токенов. Попробуйте упростить запрос или увеличить лимит токенов.');
          }
        } else if (text && text.trim().length > 0) {
          // Extract clean text without JSON
          let cleanText = text.trim();
          let jsonData = null;
          
          // Remove JSON blocks from text
          if (cleanText.includes('```json')) {
            const jsonStart = cleanText.indexOf('```json');
            const jsonEnd = cleanText.indexOf('```', jsonStart + 7);
            if (jsonEnd !== -1) {
              // Extract JSON
              const jsonText = cleanText.substring(jsonStart + 7, jsonEnd).trim();
              try {
                jsonData = JSON.parse(jsonText);
              } catch (e) {
                console.warn('Failed to parse JSON from response:', e);
              }
              // Remove JSON block from text
              cleanText = cleanText.substring(0, jsonStart).trim();
            }
          } else if (cleanText.includes('{') && cleanText.includes('}')) {
            // Try to find JSON at the end
            const jsonStart = cleanText.lastIndexOf('{');
            const jsonEnd = cleanText.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
              const jsonText = cleanText.substring(jsonStart, jsonEnd);
              try {
                jsonData = JSON.parse(jsonText);
                // Remove JSON from text
                cleanText = cleanText.substring(0, jsonStart).trim();
              } catch (e) {
                console.warn('Failed to parse JSON from response:', e);
              }
            }
          }
          
          return { 
            text: cleanText, 
            truncated: false, 
            rating: jsonData?.rating,
            summary: jsonData?.summary
          };
        }
      }
      throw new Error('Invalid response from Gemini API: ' + JSON.stringify(data));
    } catch (error) {
      console.error('Error calling Gemini API (AIWeatherAnalysis):', error);
      throw error;
    }
  }
}

export default new GeminiService();