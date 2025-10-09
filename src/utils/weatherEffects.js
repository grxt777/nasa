/**
 * Модуль визуализации погодных эффектов на карте
 * Отображает динамические эффекты над выбранным городом
 * Улучшенная версия с реалистичными визуальными эффектами
 */

class WeatherEffectsRenderer {
  constructor(map, cityCoordinates) {
    this.map = map;
    this.cityCoordinates = cityCoordinates;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.currentEffects = {
      rain: [],
      wind: [],
      snow: [],
      particles: [],
      lightning: null
    };
    this.isAnimating = false;
    this.currentCity = null;
    this.weatherData = null;
    this.time = 0;
    this.weatherLayers = {};
  }

  /**
   * Инициализация canvas слоя над картой
   */
  initialize() {
    if (this.canvas) return;

    // Создаём canvas overlay
    const mapContainer = this.map.getContainer();
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '400';
    this.canvas.width = mapContainer.offsetWidth;
    this.canvas.height = mapContainer.offsetHeight;
    
    mapContainer.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Обновляем размер при изменении карты
    this.map.on('resize', () => this.resizeCanvas());
    this.map.on('move', () => this.updateEffects());
    this.map.on('zoom', () => this.updateEffects());
  }

  /**
   * Изменение размера canvas
   */
  resizeCanvas() {
    if (!this.canvas) return;
    const mapContainer = this.map.getContainer();
    this.canvas.width = mapContainer.offsetWidth;
    this.canvas.height = mapContainer.offsetHeight;
  }

  /**
   * Главная функция рендеринга погодных эффектов
   */
  renderWeatherEffects(cityName, weatherData) {
    this.initialize();
    
    // Плавное затухание старых эффектов
    if (this.currentCity !== cityName) {
      this.fadeOutEffects(() => {
        this.currentCity = cityName;
        this.weatherData = weatherData;
        this.startEffects();
      });
    } else {
      this.weatherData = weatherData;
      this.startEffects();
    }
  }

  /**
   * Запуск эффектов
   */
  startEffects() {
    if (!this.weatherData || !this.currentCity) return;

    // Очищаем старые эффекты
    this.currentEffects = {
      rain: [],
      wind: [],
      snow: [],
      particles: []
    };

    // Получаем координаты города
    const coords = this.cityCoordinates[this.currentCity];
    if (!coords) return;

    const cityPoint = this.map.latLngToContainerPoint(coords);
    const radius = this.getEffectRadius();

    // Инициализируем эффекты на основе данных
    if (this.weatherData.precipitation > 0.3) {
      this.initRainEffect(cityPoint, radius, this.weatherData.precipitation);
    }

    if (this.weatherData.windSpeed > 5) {
      this.initWindEffect(cityPoint, radius, this.weatherData.windSpeed);
    }

    if (this.weatherData.temperature < 5 && this.weatherData.precipitation > 0.3) {
      this.initSnowEffect(cityPoint, radius, this.weatherData.precipitation);
    }

    // Запускаем анимацию
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  /**
   * Получить радиус эффектов в пикселях (зависит от зума)
   */
  getEffectRadius() {
    const zoom = this.map.getZoom();
    // Радиус ~30-50 км в пикселях
    const baseRadius = 80;
    return baseRadius * Math.pow(1.5, zoom - 8);
  }

  /**
   * Инициализация эффекта дождя (улучшенная версия)
   */
  initRainEffect(center, radius, intensity) {
    // Значительно увеличиваем количество капель для реалистичности
    const particleCount = Math.floor(intensity * 300 + 200);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance - Math.random() * radius;

      this.currentEffects.rain.push({
        x,
        y,
        length: 15 + Math.random() * 25, // Увеличена длина капель
        speed: 8 + Math.random() * 12, // Увеличена скорость
        opacity: 0.4 + Math.random() * 0.6,
        width: 1 + Math.random() * 1.5, // Добавлена переменная толщина
        center,
        radius
      });
    }
    
    // Добавляем возможность грозы при сильных осадках
    if (intensity > 5) {
      this.currentEffects.lightning = {
        active: false,
        nextStrike: Date.now() + Math.random() * 5000 + 3000,
        flashDuration: 0,
        center,
        radius
      };
    }
  }

