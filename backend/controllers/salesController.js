const { db } = require('../../firebaseConfig');

// Función auxiliar para generar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Función auxiliar para actualizar stock del inventario
const updateProductStock = async (productId, quantity, userId) => {
  const productRef = db.ref(`inventory/products/${productId}`);
  const productSnapshot = await productRef.once('value');
  
  if (!productSnapshot.exists()) {
    throw new Error(`Producto con ID ${productId} no encontrado`);
  }
  
  const product = productSnapshot.val();
  
  // Solo actualizar stock si el producto tiene disponibilidad limitada
  if (product.availability === 'limited') {
    const currentStock = product.stock || 0;
    const newStock = currentStock - quantity;
    
    if (newStock < 0) {
      throw new Error(`Stock insuficiente para el producto ${product.name}. Stock disponible: ${currentStock}`);
    }
    
    // Actualizar stock del producto
    await productRef.update({
      stock: newStock,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    });

    // Registrar movimiento de stock
    const movementId = generateId();
    const movement = {
      id: movementId,
      productId,
      type: 'salida',
      quantity: parseInt(quantity),
      reason: 'Venta',
      userId,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('es-ES')
    };

    const movementRef = db.ref(`inventory/stockMovements/${movementId}`);
    await movementRef.set(movement);
  }
  
  return product;
};

