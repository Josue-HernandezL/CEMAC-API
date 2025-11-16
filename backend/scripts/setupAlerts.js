const { db } = require('../../firebaseConfig');

// Script para inicializar la configuración de alertas en Firebase
async function setupAlertSettings() {
  try {
    console.log('🔧 Configurando ajustes de alertas en Firebase...');

    // Configuración de umbrales de stock
    const alertSettings = {
      stockThresholds: {
        urgente: 0,
        alta: 5,
        media: 10,
        baja: 20
      },
      autoGenerateAlerts: true,
      alertGenerationInterval: 300000, // 5 minutos en milisegundos
      notificationChannels: {
        email: true,
        push: false,
        inApp: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Verificar si ya existe configuración
    const settingsRef = db.ref('alertSettings');
    const snapshot = await settingsRef.once('value');

    if (snapshot.exists()) {
      console.log('⚠️  Ya existe configuración de alertas. Se actualizará...');
    }

    // Guardar configuración
    await settingsRef.set(alertSettings);

    console.log('✅ Configuración de alertas guardada exitosamente');
    console.log('📊 Umbrales configurados:');
    console.log('   - Urgente (stock agotado): 0 unidades');
    console.log('   - Alta (stock crítico): 5 unidades');
    console.log('   - Media (stock bajo): 10 unidades');
    console.log('   - Baja (advertencia): 20 unidades');
    console.log('');
    console.log('🔔 Generación automática: Activada');
    console.log('⏱️  Intervalo de verificación: 5 minutos');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al configurar alertas:', error);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  setupAlertSettings();
}

module.exports = { setupAlertSettings };
