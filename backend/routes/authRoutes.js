const express = require('express');
const { 
  login, 
  register, 
  recover, 
  getProfile, 
  updateProfile,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserProfileByAdmin
} = require('../controllers/authController');
const { 
  authenticateUser, 
  authenticateAdmin,
  requireAdminAccess 
} = require('../middleware/auth');

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/login', login);
router.post('/recover', recover);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);

// Rutas de administrador (requieren autenticación + permisos de admin)
router.post('/register', requireAdminAccess, register);
router.get('/users', requireAdminAccess, getAllUsers);
router.put('/users/:userId/status', requireAdminAccess, updateUserStatus);
router.put('/users/:userId/role', requireAdminAccess, updateUserRole);
router.put('/users/:userId/profile', requireAdminAccess, updateUserProfileByAdmin);

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
router.get('/admin-check', requireAdminAccess, (req, res) => {
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