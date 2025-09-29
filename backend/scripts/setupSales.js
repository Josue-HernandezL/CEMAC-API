const { db } = require('../../firebaseConfig');

/**
 * Script para configurar la estructura inicial de ventas en Firebase
 */
const setupSalesDatabase = async () => {
  try {
    console.log('🚀 Configurando estructura de base de datos para ventas...');

    // Crear estructura básica de ventas
    const salesStructure = {
      sales: {
        '.info': {
          description: 'Colección de ventas del sistema',
          structure: {
            id: 'string - ID único de la venta',
            cliente: 'string - Nombre del cliente',
            vendedor: 'string - Nombre del vendedor',
            products: 'array - Lista de productos vendidos',
            subtotal: 'number - Subtotal antes de descuento e IVA',
            descuento: 'number - Porcentaje de descuento aplicado',
            discountAmount: 'number - Monto del descuento',
            iva: 'number - Monto del IVA',
            total: 'number - Total final de la venta',
            paymentMethod: 'string - Método de pago',
            notes: 'string - Notas adicionales',
            status: 'string - Estado de la venta (pendiente, completada, cancelada, devuelta)',
            createdAt: 'string - Fecha de creación ISO',
            createdBy: 'string - UID del usuario que creó la venta',
            date: 'string - Fecha en formato local',
            timestamp: 'number - Timestamp para ordenamiento'
          }
        }
      },
      salesReports: {
        '.info': {
          description: 'Reportes y estadísticas de ventas',
          structure: {
            daily: 'object - Reportes diarios',
            monthly: 'object - Reportes mensuales',
            yearly: 'object - Reportes anuales'
          }
        }
      }
    };

    // Configurar reglas de validación para ventas
    const salesRules = {
      sales: {
        '$saleId': {
          '.validate': 'newData.hasChildren([\'id\', \'cliente\', \'products\', \'total\', \'status\', \'createdAt\'])',
          'id': {
            '.validate': 'newData.isString() && newData.val().length > 0'
          },
          'cliente': {
            '.validate': 'newData.isString() && newData.val().length > 0'
          },
          'vendedor': {
            '.validate': 'newData.isString()'
          },
          'products': {
            '.validate': 'newData.isArray() && newData.val().length > 0',
            '$productIndex': {
              '.validate': 'newData.hasChildren([\'productId\', \'quantity\', \'unitPrice\', \'totalPrice\'])',
              'productId': {
                '.validate': 'newData.isString() && newData.val().length > 0'
              },
              'quantity': {
                '.validate': 'newData.isNumber() && newData.val() > 0'
              },
              'unitPrice': {
                '.validate': 'newData.isNumber() && newData.val() >= 0'
              },
              'totalPrice': {
                '.validate': 'newData.isNumber() && newData.val() >= 0'
              }
            }
          },
          'subtotal': {
            '.validate': 'newData.isNumber() && newData.val() >= 0'
          },
          'descuento': {
            '.validate': 'newData.isNumber() && newData.val() >= 0 && newData.val() <= 100'
          },
          'total': {
            '.validate': 'newData.isNumber() && newData.val() >= 0'
          },
          'status': {
            '.validate': 'newData.isString() && (newData.val() === \'pendiente\' || newData.val() === \'completada\' || newData.val() === \'cancelada\' || newData.val() === \'devuelta\')'
          },
          'paymentMethod': {
            '.validate': 'newData.isString()'
          },
          'createdAt': {
            '.validate': 'newData.isString()'
          },
          'createdBy': {
            '.validate': 'newData.isString() && newData.val().length > 0'
          }
        }
      }
    };

    // Crear venta de ejemplo (opcional)
    const exampleSale = {
      id: 'example_sale_001',
      cliente: 'Cliente Ejemplo',
      vendedor: 'Sistema',
      products: [
        {
          productId: 'example_product',
          productName: 'Producto Ejemplo',
          quantity: 1,
          unitPrice: 100.00,
          totalPrice: 100.00,
          availability: 'unlimited'
        }
      ],
      subtotal: 100.00,
      descuento: 0,
      discountAmount: 0,
      iva: 16.00,
      total: 116.00,
      paymentMethod: 'efectivo',
      notes: 'Venta de ejemplo para demostración',
      status: 'completada',
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      date: new Date().toLocaleDateString('es-ES'),
      timestamp: Date.now()
    };

    // Crear estadísticas iniciales
    const initialStats = {
      totalSales: 0,
      totalRevenue: 0,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Creando estructura de ventas...');
    
    // Guardar estructura de información (opcional, para documentación)
    // await db.ref('_schema/sales').set(salesStructure);

    // Crear venta de ejemplo (comentado por defecto)
    // await db.ref('sales/example_sale_001').set(exampleSale);

    // Crear estadísticas iniciales
    await db.ref('salesStats').set(initialStats);

    console.log('✅ Estructura de ventas configurada exitosamente');
    console.log('📋 Estructura creada:');
    console.log('   - /sales - Colección principal de ventas');
    console.log('   - /salesStats - Estadísticas generales');
    console.log('   - /salesReports - Reportes y análisis');
    
    console.log('\n📝 Endpoints disponibles:');
    console.log('   - POST /sales - Crear nueva venta (con IVA opcional)');
    console.log('   - GET /sales - Listar ventas');
    console.log('   - GET /sales/:id - Obtener venta específica');
    console.log('   - PUT /sales/:id/status - Actualizar estado');
    console.log('   - GET /sales/reports/summary - Generar reportes');
    console.log('   - GET /sales/products/search - Buscar productos para venta');

    return {
      success: true,
      message: 'Estructura de ventas configurada exitosamente'
    };

  } catch (error) {
    console.error('❌ Error configurando estructura de ventas:', error);
    throw error;
  }
};

// Función para verificar la configuración
const verifySalesSetup = async () => {
  try {
    console.log('🔍 Verificando configuración de ventas...');

    // Verificar que existe la estructura de estadísticas
    const statsRef = db.ref('salesStats');
    const statsSnapshot = await statsRef.once('value');
    
    if (statsSnapshot.exists()) {
      console.log('✅ Estadísticas de ventas: OK');
    } else {
      console.log('⚠️ Estadísticas de ventas no encontradas');
    }

    // Verificar conexión con inventario
    const inventoryRef = db.ref('inventory/products');
    const inventorySnapshot = await inventoryRef.limitToFirst(1).once('value');
    
    if (inventorySnapshot.exists()) {
      console.log('✅ Conexión con inventario: OK');
    } else {
      console.log('⚠️ No se encontraron productos en inventario');
    }

    return {
      success: true,
      hasStats: statsSnapshot.exists(),
      hasInventory: inventorySnapshot.exists()
    };

  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  setupSalesDatabase()
    .then(() => {
      console.log('🎉 Configuración completada');
      return verifySalesSetup();
    })
    .then((verification) => {
      console.log('🔍 Verificación:', verification);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en configuración:', error);
      process.exit(1);
    });
}

module.exports = {
  setupSalesDatabase,
  verifySalesSetup
};