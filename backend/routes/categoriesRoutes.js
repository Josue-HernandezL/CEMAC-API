const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authenticateAdmin
} = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoriesController');

// Rutas de categorías (todas requieren autenticación)
router.get('/', authenticateUser, getCategories);
router.get('/:id/stats', authenticateUser, getCategoryStats);

// Rutas de administrador
router.post('/', authenticateAdmin, createCategory);
router.put('/:id', authenticateAdmin, updateCategory);
router.delete('/:id', authenticateAdmin, deleteCategory);

module.exports = router;
