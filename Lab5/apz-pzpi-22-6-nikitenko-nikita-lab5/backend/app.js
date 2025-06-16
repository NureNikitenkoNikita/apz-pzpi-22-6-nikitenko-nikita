require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./models');

// Імпорт роутів та сервісів
const authRoutes = require('./routes/auth');
const disasterRoutes = require('./routes/disasters');
const sensorRoutes = require('./routes/sensors');
const { startSensorSimulation } = require('./services/sensorSimulator');
const { startDisasterDetection } = require('./services/disasterDetector');
const { startDisasterEvolution } = require('./services/disasterEvolver');

const app = express();
const server = http.createServer(app);

// Налаштування CORS для Socket.IO та Express
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});

app.use(express.json());

// Підключення роутів
app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/sensors', sensorRoutes);

// Обробка підключення сокетів
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Синхронізація з БД та запуск сервера
db.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Запускаємо симулятори
    startSensorSimulation();
    startDisasterDetection(io);
    startDisasterEvolution(io);
  });
});