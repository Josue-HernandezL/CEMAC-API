const { db } = require('../../firebaseConfig');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes.'), false);
    }
  }
});

// Función auxiliar para subir imagen a Cloudinary
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: `inventory/${Date.now()}_${filename}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Función auxiliar para generar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Función auxiliar para registrar movimiento de stock
const logStockMovement = async (productId, type, quantity, reason, userId) => {
  const movementId = generateId();
  const movement = {
    id: movementId,
    productId,
    type, // 'entrada' o 'salida'
    quantity: parseInt(quantity),
    reason,
    userId,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-ES')
  };

  const movementRef = db.ref(`inventory/stockMovements/${movementId}`);
  await movementRef.set(movement);
  
  return movement;
};

// GET /inventory - Listar productos con filtros y búsqueda
const getProducts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      availability, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const productsRef = db.ref('inventory/products');
    const snapshot = await productsRef.once('value');
    let products = [];

    if (snapshot.exists()) {
      const productsData = snapshot.val();
      products = Object.values(productsData);
    }

    // Aplicar filtros
    let filteredProducts = products.filter(product => product.isActive !== false);

    // Filtro por búsqueda en nombre, descripción, código de barras y código de proveedor
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        (product.name && product.name.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm)) ||
        (product.supplierCode && product.supplierCode.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro por categoría
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category && product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filtro por disponibilidad
    if (availability) {
      if (availability === 'limited') {
        filteredProducts = filteredProducts.filter(product => 
          product.availability === 'limited' && product.stock > 0
        );
      } else if (availability === 'unlimited') {
        filteredProducts = filteredProducts.filter(product => 
          product.availability === 'unlimited'
        );
      } else if (availability === 'out-of-stock') {
        filteredProducts = filteredProducts.filter(product => 
          product.availability === 'limited' && product.stock === 0
        );
      }
    }

    // Filtro por rango de precios
    if (minPrice) {
      const min = parseFloat(minPrice);
      filteredProducts = filteredProducts.filter(product => 
        product.price >= min
      );
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter(product => 
        product.price <= max
      );
    }

    // Ordenamiento
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Manejar valores undefined
      if (aValue === undefined) aValue = 0;
      if (bValue === undefined) bValue = 0;

      // Convertir a números si es necesario
      if (sortBy === 'price' || sortBy === 'stock') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Ordenar fechas
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Estadísticas
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      },
      filters: {
        search,
        category,
        availability,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      },
      message: `Se encontraron ${totalProducts} productos`
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// POST /inventory - Añadir producto
const createProduct = async (req, res) => {
  try {
    const { name, description, price, promotionalPrice, availability, category, stock, barcode, supplierCode } = req.body;
    const userId = req.user.uid;

    // Validaciones
    if (!name || !description || !price || !availability) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: name, description, price, availability'
      });
    }

    if (!['limited', 'unlimited'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'availability debe ser "limited" o "unlimited"'
      });
    }

    if (availability === 'limited' && (!stock || stock < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Para productos limitados, el stock debe ser mayor o igual a 0'
      });
    }

    const productId = generateId();
    let imageUrl = null;

    // Subir imagen si se proporciona
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error al subir imagen:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Error al subir la imagen',
          error: uploadError.message
        });
      }
    }

    const product = {
      id: productId,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : null,
      availability,
      category: category ? category.trim() : null,
      stock: availability === 'limited' ? parseInt(stock) : null,
      barcode: barcode ? barcode.trim() : null,
      supplierCode: supplierCode ? supplierCode.trim() : null,
      imageUrl,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    };

    // Guardar producto
    const productRef = db.ref(`inventory/products/${productId}`);
    await productRef.set(product);

    // Registrar movimiento de stock inicial si es necesario
    if (availability === 'limited' && parseInt(stock) > 0) {
      await logStockMovement(productId, 'entrada', stock, 'Stock inicial', userId);
    }

    res.status(201).json({
      success: true,
      product: product,
      message: 'Producto creado exitosamente'
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// GET /inventory/:id - Ver producto específico
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productRef = db.ref(`inventory/products/${id}`);
    const snapshot = await productRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = snapshot.val();

    if (product.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'Producto no disponible'
      });
    }

    res.status(200).json({
      success: true,
      product: product,
      message: 'Producto obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// PUT /inventory/:id - Actualizar producto
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, promotionalPrice, availability, category, stock, barcode, supplierCode } = req.body;
    const userId = req.user.uid;

    // Verificar que el producto existe
    const productRef = db.ref(`inventory/products/${id}`);
    const snapshot = await productRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const currentProduct = snapshot.val();

    if (currentProduct.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'No se puede actualizar un producto inactivo'
      });
    }

    // Validaciones
    if (availability && !['limited', 'unlimited'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'availability debe ser "limited" o "unlimited"'
      });
    }

    let imageUrl = currentProduct.imageUrl;

    // Subir nueva imagen si se proporciona
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error al subir imagen:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Error al subir la imagen',
          error: uploadError.message
        });
      }
    }

    // Preparar datos actualizados
    const updatedData = {
      ...currentProduct,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    if (name !== undefined) updatedData.name = name.trim();
    if (description !== undefined) updatedData.description = description.trim();
    if (price !== undefined) updatedData.price = parseFloat(price);
    if (promotionalPrice !== undefined) {
      updatedData.promotionalPrice = promotionalPrice ? parseFloat(promotionalPrice) : null;
    }
    if (availability !== undefined) updatedData.availability = availability;
    if (category !== undefined) updatedData.category = category ? category.trim() : null;
    if (stock !== undefined && availability === 'limited') {
      updatedData.stock = parseInt(stock);
    }
    if (barcode !== undefined) updatedData.barcode = barcode ? barcode.trim() : null;
    if (supplierCode !== undefined) updatedData.supplierCode = supplierCode ? supplierCode.trim() : null;
    if (imageUrl !== undefined) {
      updatedData.imageUrl = imageUrl;
    }

    // Actualizar producto
    await productRef.set(updatedData);

    res.status(200).json({
      success: true,
      product: updatedData,
      message: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// DELETE /inventory/:id - Eliminar producto (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Verificar que el producto existe
    const productRef = db.ref(`inventory/products/${id}`);
    const snapshot = await productRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = snapshot.val();

    if (product.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'El producto ya está eliminado'
      });
    }

    // Soft delete - marcar como inactivo
    const updatedProduct = {
      ...product,
      isActive: false,
      deletedAt: new Date().toISOString(),
      deletedBy: userId
    };

    await productRef.set(updatedProduct);

    res.status(200).json({
      success: true,
      productId: id,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// POST /inventory/:id/stock - Actualizar stock (entrada/salida)
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;
    const userId = req.user.uid;

    // Validaciones
    if (!type || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: type, quantity, reason'
      });
    }

    if (!['entrada', 'salida'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type debe ser "entrada" o "salida"'
      });
    }

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    // Verificar que el producto existe
    const productRef = db.ref(`inventory/products/${id}`);
    const snapshot = await productRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = snapshot.val();

    if (product.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'No se puede actualizar stock de un producto inactivo'
      });
    }

    if (product.availability !== 'limited') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede actualizar stock en productos con disponibilidad limitada'
      });
    }

    // Calcular nuevo stock
    let newStock = product.stock || 0;
    
    if (type === 'entrada') {
      newStock += quantityNum;
    } else {
      newStock -= quantityNum;
      
      // Verificar que no quede en negativo
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Stock actual: ${product.stock}`
        });
      }
    }

    // Actualizar stock del producto
    const updatedProduct = {
      ...product,
      stock: newStock,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await productRef.set(updatedProduct);

    // Registrar movimiento
    const movement = await logStockMovement(id, type, quantityNum, reason, userId);

    res.status(200).json({
      success: true,
      product: updatedProduct,
      movement: movement,
      message: `Stock ${type === 'entrada' ? 'aumentado' : 'reducido'} exitosamente`
    });

  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// GET /inventory/:id/history - Historial de movimientos
const getStockHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verificar que el producto existe
    const productRef = db.ref(`inventory/products/${id}`);
    const productSnapshot = await productRef.once('value');

    if (!productSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Obtener movimientos del producto
    const movementsRef = db.ref('inventory/stockMovements');
    const movementsQuery = movementsRef.orderByChild('productId').equalTo(id);
    const snapshot = await movementsQuery.once('value');

    let movements = [];
    if (snapshot.exists()) {
      const movementsData = snapshot.val();
      movements = Object.values(movementsData);
    }

    // Ordenar por fecha (más reciente primero)
    movements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMovements = movements.slice(startIndex, endIndex);

    const totalMovements = movements.length;
    const totalPages = Math.ceil(totalMovements / limit);

    // Estadísticas
    const stats = {
      totalMovements,
      totalEntradas: movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0),
      totalSalidas: movements.filter(m => m.type === 'salida').reduce((sum, m) => sum + m.quantity, 0)
    };

    res.status(200).json({
      success: true,
      movements: paginatedMovements,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalMovements,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      },
      message: `Historial obtenido exitosamente`
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getStockHistory,
  upload
};