import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Socket.io client instance. autoConnect: false means we control when to connect.
// Використовуємо useRef для зберігання посилання на сокет, щоб уникнути його ре-ініціалізації
// та забезпечити єдиний екземпляр сокету на весь життєвий цикл хука.
const socketInstance = io(SOCKET_URL, { autoConnect: false });

export const useDisasterData = (period = 'all') => {
    const [disasters, setDisasters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMounted = useRef(true); // Для відстеження стану монтування компонента

    // Function to fetch historical data, memoized to prevent unnecessary re-creations
    const fetchHistoricalData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token'); // Get token from localStorage
            const res = await axios.get(`${API_URL}/disasters?period=${period}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add Authorization header
                }
            });
            if (isMounted.current) { // Оновлюємо стан тільки якщо компонент змонтований
                setDisasters(res.data);
            }
        } catch (err) {
            if (isMounted.current) {
                console.error('Error fetching historical data:', err);
                setError('Failed to fetch historical data');
                setDisasters([]); // Очищуємо дані при помилці
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [period]); // Dependency on 'period'

    useEffect(() => {
        isMounted.current = true; // Встановлюємо в true при монтуванні

        if (period === 'all') {
            // Підключаємося до сокету тільки для "live" даних
            if (!socketInstance.connected) {
                socketInstance.connect();
            }

            const onNewDisaster = (newDisaster) => {
                if (isMounted.current) { // Оновлюємо стан тільки якщо компонент змонтований
                    // Додаємо нову подію на початок масиву для відображення
                    setDisasters(prev => [newDisaster, ...prev]);
                }
            };

            const onUpdateDisaster = (updated) => {
                if (isMounted.current) { // Оновлюємо стан тільки якщо компонент змонтований
                    setDisasters(prev => prev.map(d => d.id === updated.id ? updated : d));
                }
            };

            // Слухаємо події
            socketInstance.on('new-disaster', onNewDisaster);
            socketInstance.on('disaster-update', onUpdateDisaster);

            // Fetch initial data for "all" period when component mounts or period changes to "all"
            // Це потрібно, щоб отримати початковий набір даних, перш ніж почнуть надходити live-оновлення
            fetchHistoricalData();

            // Cleanup function for live data
            return () => {
                isMounted.current = false; // Позначаємо як розмонтований
                socketInstance.off('new-disaster', onNewDisaster);
                socketInstance.off('disaster-update', onUpdateDisaster);
                // Відключаємо сокет, якщо змінюється період або компонент розмонтовується
                if (socketInstance.connected) {
                    socketInstance.disconnect();
                }
            };
        } else {
            // If historical period is selected, ensure socket is disconnected
            if (socketInstance.connected) {
                socketInstance.disconnect();
            }
            fetchHistoricalData(); // Fetch historical data
        }

        // General cleanup for unmounting
        return () => {
            isMounted.current = false; // Позначаємо як розмонтований
            // Переконайтеся, що сокет відключений при розмонтуванні, незалежно від поточного періоду
            if (socketInstance.connected) {
                socketInstance.disconnect();
            }
        };
    }, [period, fetchHistoricalData]); // Dependencies for useEffect

    return { disasters, isLoading, error };
};