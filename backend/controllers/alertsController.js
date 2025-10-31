const { db } = require('../../firebaseConfig');

/**
 * Controlador de Alertas
 * Gestiona todas las operaciones relacionadas con alertas del sistema
 */

/**
 * OBTENER ALERTAS ACTIVAS
 * GET /alerts
 * Obtiene todas las alertas no resueltas del sistema
 */
const getActiveAlerts = async (req, res) => {
  try {
    const { type, priority, limit = 50 } = req.query;
    
    console.log('🔔 Obteniendo alertas activas...');
    
    // Referencia a las alertas en Firebase
    const alertsRef = db.ref('alerts');
    
    // Obtener todas las alertas
    const snapshot = await alertsRef.once('value');
    const alertsData = snapshot.val();
    
    if (!alertsData) {
      return res.status(200).json({
        success: true,
        alerts: [],
        message: 'No se encontraron alertas activas'
      });
    }
    
    // Convertir objeto a array y filtrar alertas activas
    let alerts = Object.keys(alertsData).map(id => ({
      id,
      ...alertsData[id]
    })).filter(alert => !alert.resolved); // Solo alertas no resueltas
    
    // Filtrar por tipo si se especifica
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }
    
    // Filtrar por prioridad si se especifica
    if (priority) {
      alerts = alerts.filter(alert => alert.priority === priority);
    }
    
    // Ordenar por prioridad y fecha
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    alerts.sort((a, b) => {
      // Primero por prioridad (descendente)
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Luego por fecha (más recientes primero)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Limitar resultados
    alerts = alerts.slice(0, parseInt(limit));
    
    // Verificar y generar alertas de stock bajo automáticamente
    await generateStockAlerts();
    
    console.log(`✅ Se encontraron ${alerts.length} alertas activas`);
    
    res.status(200).json({
      success: true,
      alerts,
      total: alerts.length,
      message: 'Alertas obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener alertas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * MARCAR ALERTA COMO LEÍDA
 * PATCH /alerts/:id/read
 * Marca una alerta específica como leída
 */
const markAlertAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔔 Marcando alerta ${id} como leída...`);
    
    // Verificar que la alerta existe
    const alertRef = db.ref(`alerts/${id}`);
    const snapshot = await alertRef.once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }
    
    // Marcar como leída
    await alertRef.update({
      read: true,
      readAt: new Date().toISOString(),
      readBy: req.user.uid
    });
    
    console.log(`✅ Alerta ${id} marcada como leída`);
    
    res.status(200).json({
      success: true,
      message: 'Alerta marcada como leída exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al marcar alerta como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * RESOLVER ALERTA
 * PATCH /alerts/:id/resolve
 * Marca una alerta como resuelta
 */
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    
    console.log(`🔔 Resolviendo alerta ${id}...`);
    
    // Verificar que la alerta existe
    const alertRef = db.ref(`alerts/${id}`);
    const snapshot = await alertRef.once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }
    
    // Marcar como resuelta
    await alertRef.update({
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy: req.user.uid,
      resolution: resolution || 'Resuelta manualmente'
    });
    
    console.log(`✅ Alerta ${id} resuelta exitosamente`);
    
    res.status(200).json({
      success: true,
      message: 'Alerta resuelta exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al resolver alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * FUNCIÓN AUXILIAR: Generar alertas de stock bajo
 * Revisa el inventario y genera alertas automáticas para productos con stock bajo
 */
const generateStockAlerts = async () => {
  try {
    console.log('🔍 Verificando productos con stock bajo...');
    
    // Obtener todos los productos
    const productsRef = db.ref('products');
    const snapshot = await productsRef.once('value');
    const productsData = snapshot.val();
    
    if (!productsData) return;
    
    // Obtener alertas existentes de stock
    const alertsRef = db.ref('alerts');
    const alertsSnapshot = await alertsRef.once('value');
    const existingAlerts = alertsSnapshot.val() || {};
    
    const existingStockAlerts = Object.values(existingAlerts)
      .filter(alert => alert.type === 'stock' && !alert.resolved)
      .map(alert => alert.metadata?.productId);
    
    // Revisar cada producto
    for (const [productId, product] of Object.entries(productsData)) {
      if (!product.isActive || product.availability !== 'limited') continue;
      
      const currentStock = product.stock || 0;
      const minThreshold = product.minThreshold || 10; // Umbral por defecto
      
      // Si el stock está por debajo del umbral y no hay alerta activa
      if (currentStock <= minThreshold && !existingStockAlerts.includes(productId)) {
        const alertId = `stock_${productId}_${Date.now()}`;
        
        let priority = 'medium';
        if (currentStock === 0) priority = 'critical';
        else if (currentStock <= minThreshold * 0.5) priority = 'high';
        
        const alertData = {
          type: 'stock',
          priority,
          title: 'Stock Bajo',
          message: `El producto '${product.name}' está por debajo del umbral mínimo`,
          createdAt: new Date().toISOString(),
          read: false,
          resolved: false,
          metadata: {
            productId,
            productName: product.name,
            currentStock,
            minThreshold,
            category: product.category
          }
        };
        
        await db.ref(`alerts/${alertId}`).set(alertData);
        console.log(`⚠️  Alerta de stock creada para producto: ${product.name}`);
      }
    }
    
    console.log('✅ Verificación de stock completada');
    
  } catch (error) {
    console.error('❌ Error al generar alertas de stock:', error);
  }
};

/**
 * OBTENER ESTADÍSTICAS DE ALERTAS
 * GET /alerts/stats
 * Obtiene estadísticas de alertas por tipo y prioridad
 */
const getAlertsStats = async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de alertas...');
    
    const alertsRef = db.ref('alerts');
    const snapshot = await alertsRef.once('value');
    const alertsData = snapshot.val() || {};
    
    const alerts = Object.values(alertsData);
    const activeAlerts = alerts.filter(alert => !alert.resolved);
    
    // Estadísticas por tipo
    const byType = {};
    const byPriority = {};
    
    activeAlerts.forEach(alert => {
      // Por tipo
      byType[alert.type] = (byType[alert.type] || 0) + 1;
      
      // Por prioridad
      byPriority[alert.priority] = (byPriority[alert.priority] || 0) + 1;
    });
    
    const stats = {
      total: activeAlerts.length,
      totalResolved: alerts.filter(alert => alert.resolved).length,
      byType,
      byPriority,
      unread: activeAlerts.filter(alert => !alert.read).length
    };
    
    console.log('✅ Estadísticas de alertas obtenidas exitosamente');
    
    res.status(200).json({
      success: true,
      stats,
      message: 'Estadísticas de alertas obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getActiveAlerts,
  markAlertAsRead,
  resolveAlert,
  getAlertsStats,
  generateStockAlerts
};