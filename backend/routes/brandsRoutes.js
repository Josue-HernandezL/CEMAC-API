const express = require('express');
const router = express.Router();
const {
    authenticateUser,
    authenticateAdmin
} = require('../middleware/auth');
const {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandStats
} = require('../controllers/brandsController');

// Rutas de marcas (todas requieren autenticación)
router.get('/', authenticateUser, getBrands);
router.get('/:id/stats', authenticateUser, getBrandStats);

// Rutas de administrador
router.post('/', authenticateAdmin, createBrand);
router.put('/:id', authenticateAdmin, updateBrand);
router.delete('/:id', authenticateAdmin, deleteBrand);

module.exports = router;