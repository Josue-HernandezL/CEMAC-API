const { db } = require('../../firebaseConfig');
const { sendPushNotification } = require('../config/notificationService');
const { sendAlertEmail, validateEmailConfig } = require('../config/emailService');

// Función auxiliar para obtener emails de administradores
const getAdminEmails = async () => {
  try {
    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('role').equalTo('admin').once('value');
    
    if (!snapshot.exists()) {
      return [];
    }

    const admins = [];
    snapshot.forEach(child => {
      const user = child.val();
      if (user.email && user.isActive !== false) {
        admins.push(user.email);
      }
    });

    return admins;
  } catch (error) {
    console.error('Error obteniendo emails de administradores:', error);
    return [];
  }
};

// Función auxiliar para generar ID único
const generateAlertId = () => {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Función para generar mensaje de alerta según prioridad
const generateAlertMessage = (product, priority) => {
  const { name, category, stock } = product;
  
  if (stock === 0) {
    return `Producto agotado: ${name} en la sección de ${category}`;
  } else if (priority === 'alta' || priority === 'urgente') {
    return `Stock crítico: Solo quedan ${stock} unidades de ${name} en ${category}`;
  } else if (priority === 'media') {
    return `Stock bajo: ${stock} unidades restantes de ${name} en ${category}`;
  } else {
    return `Advertencia de stock: ${stock} unidades de ${name} en ${category}`;
  }
};

// POST /alerts/generate - Generar alertas automáticas
const generateAlerts = async (req, res) => {
  try {
    console.log('🚨 Iniciando generación de alertas automáticas...');

    // 1. Obtener configuración de umbrales
    const settingsRef = db.ref('alertSettings/stockThresholds');
    const settingsSnapshot = await settingsRef.once('value');
    let thresholds = settingsSnapshot.val();

    // Si no existe configuración, crear valores por defecto
    if (!thresholds) {
      thresholds = {
        urgente: 0,
        alta: 5,
        media: 10,
        baja: 20
      };
      await settingsRef.set(thresholds);
    }

    // 2. Obtener todos los productos activos con availability: "limited"
    const productsRef = db.ref('inventory/products');
    const productsSnapshot = await productsRef.once('value');
    
    if (!productsSnapshot.exists()) {
      return res.status(200).json({
        success: true,
        message: 'No hay productos en el inventario',
        data: {
          totalGenerated: 0,
          byPriority: {
            urgente: 0,
            alta: 0,
            media: 0,
            baja: 0
          },
          alerts: []
        }
      });
    }

    const products = productsSnapshot.val();

    // 3. Obtener alertas activas existentes
    const alertsRef = db.ref('alerts');
    const alertsSnapshot = await alertsRef.once('value');
    const existingAlerts = alertsSnapshot.val() || {};

    // 4. Generar alertas para productos con stock bajo
    const newAlerts = {};
    const alertsArray = [];
    const byPriority = {
      urgente: 0,
      alta: 0,
      media: 0,
      baja: 0
    };

    Object.values(products).forEach(product => {
      // Solo verificar productos activos con disponibilidad limitada
      if (product.isActive !== false && product.availability === 'limited') {
        
        // Verificar si ya existe una alerta activa para este producto
        const hasActiveAlert = Object.values(existingAlerts).some(
          alert => alert.productId === product.id && 
                  alert.type === 'stock_low' &&
                  (alert.status === 'pendiente' || alert.status === 'en_proceso')
        );

        if (!hasActiveAlert) {
          let priority = null;
          const stock = product.stock || 0;

          // Determinar prioridad según umbrales
          if (stock <= thresholds.urgente) {
            priority = 'urgente';
          } else if (stock <= thresholds.alta) {
            priority = 'alta';
          } else if (stock <= thresholds.media) {
            priority = 'media';
          } else if (stock <= thresholds.baja) {
            priority = 'baja';
          }

          if (priority) {
            const alertId = generateAlertId();
            const alert = {
              id: alertId,
              type: 'stock_low',
              priority,
              status: 'pendiente',
              productId: product.id,
              productName: product.name,
              productCategory: product.category || 'Sin categoría',
              currentStock: stock,
              minThreshold: thresholds.baja,
              message: generateAlertMessage(product, priority),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              resolvedAt: null,
              resolvedBy: null,
              actions: []
            };

            newAlerts[alertId] = alert;
            alertsArray.push(alert);
            byPriority[priority]++;
          }
        }
      }
    });

    // 5. Guardar nuevas alertas
    if (Object.keys(newAlerts).length > 0) {
      await alertsRef.update(newAlerts);
      console.log(`✅ Se crearon ${alertsArray.length} nuevas alertas`);

      // 6. Enviar notificaciones para alertas urgentes
      const urgentAlerts = alertsArray.filter(a => a.priority === 'urgente' || a.priority === 'alta');
      
      for (const alert of urgentAlerts) {
        try {
          // Emitir evento WebSocket en tiempo real
          if (req.app && req.app.get('io')) {
            const io = req.app.get('io');
            io.to('all-alerts').emit('new-alert', alert);
            io.to('admin-alerts').emit('new-critical-alert', alert);
          }

          // Enviar notificación push (no bloquea si falla)
          if (alert.priority === 'urgente' || alert.priority === 'alta') {
            // Push notification
            sendPushNotification('admin-alerts', alert).catch(err => 
              console.warn('⚠️ Error enviando push notification:', err.message)
            );

            // Email notification - obtener emails de admins
            const adminEmails = await getAdminEmails();
            
            if (adminEmails.length > 0 && validateEmailConfig()) {
              sendAlertEmail(alert, adminEmails).catch(err =>
                console.warn('⚠️ Error enviando email de alerta:', err.message)
              );
              console.log(`📧 Email enviado a ${adminEmails.length} administradores`);
            } else {
              console.warn('⚠️ No hay administradores configurados o email no disponible');
            }
          }
        } catch (notifError) {
          console.warn('Error procesando notificaciones:', notifError.message);
        }
      }
    } else {
      console.log('ℹ️ No se generaron nuevas alertas');
    }

    res.status(200).json({
      success: true,
      message: 'Alertas generadas exitosamente',
      data: {
        totalGenerated: alertsArray.length,
        byPriority,
        alerts: alertsArray
      }
    });

  } catch (error) {
    console.error('❌ Error al generar alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al acceder al inventario',
      code: 'INVENTORY_ACCESS_ERROR'
    });
  }
};

