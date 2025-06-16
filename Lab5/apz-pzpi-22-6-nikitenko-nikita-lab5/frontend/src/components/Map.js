import React, { useEffect, useRef, useMemo, memo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaMountain, FaWater, FaFire, FaWind, FaExclamationCircle } from 'react-icons/fa'; // Removed FaBolt
import { WiTornado, WiVolcano, WiTsunami } from 'react-icons/wi';
import MarkerClusterGroup from 'react-leaflet-cluster';

// *** ВАЖЛИВО: Виправлення для стандартних іконок Leaflet ***
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getSeverityStyles = (severity) => {
    if (severity >= 5) return { color: '#F85149', name: 'Критичний' };
    if (severity >= 4) return { color: '#DAA520', name: 'Високий' };
    if (severity >= 3) return { color: '#58A6FF', name: 'Помірний' };
    return { color: '#3FB950', name: 'Низький' };
};

const getIconComponent = (type) => {
    switch(type) {
        case 'Earthquake': return <FaMountain size={20} />;
        case 'Flood': return <FaWater size={20} />;
        case 'Wildfire': return <FaFire size={20} />;
        case 'Hurricane': return <FaWind size={20} />;
        case 'Tsunami': return <WiTsunami size={20} />;
        case 'Tornado': return <WiTornado size={20} />;
        case 'Volcanic Eruption': return <WiVolcano size={20} />;
        default: return <FaExclamationCircle size={20} />;
    }
};

const iconCache = {};

const createCustomIcon = (type, severity, isPulsing = false) => {
    const key = `${type}-${severity}-${isPulsing}`;
    if (iconCache[key]) {
        return iconCache[key];
    }

    const { color } = getSeverityStyles(severity);
    const iconHtml = renderToStaticMarkup(
        <div style={{
            backgroundColor: color,
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            border: `2px solid ${isPulsing ? 'white' : color}`,
            boxShadow: isPulsing ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none',
            animation: isPulsing ? 'pulse 1.5s infinite' : 'none',
            transform: 'translate(-50%, -50%)',
            position: 'relative'
        }}>
            {getIconComponent(type)}
        </div>
    );

    const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });

    iconCache[key] = customIcon;
    return customIcon;
};

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
    @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.7); }
        50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.6); }
        100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.7); }
    }
    .custom-map-icon {
        background: none !important;
        border: none !important;
    }
`;
document.head.appendChild(styleSheet);

const HeatmapLayer = memo(({ points }) => {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        if (points && points.length > 0) {
            const latLngPoints = points.map(p => [p.latitude, p.longitude, p.severity / 5]);
            heatLayerRef.current = L.heatLayer(latLngPoints, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: {
                    0.0: 'blue',
                    0.4: 'cyan',
                    0.6: 'lime',
                    0.8: 'yellow',
                    1.0: 'red'
                }
            }).addTo(map);
        }

        return () => {
            if (map && heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [map, points]);

    return null;
});

const TsunamiWave = memo(({ center, radius }) => {
    const map = useMap();
    const circleRef = useRef(null);
    const [currentRadius, setCurrentRadius] = useState(0);

    useEffect(() => {
        if (circleRef.current) {
            circleRef.current.setRadius(0);
        }
        setCurrentRadius(0);
    }, [center, radius]);

    useEffect(() => {
        if (!map) return;

        let animationFrameId;
        let startTime = null;
        const duration = 3000;

        const animateCircle = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;

            if (progress < 1) {
                const easedProgress = Math.sin(progress * Math.PI / 2);
                const newRadius = radius * easedProgress;
                setCurrentRadius(newRadius);
                animationFrameId = requestAnimationFrame(animateCircle);
            } else {
                setCurrentRadius(radius);
            }
        };

        animationFrameId = requestAnimationFrame(animateCircle);

        return () => cancelAnimationFrame(animationFrameId);
    }, [map, center, radius]);

    return (
        <Circle
            center={center}
            pathOptions={{ color: '#00FFFF', fillColor: '#00FFFF', fillOpacity: 0.2, weight: 2 }}
            radius={currentRadius}
        />
    );
});

const MapComponent = memo(({ disasters, onSelectDisaster, isHeatmapVisible, mapRef }) => {
    const initialCenter = [48.3794, 31.1656];
    const initialZoom = 6;

    const heatmapPoints = useMemo(() => {
        const safeDisasters = disasters || [];
        return safeDisasters.map(d => ({
            latitude: d.latitude,
            longitude: d.longitude,
            severity: d.severity
        }));
    }, [disasters]);

    const latestDisasterId = useMemo(() => {
        if (!disasters || disasters.length === 0) return null;
        const sortedDisasters = [...disasters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sortedDisasters[0]?.id;
    }, [disasters]);

    return (
        <MapContainer
            center={initialCenter}
            zoom={initialZoom}
            className="map-container"
            ref={mapRef}
            worldCopyJump={true}
            maxBounds={[[ -90, -180 ], [ 90, 180 ]]}
            maxBoundsViscosity={1.0}
            minZoom={2}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                noWrap={false}
            />

            {isHeatmapVisible ? (
                <HeatmapLayer points={heatmapPoints} />
            ) : (
                <MarkerClusterGroup chunkedLoading>
                    {disasters && disasters.map(disaster => ( // Ensure disasters is not null/undefined
                        <React.Fragment key={disaster.id}>
                            {disaster.type === 'Earthquake' && disaster.epicenter_radius_km && (
                                <Circle
                                    center={[disaster.latitude, disaster.longitude]}
                                    radius={disaster.epicenter_radius_km * 1000}
                                    pathOptions={{ color: '#FFD700', fillColor: '#FFD700', fillOpacity: 0.15, weight: 1 }}
                                />
                            )}

                            {/* Added conditional check for disaster.path */}
                            {disaster.type === 'Hurricane' && disaster.path && disaster.path.coordinates && (
                                <Polyline
                                    positions={disaster.path.coordinates.map(coord => [coord[1], coord[0]])}
                                    pathOptions={{ color: '#00BFFF', weight: 3, opacity: 0.7 }}
                                />
                            )}

                            {/* Added conditional check for disaster.path */}
                            {disaster.type === 'Tornado' && disaster.path && disaster.path.coordinates && (
                                <Polyline
                                    positions={disaster.path.coordinates.map(coord => [coord[1], coord[0]])}
                                    pathOptions={{ color: '#8A2BE2', dashArray: '10, 10', fillOpacity: 0.15, weight: 1 }}
                                />
                            )}

                            {disaster.type === 'Tsunami' && disaster.status === 'active' && (
                                <TsunamiWave center={[disaster.latitude, disaster.longitude]} radius={disaster.radius || 10000} />
                            )}

                            <Marker
                                position={[disaster.latitude, disaster.longitude]}
                                icon={createCustomIcon(disaster.type, disaster.severity, disaster.id === latestDisasterId)}
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
                    ))}
                </MarkerClusterGroup>
            )}
        </MapContainer>
    );
});

export default MapComponent;