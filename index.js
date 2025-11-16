const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Importar Firebase config
const { admin, db } = require('./firebaseConfig');

// Importar rutas
const authRoutes = require('./backend/routes/authRoutes');
const inventoryRoutes = require('./backend/routes/inventoryRoutes');
const salesRoutes = require('./backend/routes/salesRoutes');
const analysisRoutes = require('./backend/routes/analysisRoutes');
const customersRoutes = require('./backend/routes/customersRoutes');
const categoriesRoutes = require('./backend/routes/categoriesRoutes');
const alertsRoutes = require('./backend/routes/alertsRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;

// Hacer io accesible globalmente para emitir eventos desde controladores
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware mejorado
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`🌐 [${timestamp}] ${method} ${path} - IP: ${ip}`);
  }
  next();
});

// Configuración de Socket.IO para alertas en tiempo real
io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Cliente conectado a WebSocket:', socket.id);
  }
  
  // Suscribir usuario a alertas
  socket.on('subscribe-alerts', (userId) => {
    socket.join(`user-${userId}`);
    socket.join('all-alerts');
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Usuario ${userId} suscrito a alertas`);
    }
    socket.emit('subscription-confirmed', {
      success: true,
      userId: userId,
      timestamp: new Date().toISOString()
    });
  });

  // Suscribir a alertas de administrador
  socket.on('subscribe-admin-alerts', (userId) => {
    socket.join('admin-alerts');
    socket.join(`user-${userId}`);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Administrador ${userId} suscrito a alertas admin`);
    }
    socket.emit('subscription-confirmed', {
      success: true,
      userId: userId,
      role: 'admin',
      timestamp: new Date().toISOString()
    });
  });

  // Desuscribir de alertas
  socket.on('unsubscribe-alerts', (userId) => {
    socket.leave(`user-${userId}`);
    socket.leave('all-alerts');
    socket.leave('admin-alerts');
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Usuario ${userId} desuscrito de alertas`);
    }
  });

  // Manejo de desconexión
  socket.on('disconnect', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Cliente desconectado:', socket.id);
    }
  });
});

// Rutas
app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/sales', salesRoutes);
app.use('/analysis', analysisRoutes);
app.use('/customers', customersRoutes);
app.use('/categories', categoriesRoutes);
app.use('/alerts', alertsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'CEMAC API - Sistema de Autenticación', 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404 - debe ir al final de todas las rutas
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  // Mostrar errores en desarrollo y producción, solo silenciar en tests automatizados
  if (process.env.NODE_ENV !== 'test') {
    console.error('🚨 Error del servidor:', error.message || error);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
  }
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor CEMAC-API ejecutándose en puerto ${PORT}`);
    console.log(`📱 API disponible en: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket disponible para alertas en tiempo real`);
  });
}

module.exports = { app, server, io };