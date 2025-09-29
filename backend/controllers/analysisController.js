const { db } = require('../../firebaseConfig');

/**
 * Controlador de análisis y estadísticas de ventas
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
