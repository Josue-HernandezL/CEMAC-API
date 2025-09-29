const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysisController');
const { authenticateUser } = require('../middleware/auth');

/**
 * Rutas para análisis y estadísticas de ventas
 * Todas las rutas requieren autenticación
 */

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

module.exports = router;