const express = require('express');
const multer = require('multer');
const {
  upload,
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getStockHistory
} = require('../controllers/inventoryController');
const {
  authenticateUser,
  authenticateAdmin
} = require('../middleware/auth');

const router = express.Router();

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 5MB' });
    }
  } else if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};

// Rutas públicas (solo lectura para usuarios autenticados)
router.get('/', authenticateUser, getProducts); // Listar productos con filtros
router.get('/:id', authenticateUser, getProductById); // Ver producto específico
router.get('/:id/history', authenticateUser, getStockHistory); // Historial de movimientos

// Rutas de administrador (requieren permisos de admin)
router.post('/', 
  authenticateAdmin, 
  upload.single('image'), 
  handleMulterError, 
  createProduct
); // Añadir producto

router.put('/:id', 
  authenticateAdmin, 
  upload.single('image'), 
  handleMulterError, 
  updateProduct
); // Actualizar producto

router.delete('/:id', authenticateAdmin, deleteProduct); // Eliminar producto

router.post('/:id/stock', authenticateAdmin, updateStock); // Actualizar stock

// Ruta de prueba para verificar conexión
router.get('/health/check', (req, res) => {
  res.json({
    message: 'Inventory API funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

module.exports = router;