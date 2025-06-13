import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaMountain, FaWater, FaFire, FaWind } from 'react-icons/fa';
import { WiTornado, WiVolcano, WiTsunami } from 'react-icons/wi';

// Компонент теплової карти
const HeatmapLayer = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (!map) return;

        const heatLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 18,
            gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
};

// --- ДОПОМІЖНІ ФУНКЦІЇ ТА ОБ'ЄКТИ ---

// 1. Визначення стилів за рівнем небезпеки
const getSeverityStyles = (severity) => {
  if (severity >= 5) return { color: '#F7534C', name: 'Critical' };
  if (severity >= 4) return { color: '#C69026', name: 'High' };
  if (severity >= 3) return { color: '#388BFD', name: 'Moderate' };
  return { color: '#3FB950', name: 'Low' };
};

// 2. Зіставлення типів катастроф з правильними іконками
const disasterIcons = {
    Earthquake: <FaMountain />,
    Tsunami: <WiTsunami />,
    Flood: <FaWater />,
    Wildfire: <FaFire />,
    Hurricane: <FaWind />,
    Tornado: <WiTornado />,
    'Volcanic Eruption': <WiVolcano />
};

// 3. Функція для створення статичної іконки
const createIcon = (type, severity) => {
    const color = getSeverityStyles(severity).color;
    // Використовуємо renderToStaticMarkup для перетворення React-компонента (іконки) в HTML-рядок
    const iconMarkup = renderToStaticMarkup(
        React.cloneElement(disasterIcons[type] || <FaMountain />, { color: 'white', size: 14 })
    );

    return L.divIcon({
        html: `<div style="background-color:${color}; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 0 8px #000;">${iconMarkup}</div>`,
        className: '', // Важливо для уникнення конфліктів стилів
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
};

// 4. Функція для створення пульсуючої іконки (для нових подій)
const createPulsingIcon = (severity) => {
    const styles = getSeverityStyles(severity);
    return L.divIcon({
        html: `<div class="pulsing-icon" style="background-color: ${styles.color};"></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
};

// Компонент для анімації хвилі цунамі
const TsunamiWave = () => (
    <div className="tsunami-wave-visual" />
);

// --- ОСНОВНИЙ КОМПОНЕНТ КАРТИ ---

function MapComponent({ disasters, onSelectDisaster, mapRef, isHeatmapVisible }) {
  const [latestDisasterId, setLatestDisasterId] = useState(null);
  const heatPoints = disasters.map(d => [d.latitude, d.longitude, d.severity * 0.2]); // [lat, lng, intensity]

  // Цей ефект відстежує появу нових катастроф, щоб анімувати їх
  useEffect(() => {
      if (disasters && disasters.length > 0) {
          // Припускаємо, що перший елемент у масиві - найновіший
          const newLatestId = disasters[0].id;
          if (newLatestId !== latestDisasterId) {
              setLatestDisasterId(newLatestId);
              // Анімація пульсації буде тривати 15 секунд, потім зникне
              const timer = setTimeout(() => {
                  setLatestDisasterId(null);
              }, 15000);
              
              return () => clearTimeout(timer);
          }
      }
  }, [disasters, latestDisasterId]);

  return (
    <MapContainer 
        center={[30, 15]} // Трохи зміщений центр для кращого огляду Європи
        zoom={3} 
        style={{ height: '100%', width: '100%', backgroundColor: '#010409' }} 
        ref={mapRef}
        minZoom={2}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {isHeatmapVisible ? (
          <HeatmapLayer points={heatPoints} />
      ) : (
          disasters.map(disaster => (
              <React.Fragment key={disaster.id}>
                  {/* Рендеримо динамічні візуалізації для еволюціонуючих катастроф */}
                  {['Hurricane', 'Tornado'].includes(disaster.type) && disaster.path.length > 1 && (
                      <Polyline positions={disaster.path} color={getSeverityStyles(disaster.severity).color} weight={2} dashArray="5, 10" />
                  )}

                  {disaster.type === 'Wildfire' && disaster.radius > 0 && (
                      <Circle 
                          center={[disaster.latitude, disaster.longitude]} 
                          radius={disaster.radius}
                          pathOptions={{ color: '#F7534C', fillColor: '#F7534C', fillOpacity: 0.15, weight: 1 }}
                      />
                  )}

                  {disaster.type === 'Tsunami' && disaster.status === 'active' && (
                      <Circle 
                          center={[disaster.latitude, disaster.longitude]} 
                          radius={disaster.radius}
                          pathOptions={{ color: 'transparent', fillColor: 'transparent' }} // Робимо коло прозорим, щоб бачити лише CSS анімацію
                      >
                          <TsunamiWave />
                      </Circle>
                  )}
                  
                  {/* Рендеримо основний маркер для всіх катастроф */}
                  <Marker 
                      position={[disaster.latitude, disaster.longitude]} 
                      icon={disaster.id === latestDisasterId ? createPulsingIcon(disaster.severity) : createIcon(disaster.type, disaster.severity)}
                      eventHandlers={{
                          click: () => {
                            onSelectDisaster(disaster);
                          },
                      }}
                  >
                      <Popup>
                          <b>{disaster.type}</b>
                          <br/>
                          Severity: {getSeverityStyles(disaster.severity).name} ({disaster.severity})
                      </Popup>
                  </Marker>
              </React.Fragment>
          ))
      )}
    </MapContainer>
  );
}

export default MapComponent;