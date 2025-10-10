/**
 * Продвинутая система визуализации погодных эффектов
 * Версия 3.1 - С реалистичными облаками из изображений
 */

import RealisticCloudsRenderer from './realisticClouds.js';

class AdvancedWeatherEffectsRenderer {
  constructor(map, cityCoordinates) {
    this.map = map;
    this.cityCoordinates = cityCoordinates;
    
    // Основной canvas для эффектов
    this.canvas = null;
    this.ctx = null;
    
    // Дополнительные canvas слои
    this.cloudsCanvas = null;
    this.cloudsCtx = null;
    this.sunCanvas = null;
    this.sunCtx = null;
    this.particlesCanvas = null;
    this.particlesCtx = null;
    
    // Реалистичные облака
    this.realisticClouds = null;
    
    this.animationFrame = null;
    this.currentEffects = {
      rain: [],
      wind: [],
      snow: [],
      clouds: [],
      sun: null,
      lightning: null
    };
    
    this.isAnimating = false;
    this.currentCity = null;
    this.weatherData = null;
    this.time = 0;
  }

  /**
   * Инициализация многослойной системы canvas
   */
  initialize() {
    if (this.canvas) return;

    const mapContainer = this.map.getContainer();
    
    // Слой облаков (самый нижний)
    this.cloudsCanvas = this.createCanvas(mapContainer, 350);
    this.cloudsCtx = this.cloudsCanvas.getContext('2d');
    
    // Инициализируем реалистичные облака
    this.realisticClouds = new RealisticCloudsRenderer(this.cloudsCanvas, this.cityCoordinates);
    
    // Слой солнца
    this.sunCanvas = this.createCanvas(mapContainer, 360);
    this.sunCtx = this.sunCanvas.getContext('2d');
    
    // Основной слой эффектов
    this.canvas = this.createCanvas(mapContainer, 400);
    this.ctx = this.canvas.getContext('2d');
    
    // Слой частиц (самый верхний)
    this.particlesCanvas = this.createCanvas(mapContainer, 410);
    this.particlesCtx = this.particlesCanvas.getContext('2d');

    // Обработчики событий карты
    this.map.on('resize', () => this.resizeAllCanvas());
    this.map.on('move', () => this.updateEffects());
    this.map.on('zoom', () => this.updateEffects());
  }

