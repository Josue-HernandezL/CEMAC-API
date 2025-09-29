const { db } = require('../../firebaseConfig');

/**
 * Controlador de análisis y estadísticas para ventas e inventario
 */
class AnalysisController {
  
  /**
   * Obtener estadísticas completas de ventas
   * GET /analysis/sales
   */
  static async getSalesStatistics(req, res) {
    try {
      const salesRef = db.ref('sales');
      const snapshot = await salesRef.once('value');
      const allSales = snapshot.val() || {};

      // Obtener fechas de referencia
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay()); // Inicio de semana (domingo)
      currentWeekStart.setHours(0, 0, 0, 0);

      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      // Procesar ventas por día de la semana
      const dailyStats = AnalysisController.calculateDailyStats(allSales, currentWeekStart);
      
      // Procesar ventas mensuales del último semestre
      const monthlyStats = AnalysisController.calculateMonthlyStats(allSales, sixMonthsAgo);
      
      // Calcular productos más vendidos
      const topProducts = await AnalysisController.calculateTopProducts(allSales);

      const response = {
        success: true,
        data: {
          daily: dailyStats,
          monthly: monthlyStats,
          topProducts: topProducts
        },
        message: "Estadísticas obtenidas exitosamente"
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error al obtener estadísticas de ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas',
        error: error.message
      });
    }
  }

  /**
   * Obtener análisis completo de inventario
   * GET /analysis/inventory
   */
  static async getInventoryAnalysis(req, res) {
    try {
      const inventoryRef = db.ref('inventory');
      const snapshot = await inventoryRef.once('value');
      const allInventory = snapshot.val() || {};

      // Calcular niveles de stock actuales
      const stockLevels = AnalysisController.calculateStockLevels(allInventory);
      
      // Identificar productos con bajo stock
      const lowStock = AnalysisController.identifyLowStock(allInventory);
      
      // Generar distribución por categorías
      const categoryDistribution = AnalysisController.calculateCategoryDistribution(allInventory);

      const response = {
        success: true,
        data: {
          stockLevels: stockLevels,
          lowStock: lowStock,
          categoryDistribution: categoryDistribution
        },
        message: "Análisis de inventario obtenido exitosamente"
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error al obtener análisis de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener análisis de inventario',
        error: error.message
      });
    }
  }

  /**
   * Calcular niveles actuales de stock para los productos principales
   */
  static calculateStockLevels(allInventory) {
    const products = Object.values(allInventory).filter(product => 
      product.status === 'active' && product.stock !== undefined
    );

    // Ordenar por stock descendente y tomar los primeros productos
    const sortedProducts = products
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 10); // Top 10 productos por stock

    const labels = sortedProducts.map(product => product.name || 'Producto sin nombre');
    const values = sortedProducts.map(product => product.stock || 0);

    return {
      labels: labels,
      values: values
    };
  }

  /**
   * Identificar productos con bajo stock
   */
  static identifyLowStock(allInventory) {
    const lowStockProducts = [];
    
    Object.entries(allInventory).forEach(([productId, product]) => {
      if (product.status === 'active' && product.availability === 'limited') {
        const currentStock = product.stock || 0;
        const minThreshold = product.minStock || 100; // Default threshold

        if (currentStock <= minThreshold) {
          lowStockProducts.push({
            id: productId,
            name: product.name || 'Producto sin nombre',
            currentStock: currentStock,
            minThreshold: minThreshold
          });
        }
      }
    });

    // Ordenar por criticidad (menor stock primero)
    return lowStockProducts.sort((a, b) => 
      (a.currentStock / a.minThreshold) - (b.currentStock / b.minThreshold)
    );
  }

  /**
   * Calcular distribución por categorías
   */
  static calculateCategoryDistribution(allInventory) {
    const categoryCount = {};
    const categoryStock = {};
    let totalProducts = 0;

    Object.values(allInventory).forEach(product => {
      if (product.status === 'active') {
        const category = product.category || 'Sin categoría';
        
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        categoryStock[category] = (categoryStock[category] || 0) + (product.stock || 0);
        totalProducts++;
      }
    });

    // Convertir a porcentajes basado en cantidad de productos
    const distribution = {};
    Object.entries(categoryCount).forEach(([category, count]) => {
      distribution[category] = Math.round((count / totalProducts) * 100);
    });

    return distribution;
  }

  /**
   * Obtener análisis detallado de rotación de inventario
   * GET /analysis/inventory/rotation
   */
  static async getInventoryRotation(req, res) {
    try {
      const inventoryRef = db.ref('inventory');
      const salesRef = db.ref('sales');
      
      const [inventorySnapshot, salesSnapshot] = await Promise.all([
        inventoryRef.once('value'),
        salesRef.once('value')
      ]);

      const allInventory = inventorySnapshot.val() || {};
      const allSales = salesSnapshot.val() || {};

      // Calcular rotación basada en ventas de los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSales = Object.values(allSales).filter(sale => 
        sale.status === 'completada' && 
        sale.timestamp && 
        new Date(sale.timestamp) >= thirtyDaysAgo
      );

      const productSales = {};
      recentSales.forEach(sale => {
        if (sale.products) {
          sale.products.forEach(product => {
            const productId = product.productId;
            productSales[productId] = (productSales[productId] || 0) + (product.quantity || 0);
          });
        }
      });

      const rotationAnalysis = [];
      Object.entries(allInventory).forEach(([productId, product]) => {
        if (product.status === 'active') {
          const currentStock = product.stock || 0;
          const soldQuantity = productSales[productId] || 0;
          const rotationRate = currentStock > 0 ? (soldQuantity / currentStock) * 100 : 0;

          rotationAnalysis.push({
            id: productId,
            name: product.name || 'Producto sin nombre',
            currentStock: currentStock,
            soldLast30Days: soldQuantity,
            rotationRate: Math.round(rotationRate * 100) / 100,
            category: product.category || 'Sin categoría'
          });
        }
      });

      // Ordenar por tasa de rotación descendente
      rotationAnalysis.sort((a, b) => b.rotationRate - a.rotationRate);

      res.status(200).json({
        success: true,
        data: {
          rotationAnalysis: rotationAnalysis.slice(0, 20), // Top 20
          summary: {
            totalProducts: rotationAnalysis.length,
            averageRotation: rotationAnalysis.reduce((sum, item) => sum + item.rotationRate, 0) / rotationAnalysis.length || 0,
            highRotation: rotationAnalysis.filter(item => item.rotationRate > 50).length,
            lowRotation: rotationAnalysis.filter(item => item.rotationRate < 10).length
          }
        },
        message: "Análisis de rotación de inventario obtenido exitosamente"
      });

    } catch (error) {
      console.error('Error al obtener análisis de rotación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener análisis de rotación',
        error: error.message
      });
    }
  }

  /**
   * Calcular estadísticas diarias de la última semana
   */
  static calculateDailyStats(allSales, weekStart) {
    const dailyLabels = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const dailyValues = new Array(7).fill(0);

    Object.values(allSales).forEach(sale => {
      if (sale.status === 'completada' && sale.timestamp) {
        const saleDate = new Date(sale.timestamp);
        const daysSinceWeekStart = Math.floor((saleDate - weekStart) / (1000 * 60 * 60 * 24));
        
        // Si la venta está dentro de la semana actual
        if (daysSinceWeekStart >= 0 && daysSinceWeekStart < 7) {
          const dayIndex = daysSinceWeekStart;
          dailyValues[dayIndex] += sale.total || 0;
        }
      }
    });

    return {
      labels: dailyLabels,
      values: dailyValues.map(value => Math.round(value * 100) / 100) // Redondear a 2 decimales
    };
  }

  /**
   * Calcular estadísticas mensuales del último semestre
   */
  static calculateMonthlyStats(allSales, sixMonthsAgo) {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();
    const monthlyLabels = [];
    const monthlyValues = [];

    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyLabels.push(monthNames[monthDate.getMonth()]);
      monthlyValues.push(0);
    }

    Object.values(allSales).forEach(sale => {
      if (sale.status === 'completada' && sale.timestamp) {
        const saleDate = new Date(sale.timestamp);
        
        if (saleDate >= sixMonthsAgo) {
          const monthIndex = 5 - (now.getMonth() - saleDate.getMonth() + 
            (now.getFullYear() - saleDate.getFullYear()) * 12);
          
          if (monthIndex >= 0 && monthIndex < 6) {
            monthlyValues[monthIndex] += sale.total || 0;
          }
        }
      }
    });

    return {
      labels: monthlyLabels,
      values: monthlyValues.map(value => Math.round(value * 100) / 100)
    };
  }

  /**
   * Calcular productos más vendidos con información detallada
   */
  static async calculateTopProducts(allSales) {
    const productStats = {};
    const inventoryRef = db.ref('inventory');

    // Procesar todas las ventas completadas
    Object.values(allSales).forEach(sale => {
      if (sale.status === 'completada' && sale.products) {
        sale.products.forEach(product => {
          const productId = product.productId;
          
          if (!productStats[productId]) {
            productStats[productId] = {
              id: productId,
              name: product.productName || 'Producto desconocido',
              sales: 0,
              revenue: 0,
              quantity: 0
            };
          }
          
          productStats[productId].sales += 1;
          productStats[productId].quantity += product.quantity || 0;
          productStats[productId].revenue += product.totalPrice || 0;
        });
      }
    });

    // Obtener información actualizada de productos del inventario
    try {
      const inventorySnapshot = await inventoryRef.once('value');
      const inventoryData = inventorySnapshot.val() || {};
      
      // Actualizar nombres de productos con información del inventario
      Object.keys(productStats).forEach(productId => {
        if (inventoryData[productId]) {
          productStats[productId].name = inventoryData[productId].name || productStats[productId].name;
        }
      });
    } catch (error) {
      console.warn('Error al obtener datos de inventario para estadísticas:', error.message);
    }

    // Convertir a array y ordenar por cantidad de ventas
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10) // Top 10 productos
      .map(product => ({
        id: product.id,
        name: product.name,
        sales: product.quantity,
        revenue: Math.round(product.revenue * 100) / 100
      }));

    return topProducts;
  }

  /**
   * Obtener estadísticas por período personalizado
   * GET /analysis/sales/custom
   */
  static async getCustomPeriodStats(req, res) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren las fechas de inicio y fin (startDate, endDate)'
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
      }

      const salesRef = db.ref('sales');
      const snapshot = await salesRef.once('value');
      const allSales = snapshot.val() || {};

      const customStats = AnalysisController.calculateCustomPeriodStats(
        allSales, start, end, groupBy
      );

      res.status(200).json({
        success: true,
        data: customStats,
        message: `Estadísticas del período ${startDate} al ${endDate} obtenidas exitosamente`
      });

    } catch (error) {
      console.error('Error al obtener estadísticas personalizadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Calcular estadísticas para período personalizado
   */
  static calculateCustomPeriodStats(allSales, startDate, endDate, groupBy) {
    const stats = {
      labels: [],
      values: [],
      totalSales: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };

    const periodSales = Object.values(allSales).filter(sale => {
      if (sale.status !== 'completada' || !sale.timestamp) return false;
      const saleDate = new Date(sale.timestamp);
      return saleDate >= startDate && saleDate <= endDate;
    });

    if (periodSales.length === 0) {
      return stats;
    }

    // Agrupar por período especificado
    const grouped = {};
    
    periodSales.forEach(sale => {
      const saleDate = new Date(sale.timestamp);
      let key;
      
      switch (groupBy) {
        case 'month':
          key = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(saleDate);
          weekStart.setDate(saleDate.getDate() - saleDate.getDay());
          key = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        default: // day
          key = saleDate.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) {
        grouped[key] = { count: 0, revenue: 0 };
      }
      
      grouped[key].count += 1;
      grouped[key].revenue += sale.total || 0;
    });

    // Preparar respuesta
    const sortedKeys = Object.keys(grouped).sort();
    stats.labels = sortedKeys;
    stats.values = sortedKeys.map(key => grouped[key].revenue);
    stats.totalSales = periodSales.length;
    stats.totalRevenue = periodSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    stats.averageOrderValue = stats.totalRevenue / stats.totalSales;

    // Redondear valores
    stats.values = stats.values.map(value => Math.round(value * 100) / 100);
    stats.totalRevenue = Math.round(stats.totalRevenue * 100) / 100;
    stats.averageOrderValue = Math.round(stats.averageOrderValue * 100) / 100;

    return stats;
  }

  /**
   * Obtener resumen ejecutivo de ventas
   * GET /analysis/sales/summary
   */
  static async getExecutiveSummary(req, res) {
    try {
      const salesRef = db.ref('sales');
      const snapshot = await salesRef.once('value');
      const allSales = snapshot.val() || {};

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentMonthSales = Object.values(allSales).filter(sale => {
        if (sale.status !== 'completada' || !sale.timestamp) return false;
        const saleDate = new Date(sale.timestamp);
        return saleDate >= startOfMonth;
      });

      const lastMonthSales = Object.values(allSales).filter(sale => {
        if (sale.status !== 'completada' || !sale.timestamp) return false;
        const saleDate = new Date(sale.timestamp);
        return saleDate >= startOfLastMonth && saleDate <= endOfLastMonth;
      });

      const currentMonthRevenue = currentMonthSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const summary = {
        success: true,
        data: {
          currentMonth: {
            sales: currentMonthSales.length,
            revenue: Math.round(currentMonthRevenue * 100) / 100,
            averageOrderValue: currentMonthSales.length > 0 
              ? Math.round((currentMonthRevenue / currentMonthSales.length) * 100) / 100 
              : 0
          },
          lastMonth: {
            sales: lastMonthSales.length,
            revenue: Math.round(lastMonthRevenue * 100) / 100,
            averageOrderValue: lastMonthSales.length > 0 
              ? Math.round((lastMonthRevenue / lastMonthSales.length) * 100) / 100 
              : 0
          },
          growth: {
            revenue: Math.round(revenueGrowth * 100) / 100,
            sales: lastMonthSales.length > 0 
              ? Math.round(((currentMonthSales.length - lastMonthSales.length) / lastMonthSales.length) * 100 * 100) / 100
              : 0
          }
        },
        message: "Resumen ejecutivo obtenido exitosamente"
      };

      res.status(200).json(summary);

    } catch (error) {
      console.error('Error al obtener resumen ejecutivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = AnalysisController;