// Función auxiliar para validar productos de la venta
const validateSaleProducts = async (products) => {
  const validatedProducts = [];
  let totalAmount = 0;
  
  for (const item of products) {
    const { productId, quantity, price } = item;
    
    if (!productId || !quantity || !price) {
      throw new Error('Cada producto debe tener productId, quantity y price');
    }
    
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    
    if (price < 0) {
      throw new Error('El precio no puede ser negativo');
    }
    
    // Verificar que el producto existe
    const productRef = db.ref(`inventory/products/${productId}`);
    const productSnapshot = await productRef.once('value');
    
    if (!productSnapshot.exists()) {
      throw new Error(`Producto con ID ${productId} no encontrado`);
    }
    
    const product = productSnapshot.val();
    
    if (product.isActive === false) {
      throw new Error(`Producto ${product.name} no está disponible`);
    }
    
    // Verificar stock si es limitado
    if (product.availability === 'limited') {
      const currentStock = product.stock || 0;
      if (currentStock < quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Stock disponible: ${currentStock}`);
      }
    }
    
    const itemTotal = quantity * price;
    totalAmount += itemTotal;
    
    validatedProducts.push({
      productId,
      productName: product.name,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(price),
      totalPrice: itemTotal,
      availability: product.availability
    });
  }
  
  return { validatedProducts, totalAmount };
};

// POST /sales - Crear nueva venta
const createSale = async (req, res) => {
  try {
    const { 
      cliente, 
      customerId,
      vendedor, 
      descuento = 0, 
      products,
      paymentMethod = 'efectivo',
      notes = ''
    } = req.body;
    
    const userId = req.user.uid;

    // Validaciones básicas
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto en la venta'
      });
    }

    if (descuento < 0 || descuento > 100) {
      return res.status(400).json({
        success: false,
        message: 'El descuento debe estar entre 0 y 100%'
      });
    }

    // Validar IVA si se proporciona
    const { iva: ivaPercentage = 0 } = req.body;
    if (ivaPercentage < 0 || ivaPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'El IVA debe estar entre 0 y 100%'
      });
    }

    // Si se proporciona customerId, validar que existe
    let customerData = null;
    if (customerId) {
      const customerSnapshot = await db.ref(`customers/${customerId}`).once('value');
      customerData = customerSnapshot.val();
      
      if (!customerData || !customerData.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cliente no encontrado o inactivo'
        });
      }
    }

    // Validar productos y calcular totales
    const { validatedProducts, totalAmount } = await validateSaleProducts(products);
    
    // Calcular totales
    const discountAmount = (totalAmount * (descuento / 100));
    const subtotal = totalAmount - discountAmount;
    
    // IVA opcional - si no se proporciona, se asume que ya está incluido en los precios
    const ivaAmount = subtotal * (ivaPercentage / 100);
    const total = subtotal + ivaAmount;

    const saleId = generateId();
    const saleData = {
      id: saleId,
      cliente: cliente ? cliente.trim() : (customerData ? customerData.fullName : 'Cliente General'),
      customerId: customerId || null,
      vendedor: vendedor ? vendedor.trim() : 'No asignado',
      products: validatedProducts,
      subtotal: parseFloat(subtotal.toFixed(2)),
      descuento: parseFloat(descuento),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      ivaPercentage: parseFloat(ivaPercentage),
      ivaAmount: parseFloat(ivaAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      paymentMethod,
      notes,
      status: 'completada',
      createdAt: new Date().toISOString(),
      createdBy: userId,
      date: new Date().toLocaleDateString('es-ES'),
      timestamp: Date.now()
    };

    // Actualizar stock de productos
    for (const product of validatedProducts) {
      await updateProductStock(product.productId, product.quantity, userId);
    }

    // Guardar venta
    const saleRef = db.ref(`sales/${saleId}`);
    await saleRef.set(saleData);

    // Si hay cliente asociado, actualizar sus estadísticas
    if (customerId && customerData) {
      const updateData = {
        totalPurchases: (customerData.totalPurchases || 0) + 1,
        totalSpent: (customerData.totalSpent || 0) + total,
        lastPurchaseDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.ref(`customers/${customerId}`).update(updateData);
    }

    res.status(201).json({
      success: true,
      sale: saleData,
      message: 'Venta registrada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

// GET /sales - Listar ventas con filtros
const getSales = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      startDate,
      endDate,
      vendedor,
      cliente,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const salesRef = db.ref('sales');
    const snapshot = await salesRef.once('value');
    let sales = [];

    if (snapshot.exists()) {
      const salesData = snapshot.val();
      sales = Object.values(salesData);
    }

    // Aplicar filtros
    let filteredSales = sales;

    // Filtro por fecha
    if (startDate) {
      const start = new Date(startDate);
      filteredSales = filteredSales.filter(sale => 
        new Date(sale.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Final del día
      filteredSales = filteredSales.filter(sale => 
        new Date(sale.createdAt) <= end
      );
    }

    // Filtro por vendedor
    if (vendedor) {
      filteredSales = filteredSales.filter(sale => 
        sale.vendedor && sale.vendedor.toLowerCase().includes(vendedor.toLowerCase())
      );
    }

    // Filtro por cliente
    if (cliente) {
      filteredSales = filteredSales.filter(sale => 
        sale.cliente && sale.cliente.toLowerCase().includes(cliente.toLowerCase())
      );
    }

    // Filtro por estado
    if (status) {
      filteredSales = filteredSales.filter(sale => 
        sale.status === status
      );
    }

    // Ordenamiento
    filteredSales.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'total' || sortBy === 'subtotal') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
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
    const paginatedSales = filteredSales.slice(startIndex, endIndex);

    // Estadísticas
    const totalSales = filteredSales.length;
    const totalPages = Math.ceil(totalSales / limit);
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

    res.status(200).json({
      success: true,
      sales: paginatedSales,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalSales,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      statistics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageSale: totalSales > 0 ? parseFloat((totalRevenue / totalSales).toFixed(2)) : 0,
        totalSales
      },
      filters: {
        startDate,
        endDate,
        vendedor,
        cliente,
        status,
        sortBy,
        sortOrder
      },
      message: `Se encontraron ${totalSales} ventas`
    });

  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// GET /sales/:id - Obtener venta específica
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const saleRef = db.ref(`sales/${id}`);
    const snapshot = await saleRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    const sale = snapshot.val();

    res.status(200).json({
      success: true,
      sale: sale,
      message: 'Venta obtenida exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// PUT /sales/:id/status - Actualizar estado de venta
const updateSaleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.uid;

    // Validar estado
    const validStatuses = ['pendiente', 'completada', 'cancelada', 'devuelta'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`
      });
    }

    // Verificar que la venta existe
    const saleRef = db.ref(`sales/${id}`);
    const snapshot = await saleRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    const sale = snapshot.val();

    // Actualizar estado
    const updatedSale = {
      ...sale,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await saleRef.set(updatedSale);

    res.status(200).json({
      success: true,
      sale: updatedSale,
      message: 'Estado de venta actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar estado de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// GET /sales/products/search - Buscar productos disponibles para venta
const searchAvailableProducts = async (req, res) => {
  try {
    const { 
      search = '', 
      limit = 10,
      includeStock = true 
    } = req.query;

    const productsRef = db.ref('inventory/products');
    const snapshot = await productsRef.once('value');
    let products = [];

    if (snapshot.exists()) {
      const productsData = snapshot.val();
      products = Object.values(productsData);
    }

    // Filtrar solo productos activos y disponibles para venta
    let availableProducts = products.filter(product => {
      // Debe estar activo
      if (product.isActive === false) return false;
      
      // Si tiene stock limitado, debe tener stock disponible
      if (product.availability === 'limited' && (product.stock || 0) <= 0) {
        return false;
      }
      
      return true;
    });

    // Filtrar por búsqueda
    if (search) {
      const searchTerm = search.toLowerCase();
      availableProducts = availableProducts.filter(product => 
        (product.name && product.name.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
      );
    }

    // Limitar resultados
    availableProducts = availableProducts.slice(0, parseInt(limit));

    // Formatear respuesta para la venta
    const formattedProducts = availableProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      promotionalPrice: product.promotionalPrice || null,
      category: product.category || null,
      imageUrl: product.imageUrl || null,
      availability: product.availability,
      stock: product.availability === 'limited' ? product.stock : null,
      availableForSale: true,
      // Información adicional útil para las ventas
      suggestedPrice: product.promotionalPrice || product.price,
      maxQuantity: product.availability === 'limited' ? product.stock : 999
    }));

    res.status(200).json({
      success: true,
      products: formattedProducts,
      totalFound: formattedProducts.length,
      searchTerm: search,
      message: `Se encontraron ${formattedProducts.length} productos disponibles para venta`
    });

  } catch (error) {
    console.error('Error al buscar productos disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// GET /sales/reports/summary - Resumen de ventas
const getSalesReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      vendedor,
      groupBy = 'day' // day, week, month
    } = req.query;

    const salesRef = db.ref('sales');
    const snapshot = await salesRef.once('value');
    let sales = [];

    if (snapshot.exists()) {
      const salesData = snapshot.val();
      sales = Object.values(salesData);
    }

    // Filtrar por fecha
    if (startDate) {
      const start = new Date(startDate);
      sales = sales.filter(sale => new Date(sale.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      sales = sales.filter(sale => new Date(sale.createdAt) <= end);
    }

    // Filtrar por vendedor
    if (vendedor) {
      sales = sales.filter(sale => 
        sale.vendedor && sale.vendedor.toLowerCase().includes(vendedor.toLowerCase())
      );
    }

    // Solo ventas completadas para reportes
    sales = sales.filter(sale => sale.status === 'completada');

    // Calcular métricas
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = sales.length;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Productos más vendidos
    const productSales = {};
    sales.forEach(sale => {
      sale.products.forEach(product => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = {
            productId: product.productId,
            productName: product.productName,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        productSales[product.productId].totalQuantity += product.quantity;
        productSales[product.productId].totalRevenue += product.totalPrice;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    // Ventas por vendedor
    const salesByVendedor = {};
    sales.forEach(sale => {
      const vendedor = sale.vendedor || 'No asignado';
      if (!salesByVendedor[vendedor]) {
        salesByVendedor[vendedor] = {
          vendedor,
          totalSales: 0,
          totalRevenue: 0
        };
      }
      salesByVendedor[vendedor].totalSales += 1;
      salesByVendedor[vendedor].totalRevenue += sale.total;
    });

    const topVendedores = Object.values(salesByVendedor)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json({
      success: true,
      report: {
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalSales,
          averageSale: parseFloat(averageSale.toFixed(2)),
          period: {
            startDate,
            endDate
          }
        },
        topProducts,
        salesByVendedor: topVendedores
      },
      message: 'Reporte generado exitosamente'
    });

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSaleStatus,
  getSalesReport,
  searchAvailableProducts
};