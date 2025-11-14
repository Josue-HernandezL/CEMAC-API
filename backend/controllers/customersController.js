const { db } = require('../../firebaseConfig');

// Registrar nuevo cliente
const registerCustomer = async (req, res) => {
  try {
    const { firstName, lastName, birthDate, notes } = req.body;

    // Validación de campos requeridos
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y apellido son obligatorios'
      });
    }

    // Validar formato de fecha de cumpleaños si se proporciona
    if (birthDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
    }

    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerData = {
      id: customerId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      birthDate: birthDate || null,
      notes: notes?.trim() || '',
      totalPurchases: 0,
      totalSpent: 0,
      lastPurchaseDate: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
      updatedAt: new Date().toISOString()
    };

    // Guardar en Firebase
    await db.ref(`customers/${customerId}`).set(customerData);

    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      data: customerData
    });

  } catch (error) {
    console.error('Error registrando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Listar clientes con filtros y paginación
const getCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Máximo 50 por página
    const offset = (pageNum - 1) * limitNum;

    // Obtener todos los clientes
    const snapshot = await db.ref('customers').once('value');
    const customersData = snapshot.val() || {};
    let customers = Object.values(customersData);

    // Filtrar solo clientes activos
    customers = customers.filter(customer => customer.isActive === true);

    // Filtrar por búsqueda si se proporciona
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      customers = customers.filter(customer => 
        customer.fullName?.toLowerCase().includes(searchTerm) ||
        customer.firstName?.toLowerCase().includes(searchTerm) ||
        customer.lastName?.toLowerCase().includes(searchTerm) ||
        customer.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar
    customers.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Manejar campos de fecha
      if (sortBy === 'createdAt' || sortBy === 'lastPurchaseDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      // Manejar campos numéricos
      if (sortBy === 'totalPurchases' || sortBy === 'totalSpent') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Paginación
    const totalCustomers = customers.length;
    const paginatedCustomers = customers.slice(offset, offset + limitNum);

    // Estadísticas básicas
    const stats = {
      totalCustomers: totalCustomers,
      activeCustomers: customers.length,
      totalSpent: customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0),
      averageSpent: customers.length > 0 ? 
        Math.round(customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) / customers.length) : 0
    };

    res.json({
      success: true,
      data: {
        customers: paginatedCustomers,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCustomers / limitNum),
          totalCustomers: totalCustomers,
          hasNextPage: offset + limitNum < totalCustomers,
          hasPrevPage: pageNum > 1,
          limit: limitNum,
          offset: offset
        },
        stats: stats
      },
      message: `Se encontraron ${totalCustomers} clientes`
    });

  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener cliente específico con historial de compras
const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Obtener datos del cliente
    const customerSnapshot = await db.ref(`customers/${customerId}`).once('value');
    const customer = customerSnapshot.val();

    if (!customer || !customer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener historial de compras del cliente
    const salesSnapshot = await db.ref('sales').orderByChild('customerId').equalTo(customerId).once('value');
    const salesData = salesSnapshot.val() || {};
    const purchaseHistory = Object.values(salesData)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(sale => ({
        saleId: sale.id,
        date: sale.date,
        total: sale.total,
        status: sale.status,
        products: sale.products?.length || 0,
        paymentMethod: sale.paymentMethod
      }));

    // Calcular estadísticas del cliente
    const summary = {
      totalOrders: purchaseHistory.length,
      completedOrders: purchaseHistory.filter(p => p.status === 'completada').length,
      averageOrderValue: purchaseHistory.length > 0 ? 
        Math.round(purchaseHistory.reduce((sum, p) => sum + p.total, 0) / purchaseHistory.length) : 0,
      membershipDays: Math.ceil((new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24)),
      daysSinceLastPurchase: customer.lastPurchaseDate ? 
        Math.ceil((new Date() - new Date(customer.lastPurchaseDate)) / (1000 * 60 * 60 * 24)) : null
    };

    res.json({
      success: true,
      data: {
        customer: customer,
        purchaseHistory: purchaseHistory,
        summary: summary
      },
      message: 'Información del cliente obtenida exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar información del cliente
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { firstName, lastName, birthDate, notes } = req.body;

    // Verificar que el cliente existe
    const customerSnapshot = await db.ref(`customers/${customerId}`).once('value');
    const existingCustomer = customerSnapshot.val();

    if (!existingCustomer || !existingCustomer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Validar formato de fecha si se proporciona
    if (birthDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (firstName) {
      updateData.firstName = firstName.trim();
    }
    if (lastName) {
      updateData.lastName = lastName.trim();
    }
    if (updateData.firstName || updateData.lastName) {
      updateData.fullName = `${updateData.firstName || existingCustomer.firstName} ${updateData.lastName || existingCustomer.lastName}`;
    }
    if (birthDate !== undefined) {
      updateData.birthDate = birthDate;
    }
    if (notes !== undefined) {
      updateData.notes = notes?.trim() || '';
    }

    // Actualizar en Firebase
    await db.ref(`customers/${customerId}`).update(updateData);

    // Obtener datos actualizados
    const updatedSnapshot = await db.ref(`customers/${customerId}`).once('value');
    const updatedCustomer = updatedSnapshot.val();

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Búsqueda rápida de clientes
const searchCustomers = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Ingrese al menos 2 caracteres para buscar'
      });
    }

    const searchTerm = q.toLowerCase().trim();
    const limitNum = Math.min(parseInt(limit), 20); // Máximo 20 resultados

    // Obtener todos los clientes activos
    const snapshot = await db.ref('customers').once('value');
    const customersData = snapshot.val() || {};
    const customers = Object.values(customersData)
      .filter(customer => customer.isActive === true)
      .filter(customer => 
        customer.fullName?.toLowerCase().includes(searchTerm) ||
        customer.firstName?.toLowerCase().includes(searchTerm) ||
        customer.lastName?.toLowerCase().includes(searchTerm)
      )
      .slice(0, limitNum)
      .map(customer => ({
        id: customer.id,
        fullName: customer.fullName,
        firstName: customer.firstName,
        lastName: customer.lastName,
        totalPurchases: customer.totalPurchases || 0,
        totalSpent: customer.totalSpent || 0,
        lastPurchaseDate: customer.lastPurchaseDate
      }));

    res.json({
      success: true,
      data: customers,
      message: `Búsqueda completada - ${customers.length} resultado(s) encontrado(s)`
    });

  } catch (error) {
    console.error('Error en búsqueda de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  registerCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  searchCustomers
};