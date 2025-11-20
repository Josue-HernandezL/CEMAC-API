const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authenticateAdmin
} = require('../middleware/auth');
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
} = require('../controllers/suppliersController');

// Rutas de proveedores (todas requieren autenticación)
router.get('/', authenticateUser, getSuppliers);
router.get('/:id/stats', authenticateUser, getSupplierStats);

// Rutas de administrador
router.post('/', authenticateAdmin, createSupplier);
router.put('/:id', authenticateAdmin, updateSupplier);
router.delete('/:id', authenticateAdmin, deleteSupplier);

module.exports = router;