// GET /alerts - Obtener todas las alertas con filtros
const getAlerts = async (req, res) => {
  try {
    const {
      status,
      priority,
      startDate,
      endDate,
      limit = 50,
      page = 1,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Obtener todas las alertas
    const alertsRef = db.ref('alerts');
    const snapshot = await alertsRef.once('value');
    
    let alerts = [];
    if (snapshot.exists()) {
      alerts = Object.values(snapshot.val());
    }

    // Aplicar filtros
    let filteredAlerts = alerts;

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    if (priority) {
      filteredAlerts = filteredAlerts.filter(alert => alert.priority === priority);
    }

    if (startDate) {
      filteredAlerts = filteredAlerts.filter(alert => 
        new Date(alert.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredAlerts = filteredAlerts.filter(alert => 
        new Date(alert.createdAt) <= new Date(endDate)
      );
    }

    // Ordenamiento
    const sortField = sortBy === 'date' ? 'createdAt' : 
                     sortBy === 'priority' ? 'priority' : 
                     sortBy === 'productName' ? 'productName' : 'createdAt';

    filteredAlerts.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'priority') {
        const priorityOrder = { urgente: 4, alta: 3, media: 2, baja: 1 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    // Calcular estadísticas
    const byStatus = {
      pendiente: alerts.filter(a => a.status === 'pendiente').length,
      en_proceso: alerts.filter(a => a.status === 'en_proceso').length,
      atendido: alerts.filter(a => a.status === 'atendido').length,
      descartado: alerts.filter(a => a.status === 'descartado').length
    };

    const byPriority = {
      urgente: alerts.filter(a => a.priority === 'urgente').length,
      alta: alerts.filter(a => a.priority === 'alta').length,
      media: alerts.filter(a => a.priority === 'media').length,
      baja: alerts.filter(a => a.priority === 'baja').length
    };

    res.status(200).json({
      success: true,
      message: 'Alertas obtenidas exitosamente',
      data: {
        alerts: paginatedAlerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredAlerts.length / limit),
          totalAlerts: filteredAlerts.length,
          limit: parseInt(limit),
          hasNextPage: endIndex < filteredAlerts.length,
          hasPrevPage: page > 1
        },
        summary: {
          total: alerts.length,
          byStatus,
          byPriority
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// GET /alerts/latest-critical - Obtener última alerta crítica
const getLatestCritical = async (req, res) => {
  try {
    const alertsRef = db.ref('alerts');
    const snapshot = await alertsRef.once('value');

    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: {
          hasAlert: false,
          alert: null
        }
      });
    }

    const alerts = Object.values(snapshot.val());

    // Filtrar alertas críticas pendientes
    const criticalAlerts = alerts
      .filter(alert => 
        (alert.priority === 'urgente' || alert.priority === 'alta') &&
        alert.status === 'pendiente'
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (criticalAlerts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasAlert: false,
          alert: null
        }
      });
    }

    const latestAlert = criticalAlerts[0];

    res.status(200).json({
      success: true,
      data: {
        hasAlert: true,
        alert: {
          id: latestAlert.id,
          type: latestAlert.type,
          priority: latestAlert.priority,
          status: latestAlert.status,
          productId: latestAlert.productId,
          productName: latestAlert.productName,
          productCategory: latestAlert.productCategory,
          currentStock: latestAlert.currentStock,
          message: latestAlert.message,
          createdAt: latestAlert.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener alerta crítica:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /alerts/:alertId - Obtener alerta por ID
const getAlertById = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alertRef = db.ref(`alerts/${alertId}`);
    const snapshot = await alertRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada',
        code: 'ALERT_NOT_FOUND'
      });
    }

    const alert = snapshot.val();

    res.status(200).json({
      success: true,
      data: alert
    });

  } catch (error) {
    console.error('Error al obtener alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /alerts/:alertId/status - Actualizar estado de alerta
const updateAlertStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, notes } = req.body || {};
    const userId = req.user.uid;
    const userName = req.user.name || req.user.email;

    // Validar que se envió status
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'El campo status es requerido',
        code: 'MISSING_STATUS',
        validStatuses: ['pendiente', 'en_proceso', 'atendido', 'descartado']
      });
    }

    // Validar estado
    const validStatuses = ['pendiente', 'en_proceso', 'atendido', 'descartado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido',
        code: 'INVALID_STATUS',
        validStatuses
      });
    }

    // Obtener alerta actual
    const alertRef = db.ref(`alerts/${alertId}`);
    const snapshot = await alertRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada',
        code: 'ALERT_NOT_FOUND'
      });
    }

    const currentAlert = snapshot.val();
    const now = new Date().toISOString();

    // Crear registro de acción
    const action = {
      actionType: 'status_change',
      previousStatus: currentAlert.status,
      newStatus: status,
      userId,
      userName,
      timestamp: now,
      notes: notes || null
    };

    const updatedActions = [...(currentAlert.actions || []), action];

    // Actualizar alerta
    const updatedAlert = {
      ...currentAlert,
      status,
      updatedAt: now,
      actions: updatedActions
    };

    // Si se resuelve o descarta, agregar campos adicionales
    if (status === 'atendido' || status === 'descartado') {
      updatedAlert.resolvedAt = now;
      updatedAlert.resolvedBy = userId;

      // Calcular tiempo de resolución
      const createdTime = new Date(currentAlert.createdAt).getTime();
      const resolvedTime = new Date(now).getTime();
      const resolutionTime = resolvedTime - createdTime;

      // Mover a historial
      const yearMonth = now.substring(0, 7); // "2025-11"
      const historyRef = db.ref(`alertHistory/${yearMonth}/${alertId}`);
      await historyRef.set({
        ...updatedAlert,
        resolutionTime,
        finalStatus: status
      });
    }

    await alertRef.set(updatedAlert);

    res.status(200).json({
      success: true,
      message: 'Estado de alerta actualizado exitosamente',
      data: {
        ...updatedAlert,
        lastAction: action
      }
    });

  } catch (error) {
    console.error('Error al actualizar estado de alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /alerts/mark-all-read - Marcar todas como atendidas
const markAllRead = async (req, res) => {
  try {
    const { filters, notes } = req.body || {};
    const userId = req.user.uid;
    const userName = req.user.name || req.user.email;

    // Obtener todas las alertas
    const alertsRef = db.ref('alerts');
    const snapshot = await alertsRef.once('value');

    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        message: '0 alertas marcadas como atendidas',
        data: {
          totalProcessed: 0,
          byPriority: {
            urgente: 0,
            alta: 0,
            media: 0,
            baja: 0
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    const alerts = snapshot.val();
    const now = new Date().toISOString();
    const byPriority = {
      urgente: 0,
      alta: 0,
      media: 0,
      baja: 0
    };

    let totalProcessed = 0;

    // Filtrar y actualizar alertas
    for (const [alertId, alert] of Object.entries(alerts)) {
      let shouldUpdate = true;

      // Aplicar filtros si se proporcionan
      if (filters) {
        if (filters.priority && alert.priority !== filters.priority) {
          shouldUpdate = false;
        }
        if (filters.status && alert.status !== filters.status) {
          shouldUpdate = false;
        }
      }

      if (shouldUpdate && alert.status !== 'atendido' && alert.status !== 'descartado') {
        const action = {
          actionType: 'status_change',
          previousStatus: alert.status,
          newStatus: 'atendido',
          userId,
          userName,
          timestamp: now,
          notes: notes || 'Marcado como atendido masivamente'
        };

        const updatedAlert = {
          ...alert,
          status: 'atendido',
          updatedAt: now,
          resolvedAt: now,
          resolvedBy: userId,
          actions: [...(alert.actions || []), action]
        };

        // Calcular tiempo de resolución
        const createdTime = new Date(alert.createdAt).getTime();
        const resolvedTime = new Date(now).getTime();
        const resolutionTime = resolvedTime - createdTime;

        // Actualizar en alerts
        await db.ref(`alerts/${alertId}`).set(updatedAlert);

        // Mover a historial
        const yearMonth = now.substring(0, 7);
        await db.ref(`alertHistory/${yearMonth}/${alertId}`).set({
          ...updatedAlert,
          resolutionTime,
          finalStatus: 'atendido'
        });

        byPriority[alert.priority]++;
        totalProcessed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `${totalProcessed} alertas marcadas como atendidas`,
      data: {
        totalProcessed,
        byPriority,
        timestamp: now
      }
    });

  } catch (error) {
    console.error('Error al marcar alertas como leídas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /alerts/count - Obtener contador de alertas
const getAlertCount = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const alertsRef = db.ref('alerts');
    const snapshot = await alertsRef.once('value');

    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          byStatus: {
            pendiente: 0,
            en_proceso: 0,
            atendido: 0,
            descartado: 0
          },
          byPriority: {
            urgente: 0,
            alta: 0,
            media: 0,
            baja: 0
          },
          criticalAlerts: 0,
          lastUpdated: new Date().toISOString()
        }
      });
    }

    let alerts = Object.values(snapshot.val());

    // Aplicar filtros si se proporcionan
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }
    if (priority) {
      alerts = alerts.filter(alert => alert.priority === priority);
    }

    const byStatus = {
      pendiente: alerts.filter(a => a.status === 'pendiente').length,
      en_proceso: alerts.filter(a => a.status === 'en_proceso').length,
      atendido: alerts.filter(a => a.status === 'atendido').length,
      descartado: alerts.filter(a => a.status === 'descartado').length
    };

    const byPriority = {
      urgente: alerts.filter(a => a.priority === 'urgente').length,
      alta: alerts.filter(a => a.priority === 'alta').length,
      media: alerts.filter(a => a.priority === 'media').length,
      baja: alerts.filter(a => a.priority === 'baja').length
    };

    const criticalAlerts = alerts.filter(a => 
      (a.priority === 'urgente' || a.priority === 'alta') &&
      (a.status === 'pendiente' || a.status === 'en_proceso')
    ).length;

    res.status(200).json({
      success: true,
      data: {
        total: alerts.length,
        pending: byStatus.pendiente,
        inProgress: byStatus.en_proceso,
        resolved: byStatus.atendido + byStatus.descartado,
        byStatus,
        byPriority,
        criticalAlerts,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error al obtener contador de alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /alerts/settings/thresholds - Configurar umbrales
const updateThresholds = async (req, res) => {
  try {
    const { stockThresholds } = req.body || {};
    const userId = req.user.uid;

    // Validar que se envió stockThresholds
    if (!stockThresholds) {
      return res.status(400).json({
        success: false,
        error: 'El campo stockThresholds es requerido',
        code: 'MISSING_STOCK_THRESHOLDS',
        example: {
          stockThresholds: {
            urgente: 0,
            alta: 5,
            media: 10,
            baja: 20
          }
        }
      });
    }

    // Validar que el usuario es admin
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden modificar los umbrales',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Validar umbrales
    const { urgente, alta, media, baja } = stockThresholds;

    if (urgente === undefined || alta === undefined || media === undefined || baja === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren todos los umbrales: urgente, alta, media, baja',
        code: 'INCOMPLETE_THRESHOLDS'
      });
    }

    if (urgente < 0 || alta < 0 || media < 0 || baja < 0) {
      return res.status(400).json({
        success: false,
        error: 'Los umbrales deben ser números mayores o iguales a 0',
        code: 'INVALID_THRESHOLDS'
      });
    }

    if (!(urgente <= alta && alta <= media && media <= baja)) {
      return res.status(400).json({
        success: false,
        error: 'Valores de umbral inválidos. Deben estar en orden ascendente',
        code: 'INVALID_THRESHOLDS'
      });
    }

    const now = new Date().toISOString();

    // Actualizar umbrales
    await db.ref('alertSettings/stockThresholds').set(stockThresholds);
    await db.ref('alertSettings').update({
      updatedAt: now,
      updatedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Umbrales actualizados exitosamente',
      data: {
        stockThresholds,
        updatedAt: now,
        updatedBy: userId
      }
    });

  } catch (error) {
    console.error('Error al actualizar umbrales:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /alerts/history - Obtener historial de alertas
const getHistory = async (req, res) => {
  try {
    const { month, year, limit = 50 } = req.query;

    const historyRef = db.ref('alertHistory');
    const snapshot = await historyRef.once('value');

    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: {
          alerts: [],
          metrics: {
            totalResolved: 0,
            averageResolutionTime: 0,
            resolvedByStatus: {
              atendido: 0,
              descartado: 0
            },
            fastestResolution: 0,
            slowestResolution: 0
          },
          pagination: {
            currentPage: 1,
            totalPages: 0,
            total: 0
          }
        }
      });
    }

    const history = snapshot.val();
    let alerts = [];

    // Recopilar alertas del historial
    Object.entries(history).forEach(([period, periodAlerts]) => {
      // Filtrar por mes/año si se especifica
      if (month && !period.includes(month)) return;
      if (year && !period.startsWith(year)) return;

      Object.values(periodAlerts).forEach(alert => {
        alerts.push(alert);
      });
    });

    // Ordenar por fecha de resolución (más reciente primero)
    alerts.sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt));

    // Limitar resultados
    const limitedAlerts = alerts.slice(0, parseInt(limit));

    // Calcular métricas
    const totalResolved = alerts.length;
    const resolutionTimes = alerts
      .filter(a => a.resolutionTime)
      .map(a => a.resolutionTime);

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    const fastestResolution = resolutionTimes.length > 0
      ? Math.min(...resolutionTimes)
      : 0;

    const slowestResolution = resolutionTimes.length > 0
      ? Math.max(...resolutionTimes)
      : 0;

    const resolvedByStatus = {
      atendido: alerts.filter(a => a.finalStatus === 'atendido').length,
      descartado: alerts.filter(a => a.finalStatus === 'descartado').length
    };

    res.status(200).json({
      success: true,
      data: {
        alerts: limitedAlerts.map(alert => ({
          id: alert.id,
          productName: alert.productName,
          priority: alert.priority,
          finalStatus: alert.finalStatus,
          createdAt: alert.createdAt,
          resolvedAt: alert.resolvedAt,
          resolutionTime: alert.resolutionTime,
          resolvedBy: alert.resolvedBy
        })),
        metrics: {
          totalResolved,
          averageResolutionTime,
          resolvedByStatus,
          fastestResolution,
          slowestResolution
        },
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(totalResolved / limit),
          total: totalResolved
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// DELETE /alerts/:alertId - Eliminar alerta (solo admins)
const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.uid;

    // Validar que el usuario es admin
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden eliminar alertas',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Verificar que la alerta existe
    const alertRef = db.ref(`alerts/${alertId}`);
    const snapshot = await alertRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada',
        code: 'ALERT_NOT_FOUND'
      });
    }

    const alert = snapshot.val();
    const now = new Date().toISOString();

    // Mover a alertas eliminadas
    await db.ref(`deletedAlerts/${alertId}`).set({
      ...alert,
      deletedAt: now,
      deletedBy: userId
    });

    // Eliminar de alertas activas
    await alertRef.remove();

    res.status(200).json({
      success: true,
      message: 'Alerta eliminada exitosamente',
      data: {
        deletedAlertId: alertId,
        deletedAt: now,
        deletedBy: userId
      }
    });

  } catch (error) {
    console.error('Error al eliminar alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /alerts/metrics - Obtener métricas de alertas
const getAlertMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validar fechas
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás
    const end = endDate ? new Date(endDate) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Formato de fecha inválido. Use ISO 8601 (YYYY-MM-DD)',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    // Obtener alertas activas
    const alertsRef = db.ref('alerts');
    const alertsSnapshot = await alertsRef.once('value');
    const alerts = alertsSnapshot.exists() ? Object.values(alertsSnapshot.val()) : [];

    // Obtener historial en el rango de fechas
    const year = start.getFullYear();
    const startMonth = start.getMonth() + 1;
    const endMonth = end.getMonth() + 1;
    
    let historicalAlerts = [];
    for (let m = startMonth; m <= endMonth; m++) {
      const monthKey = `${year}-${String(m).padStart(2, '0')}`;
      const historyRef = db.ref(`alertHistory/${monthKey}`);
      const historySnapshot = await historyRef.once('value');
      
      if (historySnapshot.exists()) {
        historicalAlerts = historicalAlerts.concat(Object.values(historySnapshot.val()));
      }
    }

    // Combinar todas las alertas en el rango
    const allAlerts = [...alerts, ...historicalAlerts].filter(alert => {
      const alertDate = new Date(alert.createdAt);
      return alertDate >= start && alertDate <= end;
    });

    if (allAlerts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          period: {
            startDate: start.toISOString(),
            endDate: end.toISOString()
          },
          totalAlerts: 0,
          alertsByDay: [],
          averageResolutionTime: 0,
          resolutionRate: 0,
          topAffectedCategories: [],
          alertTrends: {
            increasing: false,
            percentageChange: 0
          }
        }
      });
    }

    // 1. Alertas por día
    const alertsByDay = {};
    allAlerts.forEach(alert => {
      const date = new Date(alert.createdAt).toISOString().split('T')[0];
      alertsByDay[date] = (alertsByDay[date] || 0) + 1;
    });

    const alertsByDayArray = Object.entries(alertsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Tiempo promedio de resolución
    const resolvedAlerts = allAlerts.filter(a => a.resolvedAt);
    let averageResolutionTime = 0;
    
    if (resolvedAlerts.length > 0) {
      const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
        const created = new Date(alert.createdAt).getTime();
        const resolved = new Date(alert.resolvedAt).getTime();
        return sum + (resolved - created);
      }, 0);
      averageResolutionTime = Math.round(totalResolutionTime / resolvedAlerts.length);
    }

    // 3. Tasa de resolución
    const resolutionRate = allAlerts.length > 0 
      ? parseFloat((resolvedAlerts.length / allAlerts.length).toFixed(2))
      : 0;

    // 4. Categorías más afectadas
    const categoryCounts = {};
    allAlerts.forEach(alert => {
      const category = alert.productCategory || 'Sin categoría';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const topAffectedCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 5. Tendencias de alertas (comparar primera mitad vs segunda mitad del período)
    const midPoint = new Date((start.getTime() + end.getTime()) / 2);
    const firstHalf = allAlerts.filter(a => new Date(a.createdAt) < midPoint).length;
    const secondHalf = allAlerts.filter(a => new Date(a.createdAt) >= midPoint).length;

    let percentageChange = 0;
    let increasing = false;

    if (firstHalf > 0) {
      percentageChange = parseFloat((((secondHalf - firstHalf) / firstHalf) * 100).toFixed(2));
      increasing = percentageChange > 0;
    } else if (secondHalf > 0) {
      percentageChange = 100;
      increasing = true;
    }

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        totalAlerts: allAlerts.length,
        alertsByDay: alertsByDayArray,
        averageResolutionTime,
        resolutionRate,
        topAffectedCategories,
        alertTrends: {
          increasing,
          percentageChange
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /alerts/config/notifications - Verificar configuración de notificaciones
const checkNotificationConfig = async (req, res) => {
  try {
    const { validateFCMConfig } = require('../config/notificationService');
    
    const config = {
      email: {
        configured: validateEmailConfig(),
        service: process.env.EMAIL_SERVICE || 'gmail',
        from: process.env.EMAIL_FROM || 'No configurado',
        user: process.env.EMAIL_USER ? '✅ Configurado' : '❌ No configurado'
      },
      push: {
        configured: validateFCMConfig(),
        fcmKey: process.env.FCM_SERVER_KEY ? '✅ Configurado' : '❌ No configurado'
      },
      frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
      },
      admins: {
        count: 0,
        emails: []
      }
    };

    // Obtener administradores
    const adminEmails = await getAdminEmails();
    config.admins.count = adminEmails.length;
    config.admins.emails = adminEmails;

    res.status(200).json({
      success: true,
      data: config,
      message: 'Configuración de notificaciones verificada'
    });

  } catch (error) {
    console.error('Error verificando configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar configuración'
    });
  }
};

module.exports = {
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
};
