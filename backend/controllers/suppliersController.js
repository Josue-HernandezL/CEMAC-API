const { db } = require('../../firebaseConfig');

// Función auxiliar para generar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// GET /suppliers - Obtener todos los proveedores
const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    
    const suppliersRef = db.ref('inventory/suppliers');
    const snapshot = await suppliersRef.once('value');
    
    let suppliers = [];
    
    if (snapshot.exists()) {
      const suppliersData = snapshot.val();
      suppliers = Object.values(suppliersData);
    }

    // Filtrar por búsqueda si se proporciona
    if (search) {
      const searchLower = search.toLowerCase();
      suppliers = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchLower) ||
        (supplier.description && supplier.description.toLowerCase().includes(searchLower)) ||
        (supplier.contactName && supplier.contactName.toLowerCase().includes(searchLower)) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchLower)) ||
        (supplier.phone && supplier.phone.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar alfabéticamente
    suppliers.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      suppliers,
      total: suppliers.length,
      message: `Se encontraron ${suppliers.length} proveedor(es)`
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener proveedores',
      error: error.message
    });
  }
};

// POST /suppliers - Crear un proveedor
const createSupplier = async (req, res) => {
  try {
    const { name, description, contactName, email, phone, address } = req.body;
    const userId = req.user.uid;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'El nombre del proveedor es requerido' 
      });
    }

    // Validar email si se proporciona
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          success: false,
          message: 'El formato del email no es válido' 
        });
      }
    }

    // Verificar si ya existe un proveedor con ese nombre
    const suppliersRef = db.ref('inventory/suppliers');
    const snapshot = await suppliersRef.once('value');
    
    if (snapshot.exists()) {
      const suppliers = Object.values(snapshot.val());
      const exists = suppliers.some(supplier => 
        supplier.name.toLowerCase() === name.trim().toLowerCase()
      );
      
      if (exists) {
        return res.status(400).json({ 
          success: false,
          message: 'Ya existe un proveedor con ese nombre' 
        });
      }
    }

    const supplierId = generateId();
    const supplierData = {
      id: supplierId,
      name: name.trim(),
      description: description?.trim() || null,
      contactName: contactName?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      productCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    };

    const supplierRef = db.ref(`inventory/suppliers/${supplierId}`);
    await supplierRef.set(supplierData);

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      supplier: supplierData
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear proveedor',
      error: error.message
    });
  }
};

// PUT /suppliers/:id - Actualizar un proveedor
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contactName, email, phone, address, isActive } = req.body;
    const userId = req.user.uid;

    const supplierRef = db.ref(`inventory/suppliers/${id}`);
    const snapshot = await supplierRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        message: 'Proveedor no encontrado' 
      });
    }

    const currentSupplier = snapshot.val();
    const updateData = {
      ...currentSupplier,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    // Validar email si se proporciona
    if (email !== undefined && email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          success: false,
          message: 'El formato del email no es válido' 
        });
      }
    }

    // Si se actualiza el nombre, verificar que no exista y actualizar productos
    if (name && name.trim() !== '' && name.trim() !== currentSupplier.name) {
      // Verificar que no exista otro proveedor con ese nombre
      const suppliersRef = db.ref('inventory/suppliers');
      const suppliersSnapshot = await suppliersRef.once('value');
      
      if (suppliersSnapshot.exists()) {
        const suppliers = Object.values(suppliersSnapshot.val());
        const exists = suppliers.some(supplier => 
          supplier.id !== id && supplier.name.toLowerCase() === name.trim().toLowerCase()
        );
        
        if (exists) {
          return res.status(400).json({ 
            success: false,
            message: 'Ya existe un proveedor con ese nombre' 
          });
        }
      }

      // Actualizar proveedor en todos los productos
      const oldName = currentSupplier.name;
      const productsRef = db.ref('inventory/products');
      const productsSnapshot = await productsRef.once('value');

      if (productsSnapshot.exists()) {
        const products = productsSnapshot.val();
        const updates = {};

        Object.entries(products).forEach(([productId, product]) => {
          if (product.supplier === oldName) {
            updates[`inventory/products/${productId}/supplier`] = name.trim();
          }
        });

        if (Object.keys(updates).length > 0) {
          await db.ref().update(updates);
        }
      }

      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (contactName !== undefined) {
      updateData.contactName = contactName?.trim() || null;
    }
    if (email !== undefined) {
      updateData.email = email?.trim() || null;
    }
    if (phone !== undefined) {
      updateData.phone = phone?.trim() || null;
    }
    if (address !== undefined) {
      updateData.address = address?.trim() || null;
    }
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    await supplierRef.set(updateData);

    res.status(200).json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      supplier: updateData
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar proveedor',
      error: error.message
    });
  }
};

// DELETE /suppliers/:id - Eliminar un proveedor
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplierRef = db.ref(`inventory/suppliers/${id}`);
    const snapshot = await supplierRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        message: 'Proveedor no encontrado' 
      });
    }

    const supplier = snapshot.val();
    const supplierName = supplier.name;

    // Verificar si hay productos con este proveedor
    const productsRef = db.ref('inventory/products');
    const productsSnapshot = await productsRef.once('value');

    let productCount = 0;
    if (productsSnapshot.exists()) {
      const products = Object.values(productsSnapshot.val());
      productCount = products.filter(p => p.supplier === supplierName && p.isActive !== false).length;
    }

    if (productCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `No se puede eliminar el proveedor porque tiene ${productCount} producto(s) asociado(s)` 
      });
    }

    await supplierRef.remove();

    res.status(200).json({
      success: true,
      message: 'Proveedor eliminado exitosamente',
      supplierId: id
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar proveedor',
      error: error.message
    });
  }
};

// GET /suppliers/:id/stats - Obtener estadísticas de un proveedor
const getSupplierStats = async (req, res) => {
  try {
    const { id } = req.params;

    const supplierRef = db.ref(`inventory/suppliers/${id}`);
    const snapshot = await supplierRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        message: 'Proveedor no encontrado' 
      });
    }

    const supplier = snapshot.val();
    const supplierName = supplier.name;

    // Obtener productos de este proveedor
    const productsRef = db.ref('inventory/products');
    const productsSnapshot = await productsRef.once('value');

    let products = [];
    if (productsSnapshot.exists()) {
      const productsData = productsSnapshot.val();
      products = Object.values(productsData).filter(p => 
        p.supplier === supplierName && p.isActive !== false
      );
    }

    const stats = {
      productCount: products.length,
      activeProducts: products.filter(p => p.isActive !== false).length,
      limitedProducts: products.filter(p => p.availability === 'limited').length,
      unlimitedProducts: products.filter(p => p.availability === 'unlimited').length,
      totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
      lowStockProducts: products.filter(p => 
        p.availability === 'limited' && p.stock <= (p.minStock || 0)
      ).length,
      averagePrice: products.length > 0 
        ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
        : 0
    };

    res.status(200).json({
      success: true,
      supplier,
      stats,
      message: 'Estadísticas obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de proveedor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener estadísticas de proveedor',
      error: error.message
    });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
};