  /**
   * Инициализация эффекта снега (улучшенная версия)
   */
  initSnowEffect(center, radius, intensity) {
    const particleCount = Math.floor(intensity * 150 + 100);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance - Math.random() * radius;

      this.currentEffects.snow.push({
        x,
        y,
        size: 2 + Math.random() * 4,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.6 + Math.random() * 0.4,
        drift: Math.random() * 3 - 1.5,
        swingAmplitude: Math.random() * 20 + 10, // Амплитуда качания
        swingSpeed: Math.random() * 0.05 + 0.02, // Скорость качания
        swingOffset: Math.random() * Math.PI * 2, // Начальное смещение
        center,
        radius
      });
    }
  }

  /**
   * Инициализация эффекта ветра (улучшенная версия)
   */
  initWindEffect(center, radius, speed) {
    const lineCount = Math.floor(speed * 15 + 30);
    
    for (let i = 0; i < lineCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance;
      
      // Направление ветра с небольшой вариацией
      const windAngle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;

      this.currentEffects.wind.push({
        x,
        y,
        length: 30 + Math.random() * 50,
        angle: windAngle,
        speed: speed / 1.5,
        opacity: 0.3 + Math.random() * 0.4,
        width: 1 + Math.random() * 2,
        wave: Math.random() * 5,
        center,
        radius
      });
    }
  }

  /**
   * Отрисовка эффекта дождя (улучшенная версия)
   */
  drawRainEffect(ctx) {
    this.currentEffects.rain.forEach(drop => {
      // Градиент для более реалистичных капель
      const gradient = ctx.createLinearGradient(
        drop.x, drop.y,
        drop.x, drop.y + drop.length
      );
      gradient.addColorStop(0, `rgba(174, 194, 224, ${drop.opacity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(174, 194, 224, ${drop.opacity})`);
      gradient.addColorStop(1, `rgba(174, 194, 224, ${drop.opacity * 0.5})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = drop.width;
      ctx.lineCap = 'round';
      
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + 2, drop.y + drop.length); // Небольшой наклон
      ctx.stroke();

      // Обновляем позицию
      drop.y += drop.speed;
      drop.x += 0.5; // Легкий снос ветром

      // Если капля вышла за пределы - перезапускаем сверху
      if (drop.y > drop.center.y + drop.radius) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * drop.radius;
        drop.x = drop.center.x + Math.cos(angle) * distance;
        drop.y = drop.center.y - drop.radius;
      }
    });

    // Рисуем молнии если есть гроза
    if (this.currentEffects.lightning) {
      this.drawLightning(ctx);
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Отрисовка молний
   */
  drawLightning(ctx) {
    const lightning = this.currentEffects.lightning;
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
        const alpha = Math.sin(progress * Math.PI) * 0.8;
        
        // Свечение вокруг города
        const gradient = ctx.createRadialGradient(
          lightning.center.x, lightning.center.y, 0,
          lightning.center.x, lightning.center.y, lightning.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.2})`);
        gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Рисуем ветви молнии
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2 + Math.random();
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(150, 200, 255, 0.8)';
        
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
        lightning.nextStrike = now + Math.random() * 8000 + 5000;
      }
    }
  }

  /**
   * Генерация ветвей молнии
   */
  generateLightningBranches(center, radius) {
    const branches = [];
    const mainBranch = [];
    
    // Главная ветвь
    const startX = center.x + (Math.random() - 0.5) * radius * 0.3;
    const startY = center.y - radius * 0.8;
    const endY = center.y + radius * 0.8;
    
    mainBranch.push({ x: startX, y: startY });
    
    const segments = 15;
    for (let i = 1; i <= segments; i++) {
      const y = startY + ((endY - startY) / segments) * i;
      const x = mainBranch[i - 1].x + (Math.random() - 0.5) * 30;
      mainBranch.push({ x, y });
    }
    
    branches.push(mainBranch);
    
    // Ответвления
    const branchCount = 3 + Math.floor(Math.random() * 4);
    for (let b = 0; b < branchCount; b++) {
      const branchStart = Math.floor(Math.random() * (mainBranch.length - 3)) + 2;
      const subBranch = [mainBranch[branchStart]];
      
      const subSegments = 3 + Math.floor(Math.random() * 4);
      for (let i = 1; i <= subSegments; i++) {
        const lastPoint = subBranch[i - 1];
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        const distance = 20 + Math.random() * 40;
        
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
   * Отрисовка эффекта снега (улучшенная версия)
   */
  drawSnowEffect(ctx) {
    this.currentEffects.snow.forEach(flake => {
      // Добавляем качающееся движение
      const swingX = Math.sin(this.time * flake.swingSpeed + flake.swingOffset) * flake.swingAmplitude;
      
      // Градиент для объемных снежинок
      const gradient = ctx.createRadialGradient(
        flake.x + swingX, flake.y, 0,
        flake.x + swingX, flake.y, flake.size
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity})`);
      gradient.addColorStop(0.7, `rgba(255, 255, 255, ${flake.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(230, 240, 255, ${flake.opacity * 0.3})`);
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 1;
      
      // Рисуем снежинку
      ctx.beginPath();
      ctx.arc(flake.x + swingX, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Добавляем блик
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.6})`;
      ctx.beginPath();
      ctx.arc(flake.x + swingX - flake.size * 0.3, flake.y - flake.size * 0.3, flake.size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Обновляем позицию
      flake.y += flake.speed;
      flake.x += flake.drift * 0.5;

      // Если снежинка вышла за пределы - перезапускаем сверху
      if (flake.y > flake.center.y + flake.radius) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * flake.radius;
        flake.x = flake.center.x + Math.cos(angle) * distance;
        flake.y = flake.center.y - flake.radius;
      }
    });

    ctx.globalAlpha = 1;
  }

  /**
   * Отрисовка эффекта ветра (улучшенная версия)
   */
  drawWindEffect(ctx) {
    this.currentEffects.wind.forEach(line => {
      // Волнообразное движение
      const waveOffset = Math.sin(this.time * 0.05 + line.wave) * 10;
      
      const endX = line.x + Math.cos(line.angle) * line.length;
      const endY = line.y + Math.sin(line.angle) * line.length + waveOffset;

      // Градиент для более реалистичного ветра
      const gradient = ctx.createLinearGradient(
        line.x, line.y,
        endX, endY
      );
      gradient.addColorStop(0, `rgba(200, 220, 240, ${line.opacity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(180, 200, 220, ${line.opacity})`);
      gradient.addColorStop(1, `rgba(200, 220, 240, ${line.opacity * 0.2})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      
      // Рисуем изогнутую линию
      const midX = (line.x + endX) / 2;
      const midY = (line.y + endY) / 2 + waveOffset * 0.5;
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      // Обновляем позицию
      line.x += Math.cos(line.angle) * line.speed;
      line.y += Math.sin(line.angle) * line.speed;

      // Если линия вышла за пределы - перезапускаем
      const distance = Math.sqrt(
        Math.pow(line.x - line.center.x, 2) + 
        Math.pow(line.y - line.center.y, 2)
      );
      
      if (distance > line.radius) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * line.radius;
        line.x = line.center.x + Math.cos(angle) * dist;
        line.y = line.center.y + Math.sin(angle) * dist;
      }
    });

    ctx.globalAlpha = 1;
  }

  /**
   * Отрисовка UV свечения (улучшенная версия)
   */
  drawUVGlow(ctx, cityPoint, radius, uvIndex) {
    if (uvIndex <= 6) return;

    const intensity = Math.min((uvIndex - 6) / 5, 1);
    
    // Пульсирующее свечение
    const pulseIntensity = 0.8 + Math.sin(this.time * 0.05) * 0.2;
    
    // Внешний слой свечения
    const outerGradient = ctx.createRadialGradient(
      cityPoint.x, cityPoint.y, 0,
      cityPoint.x, cityPoint.y, radius
    );
    outerGradient.addColorStop(0, `rgba(255, 200, 0, ${0.25 * intensity * pulseIntensity})`);
    outerGradient.addColorStop(0.3, `rgba(255, 170, 0, ${0.15 * intensity * pulseIntensity})`);
    outerGradient.addColorStop(0.6, `rgba(255, 140, 0, ${0.08 * intensity * pulseIntensity})`);
    outerGradient.addColorStop(1, 'rgba(255, 120, 0, 0)');

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(cityPoint.x, cityPoint.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Внутреннее яркое ядро
    const innerGradient = ctx.createRadialGradient(
      cityPoint.x, cityPoint.y, 0,
      cityPoint.x, cityPoint.y, radius * 0.4
    );
    innerGradient.addColorStop(0, `rgba(255, 255, 200, ${0.4 * intensity * pulseIntensity})`);
    innerGradient.addColorStop(0.5, `rgba(255, 220, 100, ${0.2 * intensity * pulseIntensity})`);
    innerGradient.addColorStop(1, 'rgba(255, 180, 50, 0)');

    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(cityPoint.x, cityPoint.y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Лучи солнца
    ctx.save();
    ctx.translate(cityPoint.x, cityPoint.y);
    ctx.rotate(this.time * 0.01);
    
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 / rayCount) * i;
      const rayLength = radius * 0.6;
      
      ctx.strokeStyle = `rgba(255, 220, 100, ${0.2 * intensity * pulseIntensity})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.3, Math.sin(angle) * radius * 0.3);
      ctx.lineTo(Math.cos(angle) * (radius * 0.3 + rayLength), Math.sin(angle) * (radius * 0.3 + rayLength));
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * Отрисовка комфортного свечения (улучшенная версия)
   */
  drawComfortGlow(ctx, cityPoint, radius, score) {
    if (score <= 7) return;

    const intensity = Math.min((score - 7) / 3, 1);
    const pulseIntensity = 0.85 + Math.sin(this.time * 0.03) * 0.15;
    
    // Создаем многослойное свечение
    const layers = [
      { offset: 1.0, color: [100, 220, 255], alpha: 0.05 },
      { offset: 0.8, color: [120, 210, 255], alpha: 0.12 },
      { offset: 0.6, color: [140, 200, 255], alpha: 0.18 },
      { offset: 0.4, color: [160, 190, 255], alpha: 0.25 },
      { offset: 0.2, color: [180, 180, 255], alpha: 0.15 }
    ];

    layers.forEach(layer => {
      const gradient = ctx.createRadialGradient(
        cityPoint.x, cityPoint.y, 0,
        cityPoint.x, cityPoint.y, radius * layer.offset
      );

      gradient.addColorStop(0, `rgba(${layer.color.join(',')}, ${layer.alpha * intensity * pulseIntensity})`);
      gradient.addColorStop(0.5, `rgba(${layer.color.join(',')}, ${layer.alpha * 0.6 * intensity * pulseIntensity})`);
      gradient.addColorStop(1, `rgba(${layer.color.join(',')}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cityPoint.x, cityPoint.y, radius * layer.offset, 0, Math.PI * 2);
      ctx.fill();
    });

    // Добавляем мерцающие частицы
    const particleCount = Math.floor(15 * intensity);
    for (let i = 0; i < particleCount; i++) {
      const angle = (this.time * 0.02 + i) % (Math.PI * 2);
      const distance = radius * 0.5 + Math.sin(this.time * 0.05 + i) * radius * 0.2;
      const x = cityPoint.x + Math.cos(angle) * distance;
      const y = cityPoint.y + Math.sin(angle) * distance;
      const size = 2 + Math.sin(this.time * 0.1 + i) * 1.5;

      const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      particleGradient.addColorStop(0, `rgba(200, 230, 255, ${0.8 * pulseIntensity})`);
      particleGradient.addColorStop(1, 'rgba(150, 200, 255, 0)');

      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Отрисовка смога/дымки (улучшенная версия)
   */
  drawSmogEffect(ctx, cityPoint, radius, score) {
    if (score >= 4) return;

    const intensity = Math.min((4 - score) / 4, 1);
    
    // Создаем несколько слоев дымки для объема
    const smogLayers = 5;
    for (let i = 0; i < smogLayers; i++) {
      const layerRadius = radius * (0.4 + i * 0.15);
      const offset = Math.sin(this.time * 0.01 + i * 1.5) * 15;
      
      const gradient = ctx.createRadialGradient(
        cityPoint.x + offset, cityPoint.y, 0,
        cityPoint.x + offset, cityPoint.y, layerRadius
      );

      const baseAlpha = 0.15 * intensity * (1 - i * 0.15);
      gradient.addColorStop(0, `rgba(140, 130, 120, ${baseAlpha})`);
      gradient.addColorStop(0.4, `rgba(130, 125, 115, ${baseAlpha * 0.8})`);
      gradient.addColorStop(0.7, `rgba(120, 120, 110, ${baseAlpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(110, 115, 105, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cityPoint.x + offset, cityPoint.y, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Добавляем медленно плавающие частицы смога
    const particleCount = Math.floor(30 * intensity);
    for (let i = 0; i < particleCount; i++) {
      const angle = (this.time * 0.008 + i * 0.3) % (Math.PI * 2);
      const distance = (radius * 0.3) + ((this.time * 0.5 + i * 10) % (radius * 0.5));
      const x = cityPoint.x + Math.cos(angle) * distance;
      const y = cityPoint.y + Math.sin(angle) * distance + Math.sin(this.time * 0.01 + i) * 20;
      const size = 8 + Math.sin(this.time * 0.02 + i) * 4;

      const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      particleGradient.addColorStop(0, `rgba(130, 125, 120, ${0.3 * intensity})`);
      particleGradient.addColorStop(0.6, `rgba(120, 115, 110, ${0.15 * intensity})`);
      particleGradient.addColorStop(1, 'rgba(110, 105, 100, 0)');

      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Главный цикл анимации
   */
  animate() {
    if (!this.isAnimating || !this.ctx || !this.weatherData || !this.currentCity) {
      return;
    }

    // Увеличиваем счетчик времени для анимаций
    this.time++;

    // Очищаем canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Получаем текущие координаты города
    const coords = this.cityCoordinates[this.currentCity];
    if (!coords) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }

    const cityPoint = this.map.latLngToContainerPoint(coords);
    const radius = this.getEffectRadius();

    // Создаём клип-маску для эффектов (круг вокруг города)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cityPoint.x, cityPoint.y, radius, 0, Math.PI * 2);
    this.ctx.clip();

    // Рисуем эффекты по условиям
    if (this.weatherData.comfortScore < 4) {
      this.drawSmogEffect(this.ctx, cityPoint, radius, this.weatherData.comfortScore);
    }

    if (this.weatherData.uvIndex > 6) {
      this.drawUVGlow(this.ctx, cityPoint, radius, this.weatherData.uvIndex);
    }

    if (this.weatherData.comfortScore > 7) {
      this.drawComfortGlow(this.ctx, cityPoint, radius, this.weatherData.comfortScore);
    }

    if (this.weatherData.windSpeed > 5) {
      this.drawWindEffect(this.ctx);
    }

    if (this.weatherData.temperature < 5 && this.weatherData.precipitation > 0.3) {
      this.drawSnowEffect(this.ctx);
    } else if (this.weatherData.precipitation > 0.3) {
      this.drawRainEffect(this.ctx);
    }

    this.ctx.restore();

    // Рисуем анимированную границу круга
    const borderPulse = 0.5 + Math.sin(this.time * 0.05) * 0.2;
    
    // Внешняя граница
    this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 * borderPulse})`;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([10, 10]);
    this.ctx.lineDashOffset = -(this.time * 0.5) % 20;
    this.ctx.beginPath();
    this.ctx.arc(cityPoint.x, cityPoint.y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Внутренняя граница
    this.ctx.strokeStyle = `rgba(100, 170, 255, ${0.3 * borderPulse})`;
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineDashOffset = (this.time * 0.3) % 10;
    this.ctx.beginPath();
    this.ctx.arc(cityPoint.x, cityPoint.y, radius * 0.95, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Обновление эффектов при движении карты
   */
  updateEffects() {
    if (!this.isAnimating) return;
    // Эффекты обновятся в следующем кадре анимации
  }

  /**
   * Плавное затухание эффектов
   */
  fadeOutEffects(callback) {
    let opacity = 1;
    const fadeInterval = setInterval(() => {
      opacity -= 0.1;
      if (this.ctx) {
        this.ctx.globalAlpha = opacity;
      }
      
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        this.stopEffects();
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
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * Уничтожение renderer
   */
  destroy() {
    this.stopEffects();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}

export default WeatherEffectsRenderer;

