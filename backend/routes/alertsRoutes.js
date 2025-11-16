const express = require('express');
const router = express.Router();
const {
  generateAlerts,
  getAlerts,
  getLatestCritical,
  getAlertById,
  updateAlertStatus,
  markAllRead,
  getAlertCount,
  updateThresholds,
  getHistory,
  deleteAlert,
  getAlertMetrics,
  checkNotificationConfig
} = require('../controllers/alertsController');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

// POST /alerts/generate - Generar alertas automáticas (Admin)
router.post('/generate', authenticateAdmin, generateAlerts);

// GET /alerts - Obtener todas las alertas (User/Admin)
router.get('/', authenticateUser, getAlerts);

// GET /alerts/latest-critical - Obtener última alerta crítica (User/Admin)
router.get('/latest-critical', authenticateUser, getLatestCritical);

// GET /alerts/count - Obtener contador de alertas (User/Admin)
router.get('/count', authenticateUser, getAlertCount);

// GET /alerts/history - Obtener historial de alertas (User/Admin)
router.get('/history', authenticateUser, getHistory);

// GET /alerts/metrics - Obtener métricas de alertas (User/Admin)
router.get('/metrics', authenticateUser, getAlertMetrics);

// GET /alerts/config/notifications - Verificar configuración de notificaciones (Admin)
router.get('/config/notifications', authenticateAdmin, checkNotificationConfig);

// PUT /alerts/mark-all-read - Marcar todas como leídas (User/Admin)
// IMPORTANTE: Esta ruta debe ir ANTES de /:alertId para evitar conflictos
router.put('/mark-all-read', authenticateUser, markAllRead);

// PUT /alerts/settings/thresholds - Configurar umbrales (Admin)
// IMPORTANTE: Esta ruta debe ir ANTES de /:alertId/status para evitar conflictos
router.put('/settings/thresholds', authenticateAdmin, updateThresholds);

// GET /alerts/:alertId - Obtener alerta por ID (User/Admin)
router.get('/:alertId', authenticateUser, getAlertById);

// PUT /alerts/:alertId/status - Actualizar estado de alerta (User/Admin)
router.put('/:alertId/status', authenticateUser, updateAlertStatus);

// DELETE /alerts/:alertId - Eliminar alerta (Admin)
router.delete('/:alertId', authenticateAdmin, deleteAlert);

module.exports = router;
