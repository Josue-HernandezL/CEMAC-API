const { admin } = require('../../firebaseConfig');

/**
 * Servicio de notificaciones push usando Firebase Cloud Messaging
 */

/**
 * Enviar notificación push a un topic específico
 * @param {string} topic - Topic al que enviar la notificación (ej: 'admin-alerts')
 * @param {Object} alert - Objeto de alerta con los datos
 * @returns {Promise<Object>} Resultado del envío
 */
const sendPushNotification = async (topic, alert) => {
  try {
    const message = {
      notification: {
        title: getPriorityTitle(alert.priority),
        body: alert.message
      },
      data: {
        alertId: alert.id || '',
        type: alert.type || 'stock_low',
        priority: alert.priority || 'media',
        productId: alert.productId || '',
        productName: alert.productName || '',
        currentStock: String(alert.currentStock || 0),
        timestamp: new Date().toISOString()
      },
      topic: topic,
      android: {
        priority: alert.priority === 'urgente' ? 'high' : 'normal',
        notification: {
          sound: alert.priority === 'urgente' ? 'default' : 'notification',
          color: getPriorityColor(alert.priority),
          channelId: 'alerts'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: alert.priority === 'urgente' ? 'default' : 'notification',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    
    console.log('Notificación push enviada exitosamente:', {
      messageId: response,
      topic: topic,
      alertId: alert.id,
      priority: alert.priority,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: response,
      message: 'Notificación enviada exitosamente'
    };

  } catch (error) {
    console.error('Error enviando notificación push:', error);
    
    if (error.code === 'messaging/invalid-argument') {
      throw new Error('Argumentos inválidos para la notificación push');
    } else if (error.code === 'messaging/authentication-error') {
      throw new Error('Error de autenticación con Firebase Cloud Messaging');
    } else {
      throw new Error(`Error enviando notificación: ${error.message}`);
    }
  }
};

/**
 * Enviar notificación push a múltiples dispositivos específicos
 * @param {Array<string>} tokens - Array de tokens FCM de dispositivos
 * @param {Object} alert - Objeto de alerta con los datos
 * @returns {Promise<Object>} Resultado del envío
 */
const sendMulticastNotification = async (tokens, alert) => {
  try {
    if (!tokens || tokens.length === 0) {
      console.warn('No hay tokens de dispositivos para enviar notificación');
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        message: 'No hay dispositivos registrados'
      };
    }

    const message = {
      notification: {
        title: getPriorityTitle(alert.priority),
        body: alert.message
      },
      data: {
        alertId: alert.id || '',
        type: alert.type || 'stock_low',
        priority: alert.priority || 'media',
        productId: alert.productId || '',
        productName: alert.productName || '',
        currentStock: String(alert.currentStock || 0),
        timestamp: new Date().toISOString()
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    console.log('Notificación multicast enviada:', {
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokens.length,
      timestamp: new Date().toISOString()
    });

    // Log de tokens fallidos
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({
            token: tokens[idx],
            error: resp.error.code
          });
        }
      });
      console.warn('Tokens fallidos:', failedTokens);
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `Notificación enviada a ${response.successCount}/${tokens.length} dispositivos`
    };

  } catch (error) {
    console.error('Error enviando notificación multicast:', error);
    throw new Error(`Error enviando notificación: ${error.message}`);
  }
};

/**
 * Suscribir dispositivos a un topic
 * @param {Array<string>} tokens - Array de tokens FCM
 * @param {string} topic - Topic al que suscribir (ej: 'admin-alerts')
 * @returns {Promise<Object>} Resultado de la suscripción
 */
const subscribeToTopic = async (tokens, topic) => {
  try {
    if (!tokens || tokens.length === 0) {
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        message: 'No hay tokens para suscribir'
      };
    }

    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    
    console.log('Dispositivos suscritos al topic:', {
      topic: topic,
      successCount: response.successCount,
      failureCount: response.failureCount,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `${response.successCount} dispositivos suscritos a ${topic}`
    };

  } catch (error) {
    console.error('Error suscribiendo a topic:', error);
    throw new Error(`Error en suscripción: ${error.message}`);
  }
};

/**
 * Desuscribir dispositivos de un topic
 * @param {Array<string>} tokens - Array de tokens FCM
 * @param {string} topic - Topic del que desuscribir
 * @returns {Promise<Object>} Resultado de la desuscripción
 */
const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    if (!tokens || tokens.length === 0) {
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        message: 'No hay tokens para desuscribir'
      };
    }

    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    
    console.log('Dispositivos desuscritos del topic:', {
      topic: topic,
      successCount: response.successCount,
      failureCount: response.failureCount,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `${response.successCount} dispositivos desuscritos de ${topic}`
    };

  } catch (error) {
    console.error('Error desuscribiendo de topic:', error);
    throw new Error(`Error en desuscripción: ${error.message}`);
  }
};

/**
 * Obtener título según prioridad
 * @param {string} priority - Prioridad de la alerta
 * @returns {string} Título formateado
 */
function getPriorityTitle(priority) {
  const titles = {
    'urgente': 'Alerta Critica',
    'alta': 'Alerta Urgente',
    'media': 'Alerta de Stock',
    'baja': 'Notificacion de Inventario'
  };
  return titles[priority] || 'Alerta de Sistema';
}

/**
 * Obtener color según prioridad (formato hexadecimal para Android)
 * @param {string} priority - Prioridad de la alerta
 * @returns {string} Color en formato hex
 */
function getPriorityColor(priority) {
  const colors = {
    'urgente': '#dc3545',  // Rojo
    'alta': '#fd7e14',     // Naranja
    'media': '#ffc107',    // Amarillo
    'baja': '#17a2b8'      // Azul
  };
  return colors[priority] || '#6c757d';
}

/**
 * Validar que Firebase Cloud Messaging esté configurado
 * @returns {boolean} True si está configurado correctamente
 */
const validateFCMConfig = () => {
  try {
    const messaging = admin.messaging();
    console.log('Firebase Cloud Messaging configurado correctamente');
    return true;
  } catch (error) {
    console.error('Error en configuración de FCM:', error);
    return false;
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  validateFCMConfig
};