  /**
   * Создание canvas слоя
   */
  createCanvas(container, zIndex) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = zIndex.toString();
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);
    return canvas;
  }

  /**
   * Изменение размера всех canvas
   */
  resizeAllCanvas() {
    const mapContainer = this.map.getContainer();
    const width = mapContainer.offsetWidth;
    const height = mapContainer.offsetHeight;
    
    [this.cloudsCanvas, this.sunCanvas, this.canvas, this.particlesCanvas].forEach(canvas => {
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    });
    
    // Обновляем размеры реалистичных облаков
    if (this.realisticClouds) {
      this.realisticClouds.canvas.width = width;
      this.realisticClouds.canvas.height = height;
    }
  }

  /**
   * Получить радиус эффектов для города
   */
  getEffectRadius(cityName = null) {
    // Фиксированные радиусы для разных городов
    const cityRadii = {
      'Almaty': 150,
      'Tashkent': 140,
      'Bishkek': 130,
      'Samarkand': 120,
      'Bukhara': 110,
      'Fergana': 100,
      'Andijan': 100,
      'Namangan': 100,
      'Jizzakh': 90,
      'Karshi': 90,
      'Navoi': 80,
      'Termez': 80,
      'Urgench': 80,
      'Nukus': 80,
      'Zarafshan': 70,
      'Gulistan': 70,
      'Goris': 60,
      'Dalanzadgad': 60,
      'Atar': 50,
      'Dori': 50
    };
    
    // Если город не найден, используем базовый радиус
    const baseRadius = cityRadii[cityName] || 120;
    
    // Небольшая корректировка по зуму для адаптивности
    const zoom = this.map.getZoom();
    const zoomFactor = Math.pow(1.2, zoom - 8);
    
    return baseRadius * zoomFactor;
  }

  /**
   * Главная функция рендеринга
   */
  renderWeatherEffects(cityName, weatherData) {
    // console.log('🎯 renderWeatherEffects called:', { cityName, weatherData });
    
    this.initialize();
    
    if (this.currentCity !== cityName) {
      // console.log('🔄 City changed, fading out effects');
      // Сбрасываем облака при смене города
      if (this.realisticClouds) {
        this.realisticClouds.reset();
      }
      
      this.fadeOutEffects(() => {
        this.currentCity = cityName;
        this.weatherData = weatherData;
        // console.log('✅ Starting effects for new city:', cityName);
        this.startEffects();
      });
    } else {
      this.weatherData = weatherData;
      // console.log('🔄 Updating effects for same city:', cityName);
      this.startEffects();
    }
    
    // Обновляем центр и радиус эффектов для облаков
    if (this.realisticClouds) {
      const coords = this.cityCoordinates[cityName];
      if (coords && this.map && this.map.getContainer()) {
        const cityPoint = this.map.latLngToContainerPoint(coords);
        const radius = this.getEffectRadius(cityName);
        // console.log('📍 Setting cloud effect area:', { cityPoint, radius });
        this.realisticClouds.setEffectArea(cityName, cityPoint, radius);
      }
    }
  }

  /**
   * Запуск эффектов
   */
  startEffects() {
    // console.log('🚀 startEffects called with:', { 
    //   weatherData: this.weatherData, 
    //   currentCity: this.currentCity 
    // });
    
    if (!this.weatherData || !this.currentCity) {
      // console.log('❌ Missing weather data or city');
      return;
    }

    // Проверяем, что карта полностью инициализирована
    if (!this.map || !this.map._loaded || !this.map.getContainer()) {
      console.warn('Map not ready for weather effects');
      return;
    }

    const coords = this.cityCoordinates[this.currentCity];
    if (!coords) {
      // console.log('❌ No coordinates for city:', this.currentCity);
      return;
    }

    // Проверяем, что карта инициализирована
    if (!this.map || !this.map.getContainer() || !this.map._loaded) {
      // console.log('❌ Map not initialized');
      return;
    }

    // Дополнительная проверка на наличие необходимых методов карты
    if (typeof this.map.latLngToContainerPoint !== 'function') {
      console.warn('Map latLngToContainerPoint method not available');
      return;
    }

    const cityPoint = this.map.latLngToContainerPoint(coords);
    const radius = this.getEffectRadius(this.currentCity);
    
    // console.log('📍 City point and radius:', { cityPoint, radius });

    // Очищаем старые эффекты
    this.currentEffects = {
      rain: [],
      wind: [],
      snow: [],
      clouds: [],
      sun: null,
      lightning: null
    };

    // Инициализируем облака
    this.initClouds(cityPoint, radius, this.weatherData);

    // Инициализируем солнце (при хорошей погоде) - делаем условия мягче
    const shouldShowSun = (
      this.weatherData.precipitation < 1 && // Нет осадков
      (
        this.weatherData.uvIndex > 2 || // Снизили порог UV индекса
        (this.weatherData.temperature > 15 && this.weatherData.humidity < 70) || // Снизили пороги
        (this.weatherData.temperature > 20) // Просто тепло
      )
    );
    
    // console.log('☀️ Should show sun:', shouldShowSun, {
    //   precipitation: this.weatherData.precipitation,
    //   uvIndex: this.weatherData.uvIndex,
    //   temperature: this.weatherData.temperature,
    //   humidity: this.weatherData.humidity
    // });
    
    if (shouldShowSun) {
      this.initSun(cityPoint, radius, this.weatherData);
    }

    // Инициализируем осадки - снижаем порог
    if (this.weatherData.precipitation > 0.1) {
      // console.log('🌧️ Initializing precipitation:', this.weatherData.precipitation);
      if (this.weatherData.temperature < 5) {
        this.initAdvancedSnow(cityPoint, radius, this.weatherData.precipitation);
      } else {
        this.initAdvancedRain(cityPoint, radius, this.weatherData.precipitation);
      }
    }

    // Инициализируем ветер - снижаем порог
    if (this.weatherData.windSpeed > 3) {
      // console.log('💨 Initializing wind:', this.weatherData.windSpeed);
      this.initAdvancedWind(cityPoint, radius, this.weatherData.windSpeed);
    }

    // Инициализируем грозу - снижаем порог
    if (this.weatherData.precipitation > 3) {
      // console.log('⚡ Initializing lightning:', this.weatherData.precipitation);
      this.currentEffects.lightning = {
        active: false,
        nextStrike: Date.now() + Math.random() * 3000 + 2000,
        flashDuration: 0,
        center: cityPoint,
        radius
      };
    }

    // console.log('🎬 Starting animation, isAnimating:', this.isAnimating);
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  /**
   * Инициализация 3D облаков
   */
  initClouds(center, radius, weatherData) {
    // Облака теперь генерируются в RealisticCloudsRenderer
    // Оставляем пустой массив для совместимости
    this.currentEffects.clouds = [];
  }

  /**
   * Определить тип облаков
   */
  getCloudType(weatherData) {
    if (weatherData.precipitation > 5) {
      // Грозовые облака
      return {
        count: 8,
        opacity: 0.85,
        color: [60, 60, 80],
        isDark: true
      };
    } else if (weatherData.precipitation > 1) {
      // Дождевые облака
      return {
        count: 6,
        opacity: 0.7,
        color: [100, 100, 120],
        isDark: true
      };
    } else if (weatherData.precipitation > 0.3) {
      // Облачно
      return {
        count: 5,
        opacity: 0.6,
        color: [180, 180, 200],
        isDark: false
      };
    } else if (weatherData.humidity > 70) {
      // Легкая облачность
      return {
        count: 3,
        opacity: 0.4,
        color: [220, 220, 235],
        isDark: false
      };
    } else {
      // Ясно
      return {
        count: 2,
        opacity: 0.3,
        color: [240, 240, 250],
        isDark: false
      };
    }
  }

  /**
   * Инициализация 3D солнца
   */
  initSun(center, radius, weatherData) {
    // Базовая интенсивность от UV индекса и температуры
    let intensity = 0.5; // Минимальная базовая интенсивность
    
    if (weatherData.uvIndex > 0) {
      intensity = Math.max(intensity, Math.min(weatherData.uvIndex / 10, 1));
    }
    
    // Добавляем интенсивность от температуры
    if (weatherData.temperature > 20) {
      intensity = Math.max(intensity, 0.6 + (weatherData.temperature - 20) / 30);
    }
    
    // Облачный покров уменьшает интенсивность, но не слишком сильно
    const cloudCover = Math.min(weatherData.humidity / 100, 1);
    const cloudReduction = cloudCover > 0.7 ? 0.4 : 0.2;
    
    this.currentEffects.sun = {
      x: center.x + radius * 0.5,
      y: center.y - radius * 0.6,
      radius: 45 + intensity * 35, // Увеличили размер
      intensity: Math.max(0.6, intensity * (1 - cloudCover * cloudReduction)), // Минимум 0.6
      rays: 18, // Больше лучей
      pulsePhase: 0,
      coronaLayers: 6, // Больше слоев короны
      flares: []
    };

    // Создаем солнечные блики
    const flareCount = 6 + Math.floor(intensity * 8);
    for (let i = 0; i < flareCount; i++) {
      const angle = (Math.PI * 2 / flareCount) * i;
      const distance = this.currentEffects.sun.radius * (2 + Math.random() * 4);
      
      this.currentEffects.sun.flares.push({
        angle,
        distance,
        size: 18 + Math.random() * 30,
        opacity: 0.4 + Math.random() * 0.5,
        speed: 0.008 + Math.random() * 0.015
      });
    }
  }

  /**
   * Оптимизированный дождь с меньшим количеством частиц
   */
  initAdvancedRain(center, radius, intensity) {
    // Уменьшаем количество частиц в 3 раза для лучшей производительности
    const particleCount = Math.floor(intensity * 120 + 80);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance - Math.random() * radius;
      
      // Упрощаем типы капель для лучшей производительности
      const dropType = Math.random();
      let size, speed, length;
      
      if (dropType < 0.2) {
        // Большие капли (20%)
        size = 2.0;
        speed = 12 + Math.random() * 6;
        length = 25 + Math.random() * 10;
      } else {
        // Мелкие капли (80%)
        size = 1.2;
        speed = 8 + Math.random() * 4;
        length = 15 + Math.random() * 8;
      }

      this.currentEffects.rain.push({
        x, y,
        length,
        speed,
        width: size,
        opacity: 0.6 + Math.random() * 0.4,
        splash: null, // Убираем эффект всплеска для производительности
        center,
        radius
      });
    }
  }

  /**
   * Оптимизированный снег с упрощенными формами
   */
  initAdvancedSnow(center, radius, intensity) {
    // Уменьшаем количество частиц в 2 раза для лучшей производительности
    const particleCount = Math.floor(intensity * 150 + 100);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius * 0.9;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance;
      
      // Упрощаем формы снежинок для лучшей производительности
      const shapeType = Math.random();
      let shape, size;
      
      if (shapeType < 0.5) {
        shape = 'circle'; // Круг (50%)
        size = 2 + Math.random() * 2;
      } else {
        shape = 'star'; // Звезда (50%)
        size = 2.5 + Math.random() * 2;
      }

      this.currentEffects.snow.push({
        x, y,
        size,
        shape,
        speed: 1.0 + Math.random() * 1.2,
        opacity: 0.7 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03, // Уменьшаем скорость вращения
        swingAmplitude: 10 + Math.random() * 15, // Уменьшаем амплитуду покачивания
        swingSpeed: 0.015 + Math.random() * 0.02, // Уменьшаем скорость покачивания
        swingOffset: Math.random() * Math.PI * 2,
        center,
        radius
      });
    }
  }

  /**
   * Оптимизированный ветер с меньшим количеством линий
   */
  initAdvancedWind(center, radius, speed) {
    // Уменьшаем количество линий в 2 раза для лучшей производительности
    const lineCount = Math.floor(speed * 10 + 20);
    
    for (let i = 0; i < lineCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance;
      
      const windAngle = Math.PI / 4 + (Math.random() - 0.5) * 0.6; // Уменьшаем вариативность

      this.currentEffects.wind.push({
        x, y,
        length: 30 + Math.random() * 50, // Уменьшаем длину линий
        angle: windAngle,
        speed: speed / 1.5, // Уменьшаем скорость
        opacity: 0.4 + Math.random() * 0.4,
        width: 1.5 + Math.random() * 1.5, // Уменьшаем толщину
        turbulence: Math.random() * 10, // Уменьшаем турбулентность
        phase: Math.random() * Math.PI * 2,
        center,
        radius
      });
    }
  }

  /**
   * Отрисовка реалистичных облаков
   */
  drawClouds(ctx) {
    if (this.realisticClouds && this.weatherData) {
      this.realisticClouds.animate(this.weatherData);
    }
  }

  /**
   * Отрисовка 3D солнца
   */
  drawSun(ctx) {
    const sun = this.currentEffects.sun;
    if (!sun) return;

    const pulse = Math.sin(this.time * 0.03) * 0.1 + 1;
    const currentRadius = sun.radius * pulse;

    ctx.save();

    // Корона солнца (множественные слои)
    for (let i = sun.coronaLayers; i > 0; i--) {
      const coronaRadius = currentRadius * (1 + i * 0.4);
      const coronaOpacity = (sun.intensity * 0.15) / i;

      const gradient = ctx.createRadialGradient(
        sun.x, sun.y, currentRadius,
        sun.x, sun.y, coronaRadius
      );

      gradient.addColorStop(0, `rgba(255, 240, 150, ${coronaOpacity})`);
      gradient.addColorStop(0.4, `rgba(255, 200, 100, ${coronaOpacity * 0.7})`);
      gradient.addColorStop(0.7, `rgba(255, 150, 50, ${coronaOpacity * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 120, 30, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, coronaRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Лучи солнца (два слоя для большей яркости)
    ctx.save();
    ctx.translate(sun.x, sun.y);
    
    // Внешние длинные лучи
    ctx.save();
    ctx.rotate(this.time * 0.005);
    for (let i = 0; i < sun.rays; i++) {
      const angle = (Math.PI * 2 / sun.rays) * i;
      const rayLength = currentRadius * (2.5 + Math.sin(this.time * 0.02 + i) * 0.8);

      const gradient = ctx.createLinearGradient(
        Math.cos(angle) * currentRadius * 1.2, Math.sin(angle) * currentRadius * 1.2,
        Math.cos(angle) * rayLength, Math.sin(angle) * rayLength
      );

      gradient.addColorStop(0, `rgba(255, 245, 120, ${sun.intensity * 0.7})`);
      gradient.addColorStop(0.3, `rgba(255, 220, 100, ${sun.intensity * 0.5})`);
      gradient.addColorStop(0.7, `rgba(255, 180, 70, ${sun.intensity * 0.25})`);
      gradient.addColorStop(1, `rgba(255, 150, 50, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 5 + Math.sin(this.time * 0.03 + i) * 2.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * currentRadius * 1.2, Math.sin(angle) * currentRadius * 1.2);
      ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
      ctx.stroke();
    }
    ctx.restore();
    
    // Внутренние короткие лучи (вращаются в другую сторону)
    ctx.save();
    ctx.rotate(-this.time * 0.008);
    for (let i = 0; i < sun.rays; i++) {
      const angle = (Math.PI * 2 / sun.rays) * i + Math.PI / sun.rays;
      const rayLength = currentRadius * (1.8 + Math.sin(this.time * 0.025 + i) * 0.4);

      const gradient = ctx.createLinearGradient(
        Math.cos(angle) * currentRadius, Math.sin(angle) * currentRadius,
        Math.cos(angle) * rayLength, Math.sin(angle) * rayLength
      );

      gradient.addColorStop(0, `rgba(255, 250, 150, ${sun.intensity * 0.6})`);
      gradient.addColorStop(0.5, `rgba(255, 230, 120, ${sun.intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 200, 90, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 + Math.sin(this.time * 0.04 + i) * 1.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * currentRadius, Math.sin(angle) * currentRadius);
      ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
      ctx.stroke();
    }
    ctx.restore();
    
    ctx.restore();

    // Основное тело солнца
    const sunGradient = ctx.createRadialGradient(
      sun.x - currentRadius * 0.2, sun.y - currentRadius * 0.2, 0,
      sun.x, sun.y, currentRadius
    );

    sunGradient.addColorStop(0, `rgba(255, 255, 255, ${sun.intensity})`);
    sunGradient.addColorStop(0.3, `rgba(255, 250, 200, ${sun.intensity})`);
    sunGradient.addColorStop(0.6, `rgba(255, 220, 100, ${sun.intensity * 0.95})`);
    sunGradient.addColorStop(1, `rgba(255, 180, 50, ${sun.intensity * 0.9})`);

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Солнечные блики
    sun.flares.forEach(flare => {
      flare.angle += flare.speed;
      const x = sun.x + Math.cos(flare.angle) * flare.distance;
      const y = sun.y + Math.sin(flare.angle) * flare.distance;

      const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, flare.size);
      flareGradient.addColorStop(0, `rgba(255, 255, 200, ${flare.opacity * sun.intensity})`);
      flareGradient.addColorStop(0.5, `rgba(255, 230, 150, ${flare.opacity * 0.5 * sun.intensity})`);
      flareGradient.addColorStop(1, `rgba(255, 200, 100, 0)`);

      ctx.fillStyle = flareGradient;
      ctx.beginPath();
      ctx.arc(x, y, flare.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Оптимизированная отрисовка дождя
   */
  drawAdvancedRain(ctx) {
    // Используем один цвет для всех капель для лучшей производительности
    ctx.strokeStyle = `rgba(180, 200, 230, 0.7)`;
    ctx.lineCap = 'round';

    this.currentEffects.rain.forEach(drop => {
      ctx.lineWidth = drop.width;

      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + 2, drop.y + drop.length); // Упрощаем движение
      ctx.stroke();

      // Обновление
      drop.y += drop.speed;
      drop.x += 0.5; // Уменьшаем горизонтальное смещение

      // Упрощенная проверка границ
      if (drop.y > drop.center.y + drop.radius) {
        // Перезапуск капли
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * drop.radius;
        drop.x = drop.center.x + Math.cos(angle) * distance;
        drop.y = drop.center.y - drop.radius;
      }
    });
  }

  /**
   * Оптимизированная отрисовка снега
   */
  drawAdvancedSnow(ctx) {
    // Используем один цвет для всех снежинок
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    this.currentEffects.snow.forEach(flake => {
      const swingX = Math.sin(this.time * flake.swingSpeed + flake.swingOffset) * flake.swingAmplitude;

      ctx.save();
      ctx.translate(flake.x + swingX, flake.y);
      ctx.rotate(flake.rotation);
      ctx.globalAlpha = flake.opacity;

      // Упрощенная отрисовка снежинок
      if (flake.shape === 'star') {
        this.drawSimpleSnowflakeStar(ctx, flake.size);
      } else {
        this.drawSimpleSnowflakeCircle(ctx, flake.size);
      }

      ctx.restore();

      // Обновление
      flake.y += flake.speed;
      flake.rotation += flake.rotationSpeed;

      // Упрощенная проверка границ
      if (flake.y > flake.center.y + flake.radius) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * flake.radius * 0.8;
        flake.x = flake.center.x + Math.cos(angle) * distance;
        flake.y = flake.center.y + Math.sin(angle) * distance;
      }
    });
  }

  /**
   * Упрощенная звездообразная снежинка
   */
  drawSimpleSnowflakeStar(ctx, size) {
    const rays = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;

    for (let i = 0; i < rays; i++) {
      const angle = (Math.PI * 2 / rays) * i;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
      ctx.stroke();
    }

    // Простой центр
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Упрощенная круглая снежинка
   */
  drawSimpleSnowflakeCircle(ctx, size) {
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Рисование звездообразной снежинки
   */
  drawSnowflakeStar(ctx, size) {
    const rays = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.strokeStyle = 'rgba(200, 230, 255, 0.8)';
    ctx.lineWidth = 1;

    for (let i = 0; i < rays; i++) {
      const angle = (Math.PI * 2 / rays) * i;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
      ctx.stroke();

      // Ответвления
      const branchLength = size * 0.5;
      const branchAngle1 = angle - Math.PI / 6;
      const branchAngle2 = angle + Math.PI / 6;
      
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size * 0.6, Math.sin(angle) * size * 0.6);
      ctx.lineTo(Math.cos(branchAngle1) * branchLength, Math.sin(branchAngle1) * branchLength);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size * 0.6, Math.sin(angle) * size * 0.6);
      ctx.lineTo(Math.cos(branchAngle2) * branchLength, Math.sin(branchAngle2) * branchLength);
      ctx.stroke();
    }

    // Центральная часть
    const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
    centerGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    centerGradient.addColorStop(1, 'rgba(230, 245, 255, 0.5)');
    
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Рисование шестиугольной снежинки
   */
  drawSnowflakeHexagon(ctx, size) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = 'rgba(200, 230, 255, 0.7)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Внутренний градиент
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.7);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(230, 245, 255, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Рисование круглой снежинки
   */
  drawSnowflakeCircle(ctx, size) {
    const gradient = ctx.createRadialGradient(
      -size * 0.2, -size * 0.2, 0,
      0, 0, size
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.7, 'rgba(245, 250, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(220, 235, 255, 0.4)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    // Блик
    const highlightGradient = ctx.createRadialGradient(
      -size * 0.3, -size * 0.3, 0,
      -size * 0.3, -size * 0.3, size * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Оптимизированная отрисовка ветра
   */
  drawAdvancedWind(ctx) {
    // Используем один цвет для всех линий ветра
    ctx.strokeStyle = 'rgba(180, 200, 220, 0.6)';
    ctx.lineCap = 'round';

    this.currentEffects.wind.forEach(line => {
      // Упрощенное турбулентное смещение
      const turbulence = Math.sin(this.time * 0.03 + line.phase) * line.turbulence;
      
      const endX = line.x + Math.cos(line.angle) * line.length;
      const endY = line.y + Math.sin(line.angle) * line.length + turbulence;

      ctx.lineWidth = line.width;

      // Рисуем простую прямую линию вместо кривой
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Обновление
      line.x += Math.cos(line.angle) * line.speed;
      line.y += Math.sin(line.angle) * line.speed;

      // Упрощенная проверка границ
      if (line.x < line.center.x - line.radius || 
          line.x > line.center.x + line.radius ||
          line.y < line.center.y - line.radius || 
          line.y > line.center.y + line.radius) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * line.radius;
        line.x = line.center.x + Math.cos(angle) * dist;
        line.y = line.center.y + Math.sin(angle) * dist;
      }
    });
  }

  /**
   * Отрисовка молний (из предыдущей версии)
   */
  drawLightning(ctx) {
    const lightning = this.currentEffects.lightning;
    if (!lightning) return;
    
    const now = Date.now();

    if (!lightning.active && now >= lightning.nextStrike) {
      lightning.active = true;
      lightning.flashDuration = 150 + Math.random() * 100;
      lightning.flashStart = now;
      lightning.branches = this.generateLightningBranches(lightning.center, lightning.radius);
    }

    if (lightning.active) {
      const elapsed = now - lightning.flashStart;
      const progress = elapsed / lightning.flashDuration;

      if (progress < 1) {
        const alpha = Math.sin(progress * Math.PI) * 0.9;
        
        // Свечение
        const gradient = ctx.createRadialGradient(
          lightning.center.x, lightning.center.y, 0,
          lightning.center.x, lightning.center.y, lightning.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.4})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.25})`);
        gradient.addColorStop(1, 'rgba(150, 180, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Ветви молнии
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 3 + Math.random() * 2;
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(150, 200, 255, 0.9)';
        
        lightning.branches.forEach(branch => {
          ctx.beginPath();
          ctx.moveTo(branch[0].x, branch[0].y);
          for (let i = 1; i < branch.length; i++) {
            ctx.lineTo(branch[i].x, branch[i].y);
          }
          ctx.stroke();
        });

        ctx.shadowBlur = 0;
      } else {
        lightning.active = false;
        lightning.nextStrike = now + Math.random() * 6000 + 4000;
      }
    }
  }

  /**
   * Генерация ветвей молнии
   */
  generateLightningBranches(center, radius) {
    const branches = [];
    const mainBranch = [];
    
    const startX = center.x + (Math.random() - 0.5) * radius * 0.3;
    const startY = center.y - radius * 0.9;
    const endY = center.y + radius * 0.9;
    
    mainBranch.push({ x: startX, y: startY });
    
    const segments = 18;
    for (let i = 1; i <= segments; i++) {
      const y = startY + ((endY - startY) / segments) * i;
      const x = mainBranch[i - 1].x + (Math.random() - 0.5) * 35;
      mainBranch.push({ x, y });
    }
    
    branches.push(mainBranch);
    
    const branchCount = 4 + Math.floor(Math.random() * 5);
    for (let b = 0; b < branchCount; b++) {
      const branchStart = Math.floor(Math.random() * (mainBranch.length - 3)) + 2;
      const subBranch = [mainBranch[branchStart]];
      
      const subSegments = 3 + Math.floor(Math.random() * 5);
      for (let i = 1; i <= subSegments; i++) {
        const lastPoint = subBranch[i - 1];
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        const distance = 25 + Math.random() * 50;
        
        subBranch.push({
          x: lastPoint.x + Math.cos(angle) * distance,
          y: lastPoint.y + Math.sin(Math.PI / 2) * distance
        });
      }
      
      branches.push(subBranch);
    }
    
    return branches;
  }

  /**
   * Оптимизированный цикл анимации
   */
  animate() {
    if (!this.isAnimating || !this.weatherData || !this.currentCity) {
      return;
    }

    this.time++;

    // Очищаем все слои
    this.cloudsCtx.clearRect(0, 0, this.cloudsCanvas.width, this.cloudsCanvas.height);
    this.sunCtx.clearRect(0, 0, this.sunCanvas.width, this.sunCanvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particlesCtx.clearRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);

    const coords = this.cityCoordinates[this.currentCity];
    if (!coords) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }

    // Проверяем, что карта инициализирована
    if (!this.map || !this.map.getContainer()) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }

    const cityPoint = this.map.latLngToContainerPoint(coords);
    const radius = this.getEffectRadius(this.currentCity);

    // Рисуем облака
    this.drawClouds(this.cloudsCtx);

    // Рисуем солнце
    if (this.currentEffects.sun) {
      this.drawSun(this.sunCtx);
    }

    // Создаём клип-маску
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cityPoint.x, cityPoint.y, radius, 0, Math.PI * 2);
    this.ctx.clip();

    // Рисуем ветер
    if (this.weatherData.windSpeed > 3) {
      this.drawAdvancedWind(this.ctx);
    }

    // Рисуем осадки
    if (this.weatherData.precipitation > 0.1) {
      if (this.weatherData.temperature < 5) {
        this.drawAdvancedSnow(this.ctx);
      } else {
        this.drawAdvancedRain(this.ctx);
      }
    }

    // Рисуем молнии
    if (this.currentEffects.lightning) {
      this.drawLightning(this.ctx);
    }

    this.ctx.restore();

    // Статичная граница без мерцания (обновляем только каждый 10-й кадр)
    if (this.time % 10 === 0) {
      this.ctx.strokeStyle = `rgba(59, 130, 246, 0.6)`; // Фиксированная прозрачность без пульсации
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([12, 8]);
      this.ctx.lineDashOffset = -(this.time * 0.05) % 20; // Очень медленное вращение
      this.ctx.beginPath();
      this.ctx.arc(cityPoint.x, cityPoint.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.setLineDash([]);
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Обновление эффектов
   */
  updateEffects() {
    if (!this.isAnimating || !this.currentCity || !this.weatherData) return;
    
    // Обновляем позицию центра эффектов
    const coords = this.cityCoordinates[this.currentCity];
    if (!coords) return;
    
    // Проверяем, что карта инициализирована
    if (!this.map || !this.map.getContainer()) return;
    
    const cityPoint = this.map.latLngToContainerPoint(coords);
    const radius = this.getEffectRadius(this.currentCity);
    
    // Обновляем центр для всех эффектов
    this.currentEffects.rain.forEach(drop => {
      drop.center = cityPoint;
      drop.radius = radius;
    });
    
    this.currentEffects.snow.forEach(flake => {
      flake.center = cityPoint;
      flake.radius = radius;
    });
    
    // Обновляем реалистичные облака
    if (this.realisticClouds) {
      this.realisticClouds.setEffectArea(this.currentCity, cityPoint, radius);
    }
  }

  /**
   * Плавное затухание
   */
  fadeOutEffects(callback) {
    let opacity = 1;
    const fadeInterval = setInterval(() => {
      opacity -= 0.1;
      [this.cloudsCtx, this.sunCtx, this.ctx, this.particlesCtx].forEach(ctx => {
        if (ctx) ctx.globalAlpha = opacity;
      });
      
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        // Не останавливаем эффекты полностью, только очищаем
        [this.cloudsCtx, this.sunCtx, this.ctx, this.particlesCtx].forEach(ctx => {
          if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalAlpha = 1;
          }
        });
        if (callback) callback();
      }
    }, 50);
  }

  /**
   * Остановка эффектов
   */
  stopEffects() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    [this.cloudsCtx, this.sunCtx, this.ctx, this.particlesCtx].forEach(ctx => {
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalAlpha = 1;
      }
    });
  }

  /**
   * Уничтожение renderer
   */
  destroy() {
    this.stopEffects();
    
    [this.cloudsCanvas, this.sunCanvas, this.canvas, this.particlesCanvas].forEach(canvas => {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    });
    
    this.cloudsCanvas = null;
    this.sunCanvas = null;
    this.canvas = null;
    this.particlesCanvas = null;
  }
}

export default AdvancedWeatherEffectsRenderer;

