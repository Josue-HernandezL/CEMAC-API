const express = require('express');
const router = express.Router();
const { 
  createSale, 
  getSales, 
  getSaleById, 
  updateSaleStatus, 
  getSalesReport,
  searchAvailableProducts 
} = require('../controllers/salesController');
const { authenticateUser } = require('../middleware/auth');

// POST /sales - Crear nueva venta
router.post('/', authenticateUser, createSale);

// GET /sales - Listar ventas con filtros y paginación
router.get('/', authenticateUser, getSales);

// GET /sales/products/search - Buscar productos disponibles para venta (debe ir antes de /:id)
router.get('/products/search', authenticateUser, searchAvailableProducts);

// GET /sales/reports/summary - Resumen de ventas (debe ir antes de /:id)
router.get('/reports/summary', authenticateUser, getSalesReport);

// GET /sales/:id - Obtener venta específica
router.get('/:id', authenticateUser, getSaleById);

// PUT /sales/:id/status - Actualizar estado de venta
router.put('/:id/status', authenticateUser, updateSaleStatus);

module.exports = router;