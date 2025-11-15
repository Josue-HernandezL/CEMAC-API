const { db } = require('../../firebaseConfig');

// Función auxiliar para generar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// GET /categories - Obtener todas las categorías
const getCategories = async (req, res) => {
  try {
    const { search } = req.query;
    
    const categoriesRef = db.ref('inventory/categories');
    const snapshot = await categoriesRef.once('value');
    
    let categories = [];
    
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      categories = Object.values(categoriesData);
    }

    // Filtrar por búsqueda si se proporciona
    if (search) {
      const searchLower = search.toLowerCase();
      categories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description && cat.description.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar alfabéticamente
    categories.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      categories,
      total: categories.length,
      message: `Se encontraron ${categories.length} categoría(s)`
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// POST /categories - Crear una categoría
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.uid;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'El nombre de la categoría es requerido' 
      });
    }

    // Verificar si ya existe una categoría con ese nombre
    const categoriesRef = db.ref('inventory/categories');
    const snapshot = await categoriesRef.once('value');
    
    if (snapshot.exists()) {
      const categories = Object.values(snapshot.val());
      const exists = categories.some(cat => 
        cat.name.toLowerCase() === name.trim().toLowerCase()
      );
      
      if (exists) {
        return res.status(400).json({ 
          success: false,
          message: 'Ya existe una categoría con ese nombre' 
        });
      }
    }

    const categoryId = generateId();
    const categoryData = {
      id: categoryId,
      name: name.trim(),
      description: description?.trim() || null,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    };

    const categoryRef = db.ref(`inventory/categories/${categoryId}`);
    await categoryRef.set(categoryData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      category: categoryData
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

// PUT /categories/:id - Actualizar una categoría
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.uid;

    const categoryRef = db.ref(`inventory/categories/${id}`);
    const snapshot = await categoryRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        message: 'Categoría no encontrada' 
      });
    }

    const currentCategory = snapshot.val();
    const updateData = {
      ...currentCategory,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    // Si se actualiza el nombre, verificar que no exista y actualizar productos
    if (name && name.trim() !== '' && name.trim() !== currentCategory.name) {
      // Verificar que no exista otra categoría con ese nombre
      const categoriesRef = db.ref('inventory/categories');
      const categoriesSnapshot = await categoriesRef.once('value');
      
      if (categoriesSnapshot.exists()) {
        const categories = Object.values(categoriesSnapshot.val());
        const exists = categories.some(cat => 
          cat.id !== id && cat.name.toLowerCase() === name.trim().toLowerCase()
        );
        
        if (exists) {
          return res.status(400).json({ 
            success: false,
            message: 'Ya existe una categoría con ese nombre' 
          });
        }
      }

      // Actualizar categoría en todos los productos
      const oldName = currentCategory.name;
      const productsRef = db.ref('inventory/products');
      const productsSnapshot = await productsRef.once('value');

      if (productsSnapshot.exists()) {
        const products = productsSnapshot.val();
        const updates = {};

        Object.entries(products).forEach(([productId, product]) => {
          if (product.category === oldName) {
            updates[`inventory/products/${productId}/category`] = name.trim();
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

    await categoryRef.set(updateData);

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      category: updateData
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};

// DELETE /categories/:id - Eliminar una categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryRef = db.ref(`inventory/categories/${id}`);
    const snapshot = await categoryRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        message: 'Categoría no encontrada' 
      });
    }

    const category = snapshot.val();
    const categoryName = category.name;

    // Verificar si hay productos con esta categoría
    const productsRef = db.ref('inventory/products');
    const productsSnapshot = await productsRef.once('value');

    let productCount = 0;
    if (productsSnapshot.exists()) {
      const products = Object.values(productsSnapshot.val());
      productCount = products.filter(p => p.category === categoryName && p.isActive !== false).length;
    }

    if (productCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `No se puede eliminar la categoría porque tiene ${productCount} producto(s) asociado(s)` 
      });
    }

    await categoryRef.remove();

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      categoryId: id
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
};

// GET /categories/:id/stats - Obtener estadísticas de una categoría
const getCategoryStats = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryRef = db.ref(`inventory/categories/${id}`);
    const snapshot = await categoryRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false,
        message: 'Categoría no encontrada' 
      });
    }

    const category = snapshot.val();
    const categoryName = category.name;

    // Obtener productos de esta categoría
    const productsRef = db.ref('inventory/products');
    const productsSnapshot = await productsRef.once('value');

    let products = [];
    if (productsSnapshot.exists()) {
      const productsData = productsSnapshot.val();
      products = Object.values(productsData).filter(p => 
        p.category === categoryName && p.isActive !== false
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
      category,
      stats,
      message: 'Estadísticas obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de categoría:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener estadísticas de categoría',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};
