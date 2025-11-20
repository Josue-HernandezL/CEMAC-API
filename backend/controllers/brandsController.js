const {db} = require('../../firebaseConfig');

// Función auxiliar para generar el ID
const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// GET /brands - Obtener todas las marcas
const getBrands = async (req, res) => {
    try {
        const {search} = req.query;

        const brandsRef = db.ref('inventory/brands');
        const snapshot = await brandsRef.once('value');

        let brands = [];

        if (snapshot.exists()) {
            const brandsData = snapshot.val();
            brands = Object.values(brandsData);
        }

        // Filtrar por búsqueda si se proporciona
        if (search) {
            const searchLower = search.toLowerCase();
            brands = brands.filter(brand =>
                brand.name.toLowerCase().includes(searchLower) ||
                (brand.description && brand.description.toLowerCase().includes(searchLower))
            );
        }

        // Ordenar alfabéticamente
        brands.sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            brands,
            total: brands.length,
            message: `Se encontraron ${brands.length} marca(s)`
        });
    } catch (error) {
        console.error('Error al obtener marcas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener marcas',
            error: error.message
        });
    }
};

// POST /brands - Crear una marca
const createBrand = async (req, res) => {
    try {
        const {name, description} = req.body;
        const userId = req.user.uid;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la marca es requerido'
            });
        }

        // Verificar si ya existe una marca con ese nombre
        const brandsRef = db.ref('inventory/brands');
        const snapshot = await brandsRef.once('value');

        if (snapshot.exists()) {
            const brands = Object.values(snapshot.val());
            const exists = brands.some(brand => 
                brand.name.toLowerCase() === name.trim().toLowerCase()
            );

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una marca con ese nombre'
                });
            }
        }

        const brandId = generateId();
        const brandData = {
            id: brandId,
            name: name.trim(),
            description: description?.trim() || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId
        };

        const brandRef = db.ref(`inventory/brands/${brandId}`);
        await brandRef.set(brandData);

        res.status(201).json({
            success: true,
            brand: brandData,
            message: 'Marca creada exitosamente'
        });
    } catch (error) {
        console.error('Error al crear marca:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear marca',
            error: error.message
        });
    }
};

// PUT /brands/:id - Actualizar una marca
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.uid;

    const brandRef = db.ref(`inventory/brands/${id}`);
    const snapshot = await brandRef.once('value');

    if (!snapshot.exists()) {
        return res.status(404).json({
            success: false,
            message: 'Marca no encontrada'
        });
    }

    const currentBrand = snapshot.val();
    const updateData = {
        ...currentBrand,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
    };

    // Si se actualiza el nombre, verificar que no exista y actualizar productos
    if (name && name.trim() !== '' && name.trim() !== currentBrand.name) {
        // Verificar que no exista otra marca con el mismo nombre
        const brandsRef = db.ref('inventory/brands');
        const brandsSnapshot = await brandsRef.once('value');

        if (brandsSnapshot.exists()) {
            const brands = Object.values(brandsSnapshot.val());
            const exists = brands.some(brand => 
                brand.id !== id && brand.name.toLowerCase() === name.trim().toLowerCase()
            );

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otra marca con ese nombre'
                });
            }
        }

        // Actualizar marca en todos los productos
        const oldName = currentBrand.name;
        const productsRef = db.ref('inventory/products');
        const productsSnapshot = await productsRef.once('value');

        if (productsSnapshot.exists()) {
            const productsData = productsSnapshot.val();
            const updates = {};

            Object.entries(products).forEach(([productId, product]) => {
                if (product.brand === oldName) {
                    updates[`inventory/products/${productId}/brand`] = name.trim();
                }
            });

            if (Object.keys(updates).length > 0) {
                await db.ref().update(updates);
            }
        }

        updateData.name = name.trim();
    }

    if (description !== undefined) {
        updateData.description = description.trim() || null;
    }

    await brandRef.set(updateData);

    res.status(200).json({
        success: true,
        brand: updateData,
        message: 'Marca actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    res.status(500).json({
        success: false,
        message: 'Error al actualizar marca',
        error: error.message
    });
  }
};

// DELETE /brands/:id - Eliminar una marca
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const brandRef = db.ref(`inventory/brands/${id}`);
        const snapshot = await brandRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({
                success: false,
                message: 'Marca no encontrada'
            });
        }

        const brand = snapshot.val();
        const brandName = brand.name;

        // Verificar si hay productos con esta marca
        const productsRef = db.ref('inventory/products');
        const productsSnapshot = await productsRef.once('value');

        let productCount = 0;
        if (productsSnapshot.exists()) {
            const products = Object.values(productsSnapshot.val());
            productCount = products.filter(p => p.brand === brandName && p.isActive !== false).length;
        }

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar la marca. Hay ${productCount} producto(s) asociado(s) a esta marca.`
            });
        }

        await brandRef.remove();

        res.status(200).json({
            success: true,
            message: 'Marca eliminada exitosamente',
            brandId: id
        });
    }   catch (error) {
        console.error('Error al eliminar marca:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar marca',
            error: error.message
        });
    }
};

// GET /brands/:id/stats - Obtener estadísticas de una marca
const getBrandStats = async (req, res) => {
    try {
        const { id } = req.params;

        const brandRef = db.ref(`inventory/brands/${id}`);
        const snapshot = await brandRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({
                success: false,
                message: 'Marca no encontrada'
            });
        }

        const brand = snapshot.val();
        const brandName = brand.name;

        // Contar productos asociados a esta marca
        const productsRef = db.ref('inventory/products');
        const productsSnapshot = await productsRef.once('value');

        let products = [];

        if (productsSnapshot.exists()) {
            const productsData = productsSnapshot.val();
            products = Object.values(productsData).filter(p =>
                p.brand === brandName && p.isActive !== false
            );
        }

        const stats = {
            productCount: products.length,
            activeProducts: products.filter(p => p.isActive === true).length,
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
            stats,
            message: 'Estadísticas de la marca obtenidas exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de la marca:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de la marca',
            error: error.message
        });
    }
};

module.exports = {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandStats
};