# Ejemplo de Integración: Productos del Inventario en Ventas

Este documento muestra cómo el módulo de ventas está completamente integrado con el inventario.

## 🔗 Validaciones de Integración

### 1. Solo Productos del Inventario
```javascript
// Al crear una venta, cada producto debe existir en el inventario
const validateSaleProducts = async (products) => {
  for (const item of products) {
    // Verificar que el producto existe en el inventario
    const productRef = db.ref(`inventory/products/${item.productId}`);
    const productSnapshot = await productRef.once('value');
    
    if (!productSnapshot.exists()) {
      throw new Error(`Producto con ID ${item.productId} no encontrado`);
    }
    
    const product = productSnapshot.val();
    
    // Debe estar activo
    if (product.isActive === false) {
      throw new Error(`Producto ${product.name} no está disponible`);
    }
    
    // Verificar stock si es limitado
    if (product.availability === 'limited' && product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}`);
    }
  }
};
```

### 2. Actualización Automática de Stock
```javascript
// Al confirmar una venta, se actualiza automáticamente el stock
const updateProductStock = async (productId, quantity, userId) => {
  const productRef = db.ref(`inventory/products/${productId}`);
  const product = await productRef.once('value').then(snap => snap.val());
  
  if (product.availability === 'limited') {
    const newStock = product.stock - quantity;
    
    // Actualizar stock del producto
    await productRef.update({
      stock: newStock,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    });

    // Registrar movimiento de stock
    const movement = {
      type: 'salida',
      quantity: quantity,
      reason: 'Venta',
      userId,
      timestamp: new Date().toISOString()
    };
    
    await db.ref(`inventory/stockMovements/${movementId}`).set(movement);
  }
};
```

## 🛒 Flujo de Trabajo Completo

### Paso 1: Buscar Productos Disponibles
```bash
curl -X GET "http://localhost:3000/sales/products/search?search=laptop" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_123",
      "name": "Laptop Gaming ROG",
      "price": 1299.99,
      "promotionalPrice": 1199.99,
      "availability": "limited",
      "stock": 15,
      "suggestedPrice": 1199.99,
      "maxQuantity": 15
    }
  ]
}
```

### Paso 2: Crear Venta con Productos del Inventario

**Opción A: Venta sin IVA (precios incluyen impuestos)**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cliente": "Juan Pérez",
    "vendedor": "María García",
    "descuento": 5,
    "products": [
      {
        "productId": "prod_123",
        "quantity": 2,
        "price": 1199.99
      }
    ]
  }'
```

**Opción B: Venta con IVA del 16%**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cliente": "Juan Pérez",
    "vendedor": "María García", 
    "descuento": 5,
    "iva": 16,
    "products": [
      {
        "productId": "prod_123",
        "quantity": 2,
        "price": 1199.99
      }
    ]
  }'
```

**Lo que sucede internamente:**
1. ✅ Valida que `prod_123` existe en el inventario
2. ✅ Verifica que está activo (`isActive: true`)
3. ✅ Confirma que hay stock suficiente (15 >= 2)
4. ✅ Calcula totales automáticamente
5. ✅ Crea la venta
6. ✅ Actualiza el stock (15 → 13)
7. ✅ Registra el movimiento de stock

**Respuesta Opción A (sin IVA):**
```json
{
  "success": true,
  "sale": {
    "id": "sale_456",
    "cliente": "Juan Pérez",
    "products": [
      {
        "productId": "prod_123",
        "productName": "Laptop Gaming ROG",
        "quantity": 2,
        "unitPrice": 1199.99,
        "totalPrice": 2399.98
      }
    ],
    "subtotal": 2279.98,
    "descuento": 5,
    "discountAmount": 119.99,
    "ivaPercentage": 0,
    "ivaAmount": 0,
    "total": 2279.98,
    "status": "completada"
  }
}
```

**Respuesta Opción B (con IVA del 16%):**
```json
{
  "success": true,
  "sale": {
    "id": "sale_457",
    "cliente": "Juan Pérez",
    "products": [
      {
        "productId": "prod_123",
        "productName": "Laptop Gaming ROG",
        "quantity": 2,
        "unitPrice": 1199.99,
        "totalPrice": 2399.98
      }
    ],
    "subtotal": 2279.98,
    "descuento": 5,
    "discountAmount": 119.99,
    "ivaPercentage": 16,
    "ivaAmount": 364.79,
    "total": 2644.77,
    "status": "completada"
  }
}
```

### Paso 3: Verificar Actualización del Inventario
```bash
curl -X GET http://localhost:3000/inventory/prod_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta (stock actualizado):**
```json
{
  "success": true,
  "product": {
    "id": "prod_123",
    "name": "Laptop Gaming ROG",
    "stock": 13,
    "updatedAt": "2025-09-28T..."
  }
}
```

### Paso 4: Ver Historial de Movimientos
```bash
curl -X GET http://localhost:3000/inventory/prod_123/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "movements": [
    {
      "type": "salida",
      "quantity": 2,
      "reason": "Venta",
      "timestamp": "2025-09-28T...",
      "userId": "user_123"
    }
  ]
}
```

## ⚠️ Casos de Error Comunes

### 1. Producto No Existe
```json
{
  "success": false,
  "message": "Producto con ID prod_999 no encontrado"
}
```

### 2. Producto Inactivo
```json
{
  "success": false,
  "message": "Producto Laptop Antigua no está disponible"
}
```

### 3. Stock Insuficiente
```json
{
  "success": false,
  "message": "Stock insuficiente para Laptop Gaming ROG. Stock disponible: 1"
}
```

## 🎯 Beneficios de la Integración

1. **Consistencia de Datos**: Los productos de venta siempre están sincronizados con el inventario
2. **Control de Stock**: Previene sobreventa automáticamente
3. **Trazabilidad**: Cada venta genera movimientos de stock registrados
4. **Validación Automática**: No se puede vender productos inexistentes o inactivos
5. **Información Actualizada**: Los precios y disponibilidad siempre están al día

## 🔧 Implementación en Frontend

### Búsqueda de Productos
```javascript
// Buscar productos disponibles para la venta
const searchProducts = async (searchTerm) => {
  const response = await fetch(`/sales/products/search?search=${searchTerm}&limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.products; // Solo productos disponibles para venta
};
```

### Validación antes de Agregar
```javascript
// Verificar disponibilidad antes de agregar al carrito
const addToSaleCart = (product, quantity) => {
  if (product.availability === 'limited' && quantity > product.maxQuantity) {
    alert(`Solo hay ${product.maxQuantity} unidades disponibles`);
    return false;
  }
  
  // Agregar producto al carrito de venta
  return true;
};
```

### Creación de Venta
```javascript
// Crear venta con productos validados
const createSale = async (saleData) => {
  const response = await fetch('/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(saleData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Venta creada, stock actualizado automáticamente
    alert('Venta registrada exitosamente');
  } else {
    // Error de validación (producto no disponible, etc.)
    alert(result.message);
  }
};
```

## 📊 Resumen de Endpoints para Integración

| Endpoint | Propósito | Retorna |
|----------|-----------|---------|
| `GET /sales/products/search` | Buscar productos disponibles | Solo productos vendibles |
| `POST /sales` | Crear venta | Venta + Stock actualizado |
| `GET /inventory/:id` | Verificar stock actual | Producto con stock real |
| `GET /inventory/:id/history` | Historial de movimientos | Movimientos incluyendo ventas |

Esta integración garantiza que tu sistema de ventas esté siempre sincronizado con el inventario real.