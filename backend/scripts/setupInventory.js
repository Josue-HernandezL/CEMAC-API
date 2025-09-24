const { db } = require('../../firebaseConfig');

// Función para inicializar estructura de inventario en Firebase
const initializeInventoryStructure = async () => {
  try {
    console.log('🔧 Inicializando estructura de inventario...');

    // Crear nodos principales si no existen
    const inventoryStructure = {
      products: {
        '_info': {
          description: 'Catálogo de productos del inventario',
          structure: {
            id: 'string - ID único del producto',
            name: 'string - Nombre del producto',
            description: 'string - Descripción del producto',
            price: 'number - Precio regular',
            promotionalPrice: 'number|null - Precio promocional',
            availability: 'string - limitada|ilimitada',
            stock: 'number|null - Cantidad en stock (solo para limitada)',
            category: 'string|null - Categoría del producto',
            sku: 'string|null - SKU único del producto',
            imageUrl: 'string|null - URL de la imagen en Cloudinary',
            imagePublicId: 'string|null - ID público de Cloudinary',
            isActive: 'boolean - Estado del producto',
            createdBy: 'string - UID del usuario que creó',
            createdAt: 'string - Timestamp de creación',
            updatedAt: 'string - Timestamp de última actualización'
          },
          createdAt: new Date().toISOString()
        }
      },
      stockMovements: {
        '_info': {
          description: 'Historial de movimientos de stock',
          structure: {
            productId: {
              movementId: {
                id: 'string - ID único del movimiento',
                productId: 'string - ID del producto',
                type: 'string - entry|exit',
                quantity: 'number - Cantidad del movimiento',
                reason: 'string - Razón del movimiento',
                userId: 'string - UID del usuario que realizó el movimiento',
                timestamp: 'string - Timestamp del movimiento',
                createdAt: 'string - Timestamp de creación'
              }
            }
          },
          createdAt: new Date().toISOString()
        }
      },
      categories: {
        '_info': {
          description: 'Categorías de productos disponibles',
          note: 'Este nodo puede usarse para definir categorías predefinidas',
          createdAt: new Date().toISOString()
        }
      }
    };

    // Verificar si ya existe estructura
    const rootRef = db.ref();
    const snapshot = await rootRef.once('value');
    const data = snapshot.val() || {};

    // Solo crear nodos que no existan
    for (const [nodeName, nodeStructure] of Object.entries(inventoryStructure)) {
      if (!data[nodeName]) {
        const nodeRef = db.ref(nodeName);
        await nodeRef.set(nodeStructure);
        console.log(`✅ Nodo '${nodeName}' creado exitosamente`);
      } else {
        console.log(`ℹ️  Nodo '${nodeName}' ya existe, omitiendo...`);
      }
    }

    // Crear algunas categorías de ejemplo si no existen
    const categoriesRef = db.ref('categories');
    const categoriesSnapshot = await categoriesRef.once('value');
    
    if (!categoriesSnapshot.exists() || Object.keys(categoriesSnapshot.val()).length <= 1) {
      const sampleCategories = {
        electronics: {
          id: 'electronics',
          name: 'Electrónicos',
          description: 'Productos electrónicos y tecnológicos',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        clothing: {
          id: 'clothing',
          name: 'Ropa',
          description: 'Prendas de vestir y accesorios',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        books: {
          id: 'books',
          name: 'Libros',
          description: 'Libros y material educativo',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        home_garden: {
          id: 'home_garden',
          name: 'Hogar y Jardín',
          description: 'Productos para el hogar y jardín',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        sports: {
          id: 'sports',
          name: 'Deportes',
          description: 'Artículos deportivos y fitness',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      };

      for (const [catId, catData] of Object.entries(sampleCategories)) {
        const categoryRef = db.ref(`categories/${catId}`);
        await categoryRef.set(catData);
      }
      console.log('✅ Categorías de ejemplo creadas');
    }

    console.log('🎉 Estructura de inventario inicializada correctamente');
    
    return {
      success: true,
      message: 'Estructura de inventario inicializada correctamente',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error inicializando estructura de inventario:', error);
    throw error;
  }
};

// Función para crear producto de ejemplo
const createSampleProduct = async () => {
  try {
    console.log('📦 Creando producto de ejemplo...');

    const sampleProductId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const sampleProduct = {
      id: sampleProductId,
      name: 'Producto de Ejemplo',
      description: 'Este es un producto de ejemplo para probar el sistema de inventario',
      price: 29.99,
      promotionalPrice: 24.99,
      availability: 'limitada',
      stock: 100,
      category: 'electronics',
      sku: 'SAMPLE-001',
      imageUrl: null,
      imagePublicId: null,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const productRef = db.ref(`products/${sampleProductId}`);
    await productRef.set(sampleProduct);

    // Crear movimiento inicial de stock
    const movementId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const stockMovementRef = db.ref(`stockMovements/${sampleProductId}/${movementId}`);
    await stockMovementRef.set({
      id: movementId,
      productId: sampleProductId,
      type: 'entry',
      quantity: 100,
      reason: 'Stock inicial - Producto de ejemplo',
      userId: 'system',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    console.log('✅ Producto de ejemplo creado exitosamente');
    console.log(`   ID: ${sampleProductId}`);
    console.log(`   Nombre: ${sampleProduct.name}`);
    console.log(`   Stock inicial: ${sampleProduct.stock}`);

    return sampleProduct;

  } catch (error) {
    console.error('❌ Error creando producto de ejemplo:', error);
    throw error;
  }
};

// Función principal para configurar inventario
const setupInventory = async () => {
  try {
    console.log('🚀 Iniciando configuración del sistema de inventario...\n');

    // Inicializar estructura
    await initializeInventoryStructure();
    console.log('');

    // Crear producto de ejemplo
    await createSampleProduct();
    console.log('');

    console.log('🎉 Configuración del inventario completada exitosamente!');
    console.log('📝 Puedes probar los endpoints:');
    console.log('   GET    /inventory          - Listar productos');
    console.log('   POST   /inventory          - Crear producto');
    console.log('   GET    /inventory/:id      - Ver producto específico');
    console.log('   PUT    /inventory/:id      - Actualizar producto');
    console.log('   DELETE /inventory/:id      - Eliminar producto');
    console.log('   POST   /inventory/:id/stock - Actualizar stock');
    console.log('   GET    /inventory/:id/history - Ver historial');

  } catch (error) {
    console.error('❌ Error en la configuración del inventario:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  setupInventory().then(() => {
    console.log('\n✨ Proceso completado. Puedes cerrar esta ventana.');
    process.exit(0);
  });
}

module.exports = {
  initializeInventoryStructure,
  createSampleProduct,
  setupInventory
};