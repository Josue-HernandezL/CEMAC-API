const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getActiveAlerts,
  markAlertAsRead,
  resolveAlert,
  getAlertsStats
} = require('../controllers/alertsController');

/**
 * RUTAS DE ALERTAS
 * Todas las rutas requieren autenticación
 */

/**
 * @route GET /alerts
 * @desc Obtener todas las alertas activas
 * @access Privado (requiere autenticación)
 * @params query: type, priority, limit
 */
router.get('/', authenticateUser, getActiveAlerts);

/**
 * @route GET /alerts/stats
 * @desc Obtener estadísticas de alertas
 * @access Privado (requiere autenticación)
 */
router.get('/stats', authenticateUser, getAlertsStats);

/**
 * @route PATCH /alerts/:id/read
 * @desc Marcar una alerta como leída
 * @access Privado (requiere autenticación)
 */
router.patch('/:id/read', authenticateUser, markAlertAsRead);

/**
 * @route PATCH /alerts/:id/resolve
 * @desc Resolver una alerta
 * @access Privado (requiere autenticación)
 * @body { resolution?: string }
 */
router.patch('/:id/resolve', authenticateUser, resolveAlert);

module.exports = router;