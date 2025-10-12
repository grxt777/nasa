import React, { useEffect, useRef, useState, memo } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import AdvancedWeatherEffectsRenderer from '../utils/advancedWeatherEffects';

// Настройка Cesium для работы с Vite
window.CESIUM_BASE_URL = '/Cesium/';

const Map3D = memo(({ selectedCity, onCitySelect, cities, weatherData, onMapClick, isWaitingForMapClick }) => {
  const cesiumContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const entitiesRef = useRef([]);
  const effectsRendererRef = useRef(null);
  const userEntityRef = useRef(null);

  useEffect(() => {
    if (!cesiumContainerRef.current) return;

    // Инициализация Cesium Viewer с космическим фоном
    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
      terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Временно, заменим ниже
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      infoBox: false,
      selectionIndicator: false,
      // Космические настройки фона
      skyBox: true,
      skyAtmosphere: false,
    });

    viewerRef.current = viewer;

    // Используем простой базовый рельеф
    try {
      // Используем базовый рельеф для стабильности
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      
      // Небольшое увеличение рельефа для видимости
      if (viewer.scene.globe && viewer.scene.globe.terrainExaggeration !== undefined) {
        viewer.scene.globe.terrainExaggeration = 1.2;
      }
      
      console.log('Basic terrain loaded');
    } catch (error) {
      console.log('Terrain setup failed:', error);
    }

    // Космические настройки фона
    try {
      // Устанавливаем космический фон
      viewer.scene.backgroundColor = Cesium.Color.BLACK;
      
      // Создаем простой космический skybox
      const createStarField = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Градиентный фон
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Добавляем звезды
        ctx.fillStyle = 'white';
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const size = Math.random() * 2 + 0.5;
          const opacity = Math.random() * 0.8 + 0.2;
          
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        return canvas.toDataURL();
      };
      
      const starFieldImage = createStarField();
      
      // Устанавливаем космический skybox
      viewer.scene.skyBox = new Cesium.SkyBox({
        sources: {
          positiveX: starFieldImage,
          negativeX: starFieldImage,
          positiveY: starFieldImage,
          negativeY: starFieldImage,
          positiveZ: starFieldImage,
          negativeZ: starFieldImage
        }
      });
      
      // Отключаем атмосферу для космического вида
      viewer.scene.skyAtmosphere.show = false;
      
      // Добавляем космические эффекты
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.dynamicAtmosphereLighting = false;
      
      // Добавляем космические туманности в виде частиц
      const nebulaPositions = [
        { lng: 0, lat: 0, height: 50000000 },
        { lng: 180, lat: 0, height: 40000000 },
        { lng: -180, lat: 0, height: 45000000 },
        { lng: 0, lat: 90, height: 35000000 },
        { lng: 0, lat: -90, height: 38000000 }
      ];
      
      nebulaPositions.forEach((pos, index) => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, pos.height),
          ellipsoid: {
            radii: new Cesium.Cartesian3(10000000, 10000000, 10000000),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.Color(
                0.2 + Math.random() * 0.3, // R
                0.1 + Math.random() * 0.2, // G  
                0.3 + Math.random() * 0.4, // B
                0.1 // Alpha
              )
            ),
            outline: false
          }
        });
      });
      
      console.log('Space theme with nebulas applied');
    } catch (error) {
      console.log('Could not apply space theme:', error);
    }

    // Настройка камеры с учетом рельефа
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 0, 15000000),
      orientation: {
        heading: 0.0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0.0
      }
    });

    // Упрощенные настройки камеры
    try {
      // Базовые настройки камеры
      viewer.camera.maximumZoomDistance = 20000000;
      viewer.camera.minimumZoomDistance = 1000;
      
      console.log('Camera settings applied');
    } catch (error) {
      console.log('Could not apply camera settings:', error);
    }

    // Используем только самые надежные провайдеры
    try {
      // Удаляем все существующие слои
      viewer.imageryLayers.removeAll();
      
      let layerLoaded = false;
      
      // Попытка 1: OpenStreetMap (самый надежный)
      try {
        const osmLayer = viewer.imageryLayers.addImageryProvider(
          new Cesium.OpenStreetMapImageryProvider({
            url: 'https://a.tile.openstreetmap.org/',
            maximumLevel: 18
          })
        );
        
        osmLayer.alpha = 1.0;
        osmLayer.brightness = 1.0;
        osmLayer.contrast = 1.0;
        layerLoaded = true;
        console.log('OpenStreetMap loaded successfully');
      } catch (osmError) {
        console.log('OpenStreetMap failed, trying alternative:', osmError);
        
        // Попытка 2: Альтернативный OSM сервер
        try {
          const osmAltLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.OpenStreetMapImageryProvider({
              url: 'https://tile.openstreetmap.org/',
              maximumLevel: 18
            })
          );
          
          osmAltLayer.alpha = 1.0;
          osmAltLayer.brightness = 1.0;
          osmAltLayer.contrast = 1.0;
          layerLoaded = true;
          console.log('Alternative OpenStreetMap loaded');
        } catch (osmAltError) {
          console.log('All OpenStreetMap servers failed:', osmAltError);
        }
      }
      
      if (!layerLoaded) {
        console.log('No imagery layer could be loaded, using default globe');
      }
      
    } catch (error) {
      console.log('Could not load any imagery layer:', error);
    }

    // Добавляем простой видимый рельеф
    try {
      // Создаем несколько гор для демонстрации рельефа
      const mountains = [
        { lng: 0, lat: 0, height: 3000, radius: 500000 },
        { lng: 10, lat: 10, height: 2500, radius: 400000 },
        { lng: -10, lat: -10, height: 3500, radius: 600000 },
        { lng: 20, lat: -20, height: 4000, radius: 700000 }
      ];

      mountains.forEach((mountain, index) => {
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(mountain.lng, mountain.lat, mountain.height),
          ellipsoid: {
            radii: new Cesium.Cartesian3(mountain.radius, mountain.radius, mountain.height),
            material: Cesium.Color.BROWN.withAlpha(0.8),
            outline: true,
            outlineColor: Cesium.Color.DARKBROWN
          }
        });
      });

      // Добавляем несколько холмов
      const hills = [
        { lng: 5, lat: 5, height: 1000 },
        { lng: -5, lat: 5, height: 800 },
        { lng: 5, lat: -5, height: 1200 },
        { lng: -5, lat: -5, height: 900 }
      ];

      hills.forEach(hill => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(hill.lng, hill.lat, hill.height),
          cylinder: {
            length: hill.height,
            topRadius: 100000,
            bottomRadius: 150000,
            material: Cesium.Color.SADDLEBROWN.withAlpha(0.7),
            outline: true,
            outlineColor: Cesium.Color.BROWN
          }
        });
      });

      console.log('Simple terrain geometry added');
    } catch (error) {
      console.log('Could not add terrain geometry:', error);
    }

    // Добавление маркеров городов
    const entities = cities.map(city => {
      const isSelected = selectedCity?.id === city.id;
      
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(city.lng, city.lat),
        billboard: {
          image: isSelected ? 
            'data:image/svg+xml;base64,' + btoa(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#00d4ff" stroke="#ffffff" stroke-width="2"/>
                <circle cx="20" cy="20" r="8" fill="#ffffff"/>
                <circle cx="15" cy="15" r="2" fill="#ffffff"/>
                <circle cx="25" cy="12" r="1.5" fill="#ffffff"/>
                <circle cx="18" cy="25" r="1" fill="#ffffff"/>
              </svg>
            `) :
            'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#ffffff" stroke="#00d4ff" stroke-width="2"/>
                <circle cx="16" cy="16" r="4" fill="#00d4ff"/>
                <path d="M16 4 L18 12 L26 16 L18 20 L16 28 L14 20 L6 16 L14 12 Z" fill="#ffffff"/>
              </svg>
            `),
          scale: 1.0,
          pixelOffset: new Cesium.Cartesian2(0, -16),
          eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -1000.0),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: city.name,
          font: '14pt sans-serif',
          fillColor: Cesium.Color.CYAN,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -50),
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
          backgroundPadding: new Cesium.Cartesian2(8, 4),
        }
      });

      // Обработчик клика
      entity.clickHandler = () => {
        onCitySelect(city);
      };

      return entity;
    });

    entitiesRef.current = entities;

    // Обработчик кликов по карте
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((event) => {
      const pickedObject = viewer.scene.pick(event.position);
      
      if (isWaitingForMapClick && !pickedObject) {
        const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);

          // Удаляем существующий маркер пользователя
          if (userEntityRef.current) {
            viewer.entities.remove(userEntityRef.current);
          }

          // Создаем новый маркер пользователя в космическом стиле
          userEntityRef.current = viewer.entities.add({
            position: cartesian,
            billboard: {
              image: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#ff6b6b" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="#ffffff"/>
                  <path d="M12 2 L14 8 L20 10 L14 12 L12 18 L10 12 L4 10 L10 8 Z" fill="#ffffff"/>
                </svg>
              `),
              scale: 1.0,
              pixelOffset: new Cesium.Cartesian2(0, -12),
            },
            label: {
              text: 'Выбранное местоположение',
              font: '12pt sans-serif',
              fillColor: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -35),
              showBackground: true,
              backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
              backgroundPadding: new Cesium.Cartesian2(6, 3),
            }
          });

          if (onMapClick) {
            onMapClick(latitude, longitude);
          }
        }
      } else if (pickedObject && pickedObject.id && pickedObject.id.clickHandler) {
        pickedObject.id.clickHandler();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Подгонка камеры под все маркеры
    if (cities.length > 0) {
      viewer.zoomTo(viewer.entities);
    }

    return () => {
      handler.destroy();
      viewer.destroy();
    };
  }, []);

  // Обновление маркеров при изменении выбранного города
  useEffect(() => {
    if (!viewerRef.current || entitiesRef.current.length === 0) return;

    entitiesRef.current.forEach((entity, index) => {
      const city = cities[index];
      const isSelected = selectedCity?.id === city.id;
      
      entity.billboard.image = isSelected ? 
        'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#00d4ff" stroke="#ffffff" stroke-width="2"/>
            <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            <circle cx="15" cy="15" r="2" fill="#ffffff"/>
            <circle cx="25" cy="12" r="1.5" fill="#ffffff"/>
            <circle cx="18" cy="25" r="1" fill="#ffffff"/>
          </svg>
        `) :
        'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#ffffff" stroke="#00d4ff" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="#00d4ff"/>
            <path d="M16 4 L18 12 L26 16 L18 20 L16 28 L14 20 L6 16 L14 12 Z" fill="#ffffff"/>
          </svg>
        `);
    });

    // Центрирование камеры на выбранном городе
    if (selectedCity) {
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(selectedCity.lng, selectedCity.lat, 1000000),
        duration: 2.0
      });
    }
  }, [selectedCity, cities]);

  // Инициализация рендерера погодных эффектов (упрощенная версия)
  useEffect(() => {
    if (!viewerRef.current) return;

    // Пока отключаем сложные эффекты для стабильности
    // В будущем можно добавить простые 3D эффекты
    console.log('3D map initialized with', cities.length, 'cities');

    return () => {
      if (effectsRendererRef.current) {
        effectsRendererRef.current.destroy();
      }
    };
  }, [cities]);

  // Рендеринг погодных эффектов (упрощенная версия)
  useEffect(() => {
    if (!selectedCity || !weatherData) {
      return;
    }

    const effectsData = {
      temperature: weatherData.temperature?.average || 0,
      humidity: weatherData.humidity?.average || 0,
      windSpeed: weatherData.wind?.average || 0,
      precipitation: weatherData.precipitation?.average || 0,
      uvIndex: weatherData.uv?.average || 0,
      comfortScore: weatherData.comfort?.score || 5
    };

    console.log('Weather data for 3D map:', selectedCity.name, effectsData);
    
    // Простая визуализация температуры через цвет маркера
    if (viewerRef.current && entitiesRef.current.length > 0) {
      const cityIndex = cities.findIndex(c => c.id === selectedCity.id);
      if (cityIndex !== -1 && entitiesRef.current[cityIndex]) {
        const entity = entitiesRef.current[cityIndex];
        const temp = effectsData.temperature;
        
        // Определяем цвет в зависимости от температуры
        let color = '#3b82f6'; // синий по умолчанию
        if (temp < 0) color = '#1e40af'; // темно-синий для мороза
        else if (temp < 10) color = '#3b82f6'; // синий для холода
        else if (temp < 20) color = '#10b981'; // зеленый для прохлады
        else if (temp < 30) color = '#f59e0b'; // желтый для тепла
        else color = '#ef4444'; // красный для жары
        
        // Обновляем цвет маркера в космическом стиле
        entity.billboard.image = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            <text x="20" y="25" text-anchor="middle" font-size="10" fill="${color}" font-weight="bold">${Math.round(temp)}°</text>
            <circle cx="15" cy="15" r="2" fill="#ffffff"/>
            <circle cx="25" cy="12" r="1.5" fill="#ffffff"/>
          </svg>
        `);
      }
    }
  }, [selectedCity, weatherData]);

  // Очистка пользовательского маркера
  useEffect(() => {
    if (!isWaitingForMapClick && userEntityRef.current && viewerRef.current) {
      viewerRef.current.entities.remove(userEntityRef.current);
      userEntityRef.current = null;
    }
  }, [isWaitingForMapClick]);

  return (
    <div className="relative w-full max-w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[500px] rounded-lg overflow-hidden border border-cyan-300 shadow-lg bg-gradient-to-br from-slate-900 to-black">
      <div ref={cesiumContainerRef} className="w-full h-full" />
      
      {/* Map Click Mode Indicator */}
      {isWaitingForMapClick && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-10 border border-cyan-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">🌌 Click on map to place beacon</span>
          </div>
        </div>
      )}
    </div>
  );
});

Map3D.displayName = 'Map3D';

export default Map3D;
