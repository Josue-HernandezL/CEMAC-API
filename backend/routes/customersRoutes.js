const express = require('express');
const router = express.Router();
const { 
  registerCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  searchCustomers
} = require('../controllers/customersController');
const { authenticateUser } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// GET /customers/search - Búsqueda rápida (debe ir antes que /:id)
router.get('/search', searchCustomers);

// GET /customers - Listar clientes con filtros y paginación
router.get('/', getCustomers);

// POST /customers - Registrar nuevo cliente
router.post('/', registerCustomer);

// GET /customers/:customerId - Obtener cliente específico con historial
router.get('/:customerId', getCustomerById);

// PUT /customers/:customerId - Actualizar información del cliente
router.put('/:customerId', updateCustomer);

module.exports = router;