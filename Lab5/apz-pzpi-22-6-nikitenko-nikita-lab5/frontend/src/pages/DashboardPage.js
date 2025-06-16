import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDisasterData } from '../hooks/useDisasterData';
import MapComponent from '../components/Map';
import Sidebar from '../components/Sidebar';
import DetailsPanel from '../components/DetailsPanel';
import Loader from '../components/Loader';
import NotificationToast from '../components/NotificationToast';

function DashboardPage() {
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const [activePeriod, setActivePeriod] = useState('all');
    const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        Wildfire: true,
        Flood: true,
        Earthquake: true,
        Hurricane: true,
        Tsunami: true,
        Tornado: true,
        'Volcanic Eruption': true,
    });
    const [latestDisasterNotification, setLatestDisasterNotification] = useState(null);

    const { disasters, isLoading, error } = useDisasterData(activePeriod);
    const mapRef = useRef(null);

    // Оновлення сповіщень про нові події
    useEffect(() => {
        // Ми хочемо показувати сповіщення тільки коли обраний період "Live" ('all')
        if (activePeriod === 'all' && disasters && disasters.length > 0) {
            // Перевіряємо, чи є нова подія порівняно з попередньою
            // Це дуже проста логіка, для реального додатка потрібен більш надійний механізм відстеження "нових" подій
            // Наприклад, збереження ID останньої відображеної події і порівняння з ID першої події у списку.
            const mostRecentDisaster = disasters[0];
            
            // Запобігаємо повторним сповіщенням для однієї і тієї ж події
            // Порівнюємо за ID, щоб не показувати сповіщення при кожному ре-рендері, якщо дані не змінилися по суті
            if (mostRecentDisaster && mostRecentDisaster.id !== latestDisasterNotification?.id) {
                setLatestDisasterNotification(mostRecentDisaster);
            }
        }
    }, [disasters, activePeriod, latestDisasterNotification]); // Додано latestDisasterNotification до залежностей

    // useCallback для обробника вибору події
    const handleSelectDisaster = useCallback((disaster) => {
        setSelectedDisaster(disaster);
    }, []);

    // useCallback для обробника завершення сповіщення
    const handleNotificationDone = useCallback(() => {
        setLatestDisasterNotification(null);
    }, []);

    // Ключова зміна тут: Гарантуємо, що disasters завжди є масивом перед фільтрацією
    const filteredDisasters = useMemo(() => {
        // Якщо disasters undefined або null, або isLoading, або error, повертаємо порожній масив.
        // Це гарантує, що наступні операції (фільтрація) завжди виконуються на масиві.
        if (!disasters || isLoading || error) {
            return [];
        }

        return disasters.filter(disaster =>
            activeFilters[disaster.type]
        );
    }, [disasters, activeFilters, isLoading, error]); // Залежності для useMemo

    // Закриття панелі деталей, якщо вибраний період не "all"
    useEffect(() => {
        if (activePeriod !== 'all' && selectedDisaster) {
            setSelectedDisaster(null);
        }
    }, [activePeriod, selectedDisaster]);


    return (
        <div className="dashboard-container">
            <header className="header">
                <h1>DisasterMap<span>.Live</span></h1>
                <div className="user-controls">
                    {/* <span className="username">Welcome, User!</span> */}
                    <button className="logout-button" onClick={() => {
                        localStorage.removeItem('token');
                        window.location.reload(); // Простий спосіб перенаправлення на логін
                    }}>Logout</button>
                </div>
            </header>
            <main className="main-content">
                <Sidebar
                    disasters={filteredDisasters} // Передаємо вже відфільтровані дані для статистики та стрічки
                    activePeriod={activePeriod}
                    setActivePeriod={setActivePeriod}
                    isHeatmapVisible={isHeatmapVisible}
                    setIsHeatmapVisible={setIsHeatmapVisible}
                    activeFilters={activeFilters}
                    setActiveFilters={setActiveFilters}
                    onSelectDisaster={handleSelectDisaster}
                    selectedDisasterId={selectedDisaster?.id}
                />
                <div className="map-details-section">
                    <MapComponent
                        disasters={filteredDisasters} // Передаємо вже відфільтровані та безпечні дані
                        onSelectDisaster={handleSelectDisaster}
                        isHeatmapVisible={isHeatmapVisible}
                        mapRef={mapRef}
                        latestDisasterId={latestDisasterNotification?.id} // Передаємо ID найновішої події для анімації маркера
                    />
                    <AnimatePresence>
                        {selectedDisaster && (
                            <DetailsPanel
                                disaster={selectedDisaster}
                                onSelectDisaster={handleSelectDisaster}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {isLoading && <Loader />}
                {error && <div className="error-message">{error}</div>}
                {latestDisasterNotification && (
                    <NotificationToast
                        disaster={latestDisasterNotification}
                        onDone={handleNotificationDone}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default DashboardPage;