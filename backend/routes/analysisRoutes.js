const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysisController');
const { authenticateUser } = require('../middleware/auth');

/**
 * Rutas para análisis y estadísticas de ventas e inventario
 * Todas las rutas requieren autenticación
 */

// ==================== RUTAS DE ANÁLISIS DE VENTAS ====================

/**
 * @route GET /analysis/sales
 * @desc Obtener estadísticas completas de ventas (diarias, mensuales, productos top)
 * @access Privado (requiere autenticación)
 * @returns {Object} Estadísticas de ventas con datos diarios, mensuales y productos más vendidos
 */
router.get('/sales', authenticateUser, AnalysisController.getSalesStatistics);

/**
 * @route GET /analysis/sales/custom
 * @desc Obtener estadísticas de ventas para un período personalizado
 * @access Privado (requiere autenticación)
 * @query {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @query {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @query {string} [groupBy=day] - Agrupar por: 'day', 'week', 'month'
 * @returns {Object} Estadísticas personalizadas del período especificado
 */
router.get('/sales/custom', authenticateUser, AnalysisController.getCustomPeriodStats);

/**
 * @route GET /analysis/sales/summary
 * @desc Obtener resumen ejecutivo de ventas con comparación mensual
 * @access Privado (requiere autenticación)
 * @returns {Object} Resumen ejecutivo con métricas clave y crecimiento
 */
router.get('/sales/summary', authenticateUser, AnalysisController.getExecutiveSummary);

// ==================== RUTAS DE ANÁLISIS DE INVENTARIO ====================

/**
 * @route GET /analysis/inventory
 * @desc Obtener análisis completo de inventario (stock, bajo stock, distribución)
 * @access Privado (requiere autenticación)
 * @returns {Object} Análisis de inventario con niveles de stock, productos bajo stock y distribución por categorías
 */
router.get('/inventory', authenticateUser, AnalysisController.getInventoryAnalysis);

/**
 * @route GET /analysis/inventory/rotation
 * @desc Obtener análisis de rotación de inventario basado en ventas
 * @access Privado (requiere autenticación)
 * @returns {Object} Análisis de rotación con productos más y menos rotativos
 */
router.get('/inventory/rotation', authenticateUser, AnalysisController.getInventoryRotation);

module.exports = router;