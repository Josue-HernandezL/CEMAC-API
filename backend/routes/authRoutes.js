const express = require('express');
const { 
  login, 
  register, 
  recover, 
  getProfile, 
  updateProfile 
} = require('../controllers/authController');
const { 
  authenticateUser, 
  authenticateAdmin 
} = require('../middleware/auth');

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/login', login);
router.post('/recover', recover);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);

// Rutas de administrador (requieren autenticación + permisos de admin)
router.post('/register', authenticateAdmin, register);

// Ruta de prueba para verificar token
router.get('/verify', authenticateUser, (req, res) => {
  res.json({
    message: 'Token válido',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive
    }
  });
});

// Ruta de prueba para verificar permisos de admin
router.get('/admin-check', authenticateAdmin, (req, res) => {
  res.json({
    message: 'Acceso de administrador confirmado',
    admin: {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;