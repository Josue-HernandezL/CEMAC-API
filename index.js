const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar Firebase config
const { admin, db } = require('./firebaseConfig');

// Importar rutas
const authRoutes = require('./backend/routes/authRoutes');
const inventoryRoutes = require('./backend/routes/inventoryRoutes');
const salesRoutes = require('./backend/routes/salesRoutes');
const analysisRoutes = require('./backend/routes/analysisRoutes');
const customersRoutes = require('./backend/routes/customersRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Rutas
app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/sales', salesRoutes);
app.use('/analysis', analysisRoutes);
app.use('/customers', customersRoutes);

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
  app.listen(PORT, () => {
    console.log(`🚀 Servidor CEMAC-API ejecutándose en puerto ${PORT}`);
    console.log(`📱 API disponible en: http://localhost:${PORT}`);
  });
}

module.exports = app;