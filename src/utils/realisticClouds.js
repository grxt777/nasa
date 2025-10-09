/**
 * Слоистые облака как в OpenWeather
 * Отображают облачный покров через полупрозрачные слои
 */

class RealisticCloudsRenderer {
  constructor(canvas, cityCoordinates) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cityCoordinates = cityCoordinates;
    this.time = 0;
    this.currentCity = null;
    this.effectCenter = { x: 0, y: 0 };
    this.effectRadius = 120;
    this.currentCloudLayers = [];
    this.lastWeatherData = null;
  }

  /**
   * Устанавливает центр и радиус эффектов для города
   */
  setEffectArea(cityName, center, radius) {
    this.currentCity = cityName;
    this.effectCenter = center;
    this.effectRadius = radius;
  }

  /**
   * Генерирует слои облаков на основе погодных данных
   */
  generateCloudLayers(weatherData) {
    this.currentCloudLayers = [];
    
    if (!this.effectCenter || !this.effectRadius) return;
    
    const { precipitation, humidity, temperature, windSpeed } = weatherData;
    
    // Определяем количество и тип слоев облаков
    let layers = [];
    
           if (precipitation > 5) {
             // Грозовые облака - плотный темный слой
             layers.push({
               type: 'storm',
               opacity: 0.85,
               color: 'rgba(80, 80, 100, 0.85)',
               radius: this.effectRadius * 0.95,
               offset: { x: 0, y: 0 },
               animation: 'slow'
             });
             // Добавляем дополнительный слой для сильных осадков
             layers.push({
               type: 'storm-heavy',
               opacity: 0.7,
               color: 'rgba(60, 60, 80, 0.7)',
               radius: this.effectRadius * 0.8,
               offset: { x: 15, y: -10 },
               animation: 'medium'
             });
           } else if (precipitation > 1) {
             // Дождевые облака - плотный серый слой
             layers.push({
               type: 'rain',
               opacity: 0.75,
               color: 'rgba(120, 120, 140, 0.75)',
               radius: this.effectRadius * 0.9,
               offset: { x: 0, y: 0 },
               animation: 'slow'
             });
             // Добавляем дополнительный слой для умеренных осадков
             layers.push({
               type: 'rain-medium',
               opacity: 0.6,
               color: 'rgba(100, 100, 120, 0.6)',
               radius: this.effectRadius * 0.75,
               offset: { x: 10, y: -5 },
               animation: 'medium'
             });
           } else if (humidity > 70) {
      // Облачно - несколько слоев
      layers.push({
        type: 'overcast',
        opacity: 0.6,
        color: 'rgba(180, 180, 200, 0.6)',
        radius: this.effectRadius * 0.9,
        offset: { x: 0, y: 0 },
        animation: 'medium'
      });
      layers.push({
        type: 'overcast-light',
        opacity: 0.4,
        color: 'rgba(200, 200, 220, 0.4)',
        radius: this.effectRadius * 0.7,
        offset: { x: 20, y: -15 },
        animation: 'medium'
      });
           } else if (humidity > 50) {
             // Легкая облачность
             layers.push({
               type: 'light-clouds',
               opacity: 0.4,
               color: 'rgba(220, 220, 240, 0.4)',
               radius: this.effectRadius * 0.8,
               offset: { x: 0, y: 0 },
               animation: 'fast'
             });
             // Добавляем легкий темный слой если есть небольшие осадки
             if (precipitation > 0.1) {
               layers.push({
                 type: 'light-precipitation',
                 opacity: 0.3,
                 color: 'rgba(140, 140, 160, 0.3)',
                 radius: this.effectRadius * 0.7,
                 offset: { x: 5, y: -3 },
                 animation: 'fast'
               });
             }
           } else if (humidity > 30) {
      // Небольшая облачность
      layers.push({
        type: 'scattered',
        opacity: 0.3,
        color: 'rgba(240, 240, 250, 0.3)',
        radius: this.effectRadius * 0.6,
        offset: { x: 0, y: 0 },
        animation: 'fast'
      });
    } else {
      // Ясно - очень легкие перистые облака
      layers.push({
        type: 'cirrus',
        opacity: 0.2,
        color: 'rgba(250, 250, 255, 0.2)',
        radius: this.effectRadius * 0.5,
        offset: { x: 0, y: 0 },
        animation: 'very-fast'
      });
    }
    
    // Добавляем влияние ветра на смещение слоев
    if (windSpeed > 5) {
      layers.forEach(layer => {
        layer.offset.x += windSpeed * 2;
        layer.offset.y += windSpeed * 0.5;
      });
    }
    
    this.currentCloudLayers = layers;
  }

  /**
   * Оптимизированное обновление анимации слоев облаков
   */
  update() {
    this.time++;
    
    // Обновляем смещение слоев только каждый 2-й кадр для лучшей производительности
    if (this.time % 2 === 0) {
      this.currentCloudLayers.forEach(layer => {
        const speed = this.getAnimationSpeed(layer.animation);
        layer.offset.x += Math.cos(this.time * speed) * 0.2; // Уменьшаем смещение
        layer.offset.y += Math.sin(this.time * speed * 0.5) * 0.15; // Уменьшаем смещение
      });
    }
  }
  
  /**
   * Возвращает скорость анимации для типа слоя
   */
  getAnimationSpeed(animationType) {
    const speeds = {
      'very-fast': 0.008,
      'fast': 0.005,
      'medium': 0.003,
      'slow': 0.001
    };
    return speeds[animationType] || 0.003;
  }

  /**
   * Отрисовывает слои облаков
   */
  render() {
    this.currentCloudLayers.forEach(layer => {
      const x = this.effectCenter.x + layer.offset.x;
      const y = this.effectCenter.y + layer.offset.y;
      
      // Создаем радиальный градиент для естественного вида
      const gradient = this.ctx.createRadialGradient(
        x, y, 0,
        x, y, layer.radius
      );
      
      // Настраиваем градиент в зависимости от типа слоя
      if (layer.type === 'storm') {
        gradient.addColorStop(0, 'rgba(60, 60, 80, 0.9)');
        gradient.addColorStop(0.3, 'rgba(80, 80, 100, 0.85)');
        gradient.addColorStop(0.7, 'rgba(100, 100, 120, 0.6)');
        gradient.addColorStop(1, 'rgba(120, 120, 140, 0)');
      } else if (layer.type === 'rain') {
        gradient.addColorStop(0, 'rgba(100, 100, 120, 0.8)');
        gradient.addColorStop(0.3, 'rgba(120, 120, 140, 0.75)');
        gradient.addColorStop(0.7, 'rgba(140, 140, 160, 0.5)');
        gradient.addColorStop(1, 'rgba(160, 160, 180, 0)');
      } else if (layer.type === 'overcast') {
        gradient.addColorStop(0, 'rgba(160, 160, 180, 0.7)');
        gradient.addColorStop(0.3, 'rgba(180, 180, 200, 0.6)');
        gradient.addColorStop(0.7, 'rgba(200, 200, 220, 0.3)');
        gradient.addColorStop(1, 'rgba(220, 220, 240, 0)');
      } else if (layer.type === 'overcast-light') {
        gradient.addColorStop(0, 'rgba(180, 180, 200, 0.5)');
        gradient.addColorStop(0.3, 'rgba(200, 200, 220, 0.4)');
        gradient.addColorStop(0.7, 'rgba(220, 220, 240, 0.2)');
        gradient.addColorStop(1, 'rgba(240, 240, 250, 0)');
      } else if (layer.type === 'light-clouds') {
        gradient.addColorStop(0, 'rgba(200, 200, 220, 0.5)');
        gradient.addColorStop(0.3, 'rgba(220, 220, 240, 0.4)');
        gradient.addColorStop(0.7, 'rgba(240, 240, 250, 0.2)');
        gradient.addColorStop(1, 'rgba(250, 250, 255, 0)');
      } else if (layer.type === 'scattered') {
        gradient.addColorStop(0, 'rgba(220, 220, 240, 0.4)');
        gradient.addColorStop(0.3, 'rgba(240, 240, 250, 0.3)');
        gradient.addColorStop(0.7, 'rgba(250, 250, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else { // cirrus
        gradient.addColorStop(0, 'rgba(240, 240, 250, 0.3)');
        gradient.addColorStop(0.3, 'rgba(250, 250, 255, 0.2)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, layer.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * Очищает canvas
   */
  clear() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Основной метод для обновления и отрисовки
   */
  animate(weatherData) {
    // Генерируем слои облаков только если они еще не созданы 
    // или погодные данные изменились
    const currentWeatherData = JSON.stringify(weatherData);
    if (this.lastWeatherData !== currentWeatherData) {
      this.generateCloudLayers(weatherData);
      this.lastWeatherData = currentWeatherData;
    }
    
    this.clear();
    this.update();
    this.render();
  }
  
  /**
   * Сброс облаков (при смене города)
   */
  reset() {
    this.currentCloudLayers = [];
    this.lastWeatherData = null;
    this.time = 0;
  }
}

export default RealisticCloudsRenderer;
