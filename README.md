# CEMAC API - Sistema Completo

API REST con autenticación Firebase y sistema de gestión de inventario.

## 🚀 Características

### Sistema de Autenticación
- ✅ Autenticación con Firebase Auth
- ✅ Solo administradores pueden registrar usuarios
- ✅ Gestión de sesiones con tokens Firebase
- ✅ Recuperación de contraseña
- ✅ Middleware de autorización por roles

### Gestión Administrativa de Usuarios
- ✅ **Listado completo de usuarios** - Visualización de todos los usuarios del sistema
- ✅ **Activación/Desactivación** - Control de estado de cuentas de usuario
- ✅ **Gestión de roles** - Cambio de permisos (admin/user) 
- ✅ **Actualización de perfiles** - Modificación de datos personales por admin
- ✅ **Middleware de seguridad especializado** - Protección avanzada de endpoints críticos
- ✅ **Validaciones anti-auto-modificación** - Prevención de que admins se modifiquen a sí mismos

### Sistema de Inventario
- ✅ CRUD completo de productos
- ✅ Gestión de stock con historial de movimientos
- ✅ Subida de imágenes a Cloudinary
- ✅ Filtros avanzados y búsqueda
- ✅ Paginación y ordenamiento
- ✅ Categorización de productos
- ✅ Disponibilidad limitada e ilimitada

### Sistema de Ventas
- ✅ CRUD completo de ventas
- ✅ Registro de ventas con múltiples productos
- ✅ Cálculo automático de totales, IVA y descuentos
- ✅ Actualización automática de stock del inventario
- ✅ Filtros por fecha, cliente, vendedor
- ✅ Estados de venta (pendiente, completada, cancelada, devuelta)
- ✅ Reportes y estadísticas de ventas
- ✅ Integración completa con el sistema de inventario

### Sistema de Clientes
- ✅ Registro básico de clientes (nombre, apellido, fecha de nacimiento)
- ✅ Gestión de información personal y notas
- ✅ Seguimiento completo del historial de compras
- ✅ Búsqueda avanzada por nombre
- ✅ Estadísticas automáticas por cliente (total gastado, compras, etc.)
- ✅ Integración automática con el sistema de ventas
- ✅ Paginación y filtros en listados

### Tecnologías
- ✅ Node.js + Express.js
- ✅ Firebase Realtime Database
- ✅ Cloudinary para imágenes
- ✅ Multer para subida de archivos
- ✅ Jest + Supertest para testing
- ✅ Endpoints RESTful

## 🛠️ Instalación

### 1. Clonar y configurar

```bash
# Clonar repositorio
git clone [URL_DEL_REPOSITORIO]
cd CEMAC-API

# Instalar dependencias
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración del administrador inicial
ADMIN_EMAIL=tu-email@gmail.com
ADMIN_PASSWORD=tu-contraseña-segura
ADMIN_FIRST_NAME=Administrador
ADMIN_LAST_NAME=CEMAC

# Firebase
FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com

# JWT Secrets
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
SESSION_SECRET=tu_session_secret_super_seguro_aqui

# Configuración de CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Configuración de logs
LOG_LEVEL=info

# Cloudinary (para imágenes de productos)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 3. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Descarga el archivo `serviceAccountKey.json` y colócalo en la raíz del proyecto
4. Habilita **Realtime Database**:
   - Ve a "Realtime Database" en el menú lateral
   - Crea una base de datos
   - Copia la URL de tu base de datos a `FIREBASE_DATABASE_URL`

### 4. Configurar Cloudinary

1. Ve a [Cloudinary Console](https://cloudinary.com/console)
2. Crea una cuenta o inicia sesión
3. Copia Cloud Name, API Key y API Secret a tu archivo `.env`

### 5. Ejecutar configuración inicial

```bash
# Crear estructura de BD y usuario administrador
pnpm run setup
```

### 6. Iniciar servidor

```bash
# Desarrollo
pnpm run dev

# Producción
pnpm start
```

## 📋 Endpoints Disponibles

### 🔐 Autenticación

#### Públicos (no requieren autenticación)
- `POST /auth/login` - Iniciar sesión
- `POST /auth/recover` - Recuperar contraseña

#### Protegidos (requieren token)
- `GET /auth/profile` - Obtener perfil del usuario
- `PUT /auth/profile` - Actualizar perfil del usuario
- `GET /auth/verify` - Verificar token válido

#### Solo Administradores
- `POST /auth/register` - Registrar nuevo usuario
- `GET /auth/users` - Listar todos los usuarios
- `PUT /auth/users/{userId}/status` - Activar/desactivar usuario
- `PUT /auth/users/{userId}/role` - Cambiar rol de usuario
- `PUT /auth/users/{userId}/profile` - Actualizar perfil de usuario

### 📦 Inventario

#### Lectura (usuarios y administradores)
- `GET /inventory` - Listar productos con filtros
- `GET /inventory/:id` - Obtener producto específico
- `GET /inventory/:id/history` - Historial de movimientos de stock

#### Escritura (solo administradores)
- `POST /inventory` - Crear nuevo producto
- `PUT /inventory/:id` - Actualizar producto
- `DELETE /inventory/:id` - Eliminar producto (soft delete)
- `POST /inventory/:id/stock` - Actualizar stock (entrada/salida)

### 💰 Ventas

#### Todos los usuarios autenticados
- `POST /sales` - Crear nueva venta
- `GET /sales` - Listar ventas con filtros
- `GET /sales/:id` - Obtener venta específica
- `PUT /sales/:id/status` - Actualizar estado de venta
- `GET /sales/reports/summary` - Generar reportes de ventas
- `GET /sales/products/search` - Buscar productos disponibles para venta

### 👥 Clientes

#### Todos los usuarios autenticados
- `POST /customers` - Registrar nuevo cliente
- `GET /customers` - Listar clientes con filtros y paginación
- `GET /customers/search` - Búsqueda rápida de clientes
- `GET /customers/:id` - Obtener cliente específico con historial de compras
- `PUT /customers/:id` - Actualizar información del cliente

## 📡 Uso de la API

### Headers requeridos

Para rutas protegidas:
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json
```

Para subida de archivos:
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: multipart/form-data
```

### 🔐 Ejemplos de Autenticación

#### Login (POST /auth/login)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cemac.com",
    "password": "admin123456"
  }'
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "firebase_custom_token_aqui",
  "user": {
    "uid": "user_uid",
    "email": "admin@cemac.com",
    "role": "admin",
    "isActive": true
  }
}
```

### Registrar Usuario (POST /auth/register)

**⚠️ Solo administradores**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "email": "usuario@cemac.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "user"
  }'
```

### Listar Todos los Usuarios (GET /auth/users)

**⚠️ Solo administradores**

```bash
curl -X GET http://localhost:3000/auth/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Respuesta:**
```json
{
  "success": true,
  "users": [
    {
      "uid": "user123abc",
      "email": "usuario@cemac.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-01-20T15:45:00Z",
      "emailVerified": false
    },
    {
      "uid": "admin456def",
      "email": "admin@cemac.com",
      "firstName": "Administrador",
      "lastName": "CEMAC",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T08:00:00Z",
      "lastLogin": "2024-01-28T14:30:00Z",
      "emailVerified": true
    }
  ],
  "message": "Usuarios obtenidos exitosamente"
}
```

**Descripción:**
- Solo usuarios con `role: 'admin'` pueden acceder a este endpoint
- Retorna todos los usuarios registrados en el sistema
- Incluye información completa del perfil de cada usuario
- Los usuarios se ordenan por fecha de creación (más recientes primero)
- Combina datos de Firebase Auth y Realtime Database

**Campos incluidos por usuario:**
- `uid` - ID único del usuario
- `email` - Dirección de correo electrónico
- `firstName` - Nombre del usuario
- `lastName` - Apellido del usuario
- `role` - Rol del usuario (`admin` o `user`)
- `isActive` - Estado activo del usuario
- `createdAt` - Fecha de creación de la cuenta
- `lastLogin` - Fecha del último inicio de sesión
- `emailVerified` - Estado de verificación del email

### Activar/Desactivar Usuario (PUT /auth/users/{userId}/status)

**⚠️ Solo administradores**

```bash
# Desactivar usuario
curl -X PUT http://localhost:3000/auth/users/{userId}/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'

# Activar usuario
curl -X PUT http://localhost:3000/auth/users/{userId}/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": true
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente",
  "user": {
    "uid": "user123abc",
    "email": "usuario@cemac.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "user",
    "isActive": false
  }
}
```

**Descripción:**
- Solo usuarios con `role: 'admin'` pueden cambiar el estado de otros usuarios
- Actualiza el campo `isActive` en la base de datos y Firebase Auth
- Un administrador **NO puede desactivarse a sí mismo** (protección)
- Usuarios inactivos no pueden hacer login
- Se registra información de auditoría (quién y cuándo cambió el estado)

**Validaciones:**
- ✅ Solo administradores pueden acceder
- ✅ El `userId` debe existir en la base de datos
- ✅ El campo `isActive` debe ser un booleano
- ✅ Un admin no puede desactivarse a sí mismo
- ✅ Se actualiza tanto la DB como Firebase Auth

**Campos requeridos:**
- `isActive` - Estado del usuario (true = activo, false = inactivo)

### Cambiar Rol de Usuario (PUT /auth/users/{userId}/role)

**⚠️ Solo administradores**

```bash
# Cambiar rol a administrador
curl -X PUT http://localhost:3000/auth/users/{userId}/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'

# Cambiar rol a usuario normal
curl -X PUT http://localhost:3000/auth/users/{userId}/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "user": {
    "uid": "user123abc",
    "email": "usuario@cemac.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "admin",
    "isActive": true
  }
}
```

**Descripción:**
- Solo usuarios con `role: 'admin'` pueden cambiar roles de otros usuarios
- Actualiza el campo `role` en la base de datos y Firebase Auth custom claims
- Un administrador **NO puede quitarse sus propios privilegios** (protección)
- Se registra información de auditoría completa (quién, cuándo, rol anterior)
- Los roles válidos son: `admin` y `user`

**Validaciones:**
- ✅ Solo administradores pueden acceder
- ✅ El `userId` debe existir en la base de datos
- ✅ El `role` debe ser "admin" o "user"
- ✅ Un admin no puede quitarse sus propios privilegios
- ✅ No se puede cambiar al mismo rol que ya tiene
- ✅ Se actualiza tanto la DB como Firebase Auth custom claims

**Campos requeridos:**
- `role` - Nuevo rol del usuario ("admin" o "user")

#### 📝 Actualizar Perfil de Usuario (PUT /auth/users/{userId}/profile)

**Descripción:** Permite a un administrador actualizar los datos del perfil de cualquier usuario (solo firstName y lastName).

```bash
curl -X PUT http://localhost:3000/auth/users/{userId}/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nuevo Nombre",
    "lastName": "Nuevo Apellido"
  }'
```

**Respuesta exitosa (200):**
```json
{
  "message": "Perfil del usuario actualizado exitosamente",
  "userId": "ABC123XYZ789",
  "updatedFields": {
    "firstName": "Nuevo Nombre",
    "lastName": "Nuevo Apellido"
  }
}
```

**Validaciones de seguridad:**
- ✅ Solo administradores pueden usar este endpoint
- ✅ El admin no puede modificar su propio perfil
- ✅ Validación de campos permitidos (firstName, lastName)
- ✅ El usuario objetivo debe existir
- ✅ Se actualiza tanto la DB como Firebase Auth displayName

**Campos permitidos:**
- `firstName` - Nuevo nombre del usuario
- `lastName` - Nuevo apellido del usuario

### Obtener Perfil (GET /auth/profile)

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Recuperar Contraseña (POST /auth/recover)

```bash
curl -X POST http://localhost:3000/auth/recover \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@cemac.com"
  }'
```

### 📦 Ejemplos de Inventario

#### Listar Productos (GET /inventory)

```bash
# Listar todos los productos
curl -X GET http://localhost:3000/inventory \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Con filtros
curl -X GET "http://localhost:3000/inventory?search=ejemplo&category=electronics&availability=limited&minPrice=10&maxPrice=100&page=1&limit=10&sortBy=price&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Parámetros de consulta disponibles:**
- `search` - Buscar en nombre y descripción
- `category` - Filtrar por categoría
- `availability` - `limited`, `unlimited`, `out-of-stock`
- `minPrice` / `maxPrice` - Rango de precios
- `page` / `limit` - Paginación
- `sortBy` - `name`, `price`, `createdAt`, `stock`
- `sortOrder` - `asc`, `desc`

**Respuesta:**
```json
{
  "success": true,
  "products": [
    {
      "id": "1234567890abcdef",
      "name": "Producto Ejemplo",
      "description": "Descripción del producto",
      "price": 99.99,
      "promotionalPrice": 79.99,
      "availability": "limited",
      "category": "electronics",
      "stock": 50,
      "imageUrl": "https://res.cloudinary.com/...",
      "isActive": true,
      "createdAt": "2025-09-24T...",
      "updatedAt": "2025-09-24T...",
      "createdBy": "user_uid"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 47,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10,
    "offset": 0
  },
  "filters": {
    "search": "ejemplo",
    "category": "electronics",
    "sortBy": "price",
    "sortOrder": "asc"
  },
  "message": "Se encontraron 47 productos"
}
```

### Crear Producto (POST /inventory)

**⚠️ Solo administradores**

```bash
# Sin imagen
curl -X POST http://localhost:3000/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Nuevo Producto",
    "description": "Descripción detallada del producto",
    "price": 199.99,
    "promotionalPrice": 149.99,
    "availability": "limited",
    "category": "electronics",
    "stock": 25
  }'

# Con imagen (usar multipart/form-data)
curl -X POST http://localhost:3000/inventory \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Producto con Imagen" \
  -F "description=Producto con imagen adjunta" \
  -F "price=299.99" \
  -F "availability=limited" \
  -F "stock=10" \
  -F "category=gadgets" \
  -F "image=@/ruta/a/imagen.jpg"
```

**Campos requeridos:**
- `name` - Nombre del producto
- `description` - Descripción
- `price` - Precio base
- `availability` - `limited` o `unlimited`

**Campos opcionales:**
- `promotionalPrice` - Precio promocional
- `category` - Categoría del producto
- `stock` - Stock inicial (requerido si availability es "limited")
- `image` - Archivo de imagen (máximo 5MB)

### Obtener Producto (GET /inventory/:id)

```bash
curl -X GET http://localhost:3000/inventory/1234567890abcdef \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Actualizar Producto (PUT /inventory/:id)

**⚠️ Solo administradores**

```bash
curl -X PUT http://localhost:3000/inventory/1234567890abcdef \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Producto Actualizado",
    "price": 249.99,
    "promotionalPrice": null
  }'
```

### Eliminar Producto (DELETE /inventory/:id)

**⚠️ Solo administradores - Soft Delete**

```bash
curl -X DELETE http://localhost:3000/inventory/1234567890abcdef \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Actualizar Stock (POST /inventory/:id/stock)

**⚠️ Solo administradores**

```bash
# Entrada de stock
curl -X POST http://localhost:3000/inventory/1234567890abcdef/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "entrada",
    "quantity": 50,
    "reason": "Reposición de inventario"
  }'

# Salida de stock
curl -X POST http://localhost:3000/inventory/1234567890abcdef/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "salida",
    "quantity": 10,
    "reason": "Venta directa"
  }'
```

**Campos requeridos:**
- `type` - `entrada` o `salida`
- `quantity` - Cantidad (número positivo)
- `reason` - Motivo del movimiento

### Historial de Stock (GET /inventory/:id/history)

```bash
curl -X GET "http://localhost:3000/inventory/1234567890abcdef/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "movements": [
    {
      "id": "movement_id",
      "productId": "1234567890abcdef",
      "type": "entrada",
      "quantity": 50,
      "reason": "Stock inicial",
      "userId": "admin_uid",
      "timestamp": "2025-09-24T17:32:18.888Z",
      "date": "24/9/2025"
    }
  ],
  "stats": {
    "totalMovements": 3,
    "totalEntradas": 75,
    "totalSalidas": 15
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalMovements": 3,
    "hasNextPage": false,
    "hasPrevPage": false,
    "limit": 10,
    "offset": 0
  },
  "message": "Historial obtenido exitosamente"
}
```

### � Ejemplos de Gestión de Clientes

#### Registrar Nuevo Cliente (POST /customers)

```bash
# Cliente con información completa
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "firstName": "María",
    "lastName": "González",
    "birthDate": "1985-03-15",
    "notes": "Cliente frecuente, prefiere productos de calidad"
  }'

# Cliente con datos mínimos
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "firstName": "Carlos",
    "lastName": "Ruiz"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Cliente registrado exitosamente",
  "data": {
    "id": "customer_1699123456789_abc123def",
    "firstName": "María",
    "lastName": "González",
    "fullName": "María González",
    "birthDate": "1985-03-15",
    "notes": "Cliente frecuente, prefiere productos de calidad",
    "totalPurchases": 0,
    "totalSpent": 0,
    "lastPurchaseDate": null,
    "isActive": true,
    "createdAt": "2025-11-10T...",
    "createdBy": "user_uid",
    "updatedAt": "2025-11-10T..."
  }
}
```

**Campos requeridos:**
- `firstName` - Nombre del cliente
- `lastName` - Apellido del cliente

**Campos opcionales:**
- `birthDate` - Fecha de nacimiento (formato: YYYY-MM-DD)
- `notes` - Notas adicionales sobre el cliente

#### Listar Clientes (GET /customers)

```bash
# Listar todos los clientes
curl -X GET http://localhost:3000/customers \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Con filtros y paginación
curl -X GET "http://localhost:3000/customers?search=María&page=1&limit=10&sortBy=totalSpent&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Parámetros de consulta:**
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10, máx: 50)
- `search` - Buscar en nombre completo y notas
- `sortBy` - Ordenar por: `createdAt`, `totalSpent`, `totalPurchases`, `fullName`
- `sortOrder` - Orden: `asc`, `desc`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "customer_1699123456789_abc123def",
        "firstName": "María",
        "lastName": "González",
        "fullName": "María González",
        "birthDate": "1985-03-15",
        "notes": "Cliente frecuente, prefiere productos de calidad",
        "totalPurchases": 5,
        "totalSpent": 250.75,
        "lastPurchaseDate": "2025-11-08T...",
        "isActive": true,
        "createdAt": "2025-10-15T...",
        "updatedAt": "2025-11-08T..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCustomers": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10,
      "offset": 0
    },
    "stats": {
      "totalCustomers": 25,
      "activeCustomers": 25,
      "totalSpent": 5420.50,
      "averageSpent": 216.82
    }
  },
  "message": "Se encontraron 25 clientes"
}
```

#### Obtener Cliente Específico (GET /customers/:id)

```bash
curl -X GET http://localhost:3000/customers/customer_1699123456789_abc123def \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "customer_1699123456789_abc123def",
      "firstName": "María",
      "lastName": "González",
      "fullName": "María González",
      "birthDate": "1985-03-15",
      "notes": "Cliente frecuente, prefiere productos de calidad",
      "totalPurchases": 5,
      "totalSpent": 250.75,
      "lastPurchaseDate": "2025-11-08T...",
      "isActive": true,
      "createdAt": "2025-10-15T...",
      "updatedAt": "2025-11-08T..."
    },
    "purchaseHistory": [
      {
        "saleId": "sale_1699456789012_xyz789",
        "date": "8/11/2025",
        "total": 85.50,
        "status": "completada",
        "products": 3,
        "paymentMethod": "tarjeta"
      },
      {
        "saleId": "sale_1699123456789_abc456",
        "date": "5/11/2025",
        "total": 42.25,
        "status": "completada",
        "products": 2,
        "paymentMethod": "efectivo"
      }
    ],
    "summary": {
      "totalOrders": 5,
      "completedOrders": 5,
      "averageOrderValue": 50.15,
      "membershipDays": 26,
      "daysSinceLastPurchase": 2
    }
  },
  "message": "Información del cliente obtenida exitosamente"
}
```

#### Búsqueda Rápida de Clientes (GET /customers/search)

```bash
# Búsqueda básica
curl -X GET "http://localhost:3000/customers/search?q=María&limit=5" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Búsqueda por apellido
curl -X GET "http://localhost:3000/customers/search?q=González" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "customer_1699123456789_abc123def",
      "fullName": "María González",
      "firstName": "María",
      "lastName": "González",
      "totalPurchases": 5,
      "totalSpent": 250.75,
      "lastPurchaseDate": "2025-11-08T..."
    }
  ],
  "message": "Búsqueda completada - 1 resultado(s) encontrado(s)"
}
```

#### Actualizar Cliente (PUT /customers/:id)

```bash
curl -X PUT http://localhost:3000/customers/customer_1699123456789_abc123def \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "firstName": "María Carmen",
    "notes": "Cliente VIP - ofrecer descuentos especiales"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cliente actualizado exitosamente",
  "data": {
    "id": "customer_1699123456789_abc123def",
    "firstName": "María Carmen",
    "lastName": "González",
    "fullName": "María Carmen González",
    "birthDate": "1985-03-15",
    "notes": "Cliente VIP - ofrecer descuentos especiales",
    "totalPurchases": 5,
    "totalSpent": 250.75,
    "lastPurchaseDate": "2025-11-08T...",
    "isActive": true,
    "createdAt": "2025-10-15T...",
    "updatedAt": "2025-11-10T..."
  }
}
```

#### Integración Cliente-Ventas

```bash
# Crear venta asociada a un cliente
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "customerId": "customer_1699123456789_abc123def",
    "products": [
      {
        "productId": "product_123",
        "quantity": 2,
        "price": 25.00
      }
    ],
    "paymentMethod": "tarjeta",
    "notes": "Venta asociada al cliente María González"
  }'
```

**🎯 Características de la Integración:**
- ✅ **Asociación automática** del nombre del cliente en la venta
- ✅ **Actualización automática** de estadísticas del cliente (totalPurchases, totalSpent, lastPurchaseDate)
- ✅ **Historial completo** de compras disponible en el endpoint del cliente
- ✅ **Validación** de que el cliente existe y está activo antes de crear la venta

### Validaciones del Sistema de Clientes

#### Errores Comunes

**1. Campos requeridos faltantes:**
```json
{
  "success": false,
  "message": "Nombre y apellido son obligatorios"
}
```

**2. Formato de fecha inválido:**
```json
{
  "success": false,
  "message": "Formato de fecha inválido. Use YYYY-MM-DD"
}
```

**3. Cliente no encontrado:**
```json
{
  "success": false,
  "message": "Cliente no encontrado"
}
```

**4. Cliente inactivo en venta:**
```json
{
  "success": false,
  "message": "Cliente no encontrado o inactivo"
}
```

### �💰 Ejemplos de Ventas

#### Crear Nueva Venta (POST /sales)

**Ejemplo 1: Venta sin IVA (precios ya incluyen impuestos)**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "cliente": "Juan Pérez",
    "vendedor": "María García",
    "descuento": 10,
    "products": [
      {
        "productId": "1234567890abcdef",
        "quantity": 2,
        "price": 99.99
      },
      {
        "productId": "0987654321fedcba",
        "quantity": 1,
        "price": 149.99
      }
    ],
    "paymentMethod": "tarjeta",
    "notes": "Cliente frecuente - aplicar descuento especial"
  }'
```

**Ejemplo 2: Venta con IVA del 16%**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "cliente": "María González",
    "vendedor": "Carlos López",
    "descuento": 5,
    "iva": 16,
    "products": [
      {
        "productId": "1234567890abcdef",
        "quantity": 1,
        "price": 200.00
      }
    ],
    "paymentMethod": "efectivo",
    "notes": "Venta con IVA del 16%"
  }'
```

**Ejemplo 3: Venta sin descuento y sin IVA**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "cliente": "Ana Rodríguez",
    "vendedor": "Luis Martín",
    "products": [
      {
        "productId": "1234567890abcdef",
        "quantity": 3,
        "price": 50.00
      }
    ],
    "paymentMethod": "transferencia"
  }'
```

**Respuesta del Ejemplo 1 (sin IVA):**
```json
{
  "success": true,
  "sale": {
    "id": "sale_1234567890",
    "cliente": "Juan Pérez",
    "vendedor": "María García",
    "products": [
      {
        "productId": "1234567890abcdef",
        "productName": "Producto Ejemplo",
        "quantity": 2,
        "unitPrice": 99.99,
        "totalPrice": 199.98,
        "availability": "limited"
      },
      {
        "productId": "0987654321fedcba",
        "productName": "Otro Producto",
        "quantity": 1,
        "unitPrice": 149.99,
        "totalPrice": 149.99,
        "availability": "unlimited"
      }
    ],
    "subtotal": 314.97,
    "descuento": 10,
    "discountAmount": 34.99,
    "ivaPercentage": 0,
    "ivaAmount": 0,
    "total": 314.97,
    "paymentMethod": "tarjeta",
    "notes": "Cliente frecuente - aplicar descuento especial",
    "status": "completada",
    "createdAt": "2025-09-28T...",
    "createdBy": "user_uid",
    "date": "28/9/2025",
    "timestamp": 1727563200000
  },
  "message": "Venta registrada exitosamente"
}
```

**Respuesta del Ejemplo 2 (con IVA del 16%):**
```json
{
  "success": true,
  "sale": {
    "id": "sale_2345678901",
    "cliente": "María González",
    "vendedor": "Carlos López",
    "products": [
      {
        "productId": "1234567890abcdef",
        "productName": "Producto Ejemplo",
        "quantity": 1,
        "unitPrice": 200.00,
        "totalPrice": 200.00,
        "availability": "limited"
      }
    ],
    "subtotal": 190.00,
    "descuento": 5,
    "discountAmount": 10.00,
    "ivaPercentage": 16,
    "ivaAmount": 30.40,
    "total": 220.40,
    "paymentMethod": "efectivo",
    "notes": "Venta con IVA del 16%",
    "status": "completada",
    "createdAt": "2025-09-28T...",
    "createdBy": "user_uid",
    "date": "28/9/2025",
    "timestamp": 1727563200000
  },
  "message": "Venta registrada exitosamente"
}
```

**Campos requeridos:**
- `products` - Array de productos (mínimo 1)
  - `productId` - ID del producto del inventario
  - `quantity` - Cantidad a vender
  - `price` - Precio unitario

**Campos opcionales:**
- `cliente` - Nombre del cliente (default: "Cliente General")
- `vendedor` - Nombre del vendedor (default: "No asignado")
- `descuento` - Porcentaje de descuento (0-100, default: 0)
- `iva` - Porcentaje de IVA a aplicar (0-100, default: 0)
- `paymentMethod` - Método de pago (default: "efectivo")
- `notes` - Notas adicionales

**💡 Importante sobre IVA y Descuentos:**
- **Sin IVA (default)**: Si no envías el campo `iva` o lo envías como `0`, se asume que los precios ya incluyen todos los impuestos
- **Con IVA**: Si envías `iva: 16`, se aplicará 16% de IVA sobre el subtotal después del descuento
- **Descuentos**: Se aplican antes del IVA. El cálculo es: `(Total - Descuento) + IVA`

**Ejemplos de cálculo:**
```
Producto: $100.00 x 1
Descuento: 10%
IVA: 16%

Sin IVA: $100.00 - $10.00 = $90.00
Con IVA: ($100.00 - $10.00) + ($90.00 * 0.16) = $90.00 + $14.40 = $104.40
```

**📋 Casos de Uso Comunes:**

1. **Negocio con precios ya con impuestos incluidos** (restaurantes, retail)
   ```json
   {
     "cliente": "Cliente",
     "products": [{"productId": "abc", "quantity": 1, "price": 100.00}],
     "descuento": 5
     // No enviar campo "iva" - total será $95.00
   }
   ```

2. **Negocio B2B que maneja IVA por separado**
   ```json
   {
     "cliente": "Empresa XYZ",
     "products": [{"productId": "abc", "quantity": 1, "price": 100.00}],
     "descuento": 0,
     "iva": 16
     // Total será $116.00 (100 + 16% IVA)
   }
   ```

3. **Venta con descuento e IVA**
   ```json
   {
     "cliente": "Cliente VIP",
     "products": [{"productId": "abc", "quantity": 1, "price": 100.00}],
     "descuento": 10,
     "iva": 16
     // Total será $104.40 ((100 - 10%) + 16% IVA sobre subtotal)
   }
   ```

#### Listar Ventas (GET /sales)

```bash
# Listar todas las ventas
curl -X GET http://localhost:3000/sales \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Con filtros
curl -X GET "http://localhost:3000/sales?startDate=2025-09-01&endDate=2025-09-30&vendedor=María&page=1&limit=10&sortBy=total&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Parámetros de consulta disponibles:**
- `page` / `limit` - Paginación
- `startDate` / `endDate` - Filtro por rango de fechas (YYYY-MM-DD)
- `vendedor` - Filtrar por nombre del vendedor
- `cliente` - Filtrar por nombre del cliente
- `status` - Filtrar por estado (pendiente, completada, cancelada, devuelta)
- `sortBy` - Ordenar por campo (createdAt, total, cliente, vendedor)
- `sortOrder` - Orden (asc, desc)

**Respuesta:**
```json
{
  "success": true,
  "sales": [
    {
      "id": "sale_1234567890",
      "cliente": "Juan Pérez",
      "vendedor": "María García",
      "products": [...],
      "subtotal": 314.97,
      "total": 324.78,
      "status": "completada",
      "createdAt": "2025-09-28T...",
      "date": "28/9/2025"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalSales": 47,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "statistics": {
    "totalRevenue": 15248.30,
    "averageSale": 324.22,
    "totalSales": 47
  },
  "message": "Se encontraron 47 ventas"
}
```

#### Obtener Venta Específica (GET /sales/:id)

```bash
curl -X GET http://localhost:3000/sales/sale_1234567890 \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

#### Actualizar Estado de Venta (PUT /sales/:id/status)

```bash
curl -X PUT http://localhost:3000/sales/sale_1234567890/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "status": "cancelada"
  }'
```

**Estados válidos:**
- `pendiente` - Venta pendiente de completar
- `completada` - Venta finalizada exitosamente
- `cancelada` - Venta cancelada
- `devuelta` - Venta devuelta

#### Buscar Productos Disponibles para Venta (GET /sales/products/search)

**Descripción:** Busca productos del inventario que están disponibles para la venta. Solo retorna productos activos y con stock disponible.

```bash
# Buscar todos los productos disponibles
curl -X GET http://localhost:3000/sales/products/search \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Buscar productos con filtro de texto
curl -X GET "http://localhost:3000/sales/products/search?search=laptop&limit=10" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Parámetros de consulta:**
- `search` - Buscar en nombre, descripción o categoría
- `limit` - Número máximo de resultados (default: 10)
- `includeStock` - Incluir información de stock (default: true)

**Respuesta:**
```json
{
  "success": true,
  "products": [
    {
      "id": "1234567890abcdef",
      "name": "Laptop Gaming",
      "description": "Laptop para gaming de alta gama",
      "price": 1299.99,
      "promotionalPrice": 1199.99,
      "category": "electronics",
      "imageUrl": "https://res.cloudinary.com/...",
      "availability": "limited",
      "stock": 15,
      "availableForSale": true,
      "suggestedPrice": 1199.99,
      "maxQuantity": 15
    },
    {
      "id": "0987654321fedcba",
      "name": "Mouse Inalámbrico",
      "description": "Mouse inalámbrico ergonómico",
      "price": 29.99,
      "promotionalPrice": null,
      "category": "electronics",
      "imageUrl": null,
      "availability": "unlimited",
      "stock": null,
      "availableForSale": true,
      "suggestedPrice": 29.99,
      "maxQuantity": 999
    }
  ],
  "totalFound": 2,
  "searchTerm": "laptop",
  "message": "Se encontraron 2 productos disponibles para venta"
}
```

**Características:**
- ✅ Solo productos activos (`isActive: true`)
- ✅ Solo productos con stock disponible (si tienen stock limitado)
- ✅ Precio sugerido (promocional si existe, o precio regular)
- ✅ Cantidad máxima disponible para venta
- ✅ Información completa para mostrar en el frontend

#### Generar Reporte de Ventas (GET /sales/reports/summary)

```bash
# Reporte general
curl -X GET http://localhost:3000/sales/reports/summary \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Reporte con filtros
curl -X GET "http://localhost:3000/sales/reports/summary?startDate=2025-09-01&endDate=2025-09-30&vendedor=María" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "report": {
    "summary": {
      "totalRevenue": 15248.30,
      "totalSales": 47,
      "averageSale": 324.22,
      "period": {
        "startDate": "2025-09-01",
        "endDate": "2025-09-30"
      }
    },
    "topProducts": [
      {
        "productId": "1234567890abcdef",
        "productName": "Producto Más Vendido",
        "totalQuantity": 125,
        "totalRevenue": 12495.0
      }
    ],
    "salesByVendedor": [
      {
        "vendedor": "María García",
        "totalSales": 23,
        "totalRevenue": 7420.50
      },
      {
        "vendedor": "Carlos López",
        "totalSales": 18,
        "totalRevenue": 5827.80
      }
    ]
  },
  "message": "Reporte generado exitosamente"
}
```

### ⚠️ Validaciones y Errores Comunes de Ventas

#### Errores de Validación

**1. Producto Inexistente**
```json
{
  "success": false,
  "message": "Producto con ID producto_inexistente no encontrado"
}
```

**2. Stock Insuficiente**
```json
{
  "success": false,
  "message": "Stock insuficiente para Laptop Gaming. Stock disponible: 5"
}
```

**3. Descuento Inválido**
```json
{
  "success": false,
  "message": "El descuento debe estar entre 0 y 100%"
}
```

**4. IVA Inválido**
```json
{
  "success": false,
  "message": "El IVA debe estar entre 0 y 100%"
}
```

**5. Producto Inactivo**
```json
{
  "success": false,
  "message": "Producto Laptop Antigua no está disponible"
}
```

#### Códigos de Estado HTTP

| Código | Descripción | Casos |
|--------|-------------|-------|
| `200` | Éxito | Operación completada exitosamente |
| `201` | Creado | Venta creada exitosamente |
| `400` | Solicitud Incorrecta | Datos inválidos, validaciones fallidas |
| `401` | No Autorizado | Token faltante o inválido |
| `403` | Prohibido | Sin permisos suficientes |
| `404` | No Encontrado | Venta o producto no existe |
| `500` | Error del Servidor | Error interno del sistema |

### 🔄 Integración Automática con Inventario

#### Flujo de Actualización de Stock

Cuando se crea una venta, el sistema automáticamente:

1. **Valida disponibilidad** de cada producto
2. **Verifica stock suficiente** (solo productos limitados)
3. **Actualiza stock** al confirmar la venta
4. **Registra movimiento** en historial de inventario

**Ejemplo de actualización automática:**
```bash
# Antes de la venta
GET /inventory/prod_123
# Respuesta: {"stock": 10}

# Crear venta con 3 unidades
POST /sales
{
  "products": [{"productId": "prod_123", "quantity": 3, "price": 100}]
}

# Después de la venta
GET /inventory/prod_123
# Respuesta: {"stock": 7}
```

#### Movimientos de Stock Registrados

Cada venta genera automáticamente un movimiento de stock:

```bash
GET /inventory/prod_123/history
```

**Respuesta:**
```json
{
  "movements": [
    {
      "type": "salida",
      "quantity": 3,
      "reason": "Venta",
      "timestamp": "2025-09-28T...",
      "userId": "user_uid"
    }
  ]
}
```

### 📊 Métodos de Pago Soportados

El sistema acepta los siguientes métodos de pago:

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `efectivo` | Pago en efectivo (default) | Ventas en mostrador |
| `tarjeta` | Tarjeta de crédito/débito | Pagos con terminal POS |
| `transferencia` | Transferencia bancaria | Pagos B2B |
| `cheque` | Pago con cheque | Transacciones corporativas |
| `digital` | Wallets digitales | PayPal, Apple Pay, etc. |

### 🎯 Casos de Uso Avanzados

#### 1. Venta Corporativa Completa
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cliente": "Corporativo ABC S.A. de C.V.",
    "vendedor": "Ejecutivo de Cuentas",
    "products": [
      {
        "productId": "laptop_001",
        "quantity": 10,
        "price": 1200.00
      },
      {
        "productId": "mouse_001", 
        "quantity": 10,
        "price": 25.00
      }
    ],
    "descuento": 15,
    "iva": 16,
    "paymentMethod": "transferencia",
    "notes": "Pedido corporativo - Facturación requerida"
  }'
```

#### 2. Búsqueda Inteligente de Productos
```bash
# Buscar por categoría
curl -X GET "http://localhost:3000/sales/products/search?search=electronics&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar por nombre específico
curl -X GET "http://localhost:3000/sales/products/search?search=laptop gaming&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Reportes Avanzados con Filtros
```bash
# Reporte por período específico
curl -X GET "http://localhost:3000/sales/reports/summary?startDate=2025-09-01&endDate=2025-09-30" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reporte por vendedor específico
curl -X GET "http://localhost:3000/sales/reports/summary?vendedor=María García" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Módulo de Análisis de Ventas

El módulo de análisis proporciona estadísticas avanzadas y reportes de ventas para la toma de decisiones empresariales.

### 🎯 Endpoints de Análisis

#### Obtener Estadísticas Completas (GET /analysis/sales)

Devuelve estadísticas diarias de la última semana, mensuales del último semestre y productos más vendidos.

```bash
curl -X GET http://localhost:3000/analysis/sales \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "daily": {
      "labels": ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
      "values": [1500, 2300, 1800, 2100, 2800, 3200, 2600]
    },
    "monthly": {
      "labels": ["Abr", "May", "Jun", "Jul", "Ago", "Sep"],
      "values": [45000, 52000, 48000, 51000, 54000, 58000]
    },
    "topProducts": [
      {
        "id": "prod123",
        "name": "Libretas de cuadros",
        "sales": 150,
        "revenue": 4500
      },
      {
        "id": "prod456",
        "name": "Bolígrafos azules",
        "sales": 120,
        "revenue": 2400
      }
    ]
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

#### Estadísticas por Período Personalizado (GET /analysis/sales/custom)

Obtiene estadísticas para un rango de fechas específico con agrupación configurable.

```bash
# Estadísticas diarias
curl -X GET "http://localhost:3000/analysis/sales/custom?startDate=2025-09-01&endDate=2025-09-30&groupBy=day" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Estadísticas semanales
curl -X GET "http://localhost:3000/analysis/sales/custom?startDate=2025-09-01&endDate=2025-09-30&groupBy=week" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Estadísticas mensuales
curl -X GET "http://localhost:3000/analysis/sales/custom?startDate=2025-01-01&endDate=2025-12-31&groupBy=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Parámetros obligatorios:**
- `startDate` - Fecha de inicio (formato: YYYY-MM-DD)
- `endDate` - Fecha de fin (formato: YYYY-MM-DD)

**Parámetros opcionales:**
- `groupBy` - Agrupación de datos: `day` (default), `week`, `month`

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "labels": ["2025-09-01", "2025-09-02", "2025-09-03"],
    "values": [1200.50, 1800.75, 950.25],
    "totalSales": 15,
    "totalRevenue": 3951.50,
    "averageOrderValue": 263.43
  },
  "message": "Estadísticas del período 2025-09-01 al 2025-09-30 obtenidas exitosamente"
}
```

#### Resumen Ejecutivo (GET /analysis/sales/summary)

Proporciona un resumen ejecutivo con comparación mes actual vs mes anterior.

```bash
curl -X GET http://localhost:3000/analysis/sales/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "currentMonth": {
      "sales": 45,
      "revenue": 12500.75,
      "averageOrderValue": 277.79
    },
    "lastMonth": {
      "sales": 38,
      "revenue": 10200.50,
      "averageOrderValue": 268.43
    },
    "growth": {
      "revenue": 22.55,
      "sales": 18.42
    }
  },
  "message": "Resumen ejecutivo obtenido exitosamente"
}
```

### 🔍 Características del Análisis

**Datos Diarios:**
- Últimos 7 días (incluyendo día actual)
- Valores de ingresos por día de la semana
- Etiquetas en español: Dom, Lun, Mar, Mie, Jue, Vie, Sab

**Datos Mensuales:**
- Últimos 6 meses (incluyendo mes actual)
- Ingresos totales por mes
- Etiquetas de meses abreviadas: Ene, Feb, Mar, etc.

**Productos Más Vendidos:**
- Top 10 productos por cantidad vendida
- Incluye ID, nombre, cantidad de ventas e ingresos
- Actualizado con información del inventario en tiempo real

**Período Personalizado:**
- Filtrado por rango de fechas específico
- Agrupación configurable (día, semana, mes)
- Métricas agregadas: total de ventas, ingresos y promedio por orden

**Resumen Ejecutivo:**
- Comparación mes actual vs mes anterior
- Cálculo automático de porcentajes de crecimiento
- Métricas clave para toma de decisiones

### ⚠️ Validaciones de Análisis

**Errores Comunes:**

1. **Sin autorización:**
```json
{
  "error": "Token de acceso requerido"
}
```

2. **Token inválido:**
```json
{
  "error": "Token no válido"
}
```

3. **Fechas inválidas (período personalizado):**
```json
{
  "success": false,
  "message": "La fecha de inicio debe ser anterior a la fecha de fin"
}
```

4. **Fechas faltantes:**
```json
{
  "success": false,
  "message": "Se requieren las fechas de inicio y fin (startDate, endDate)"
}
```

### 📈 Casos de Uso del Análisis

**1. Dashboard Ejecutivo**
```bash
# Obtener métricas generales
curl -X GET http://localhost:3000/analysis/sales \
  -H "Authorization: Bearer YOUR_TOKEN"

# Resumen del mes
curl -X GET http://localhost:3000/analysis/sales/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. Análisis de Tendencias**
```bash
# Tendencia trimestral
curl -X GET "http://localhost:3000/analysis/sales/custom?startDate=2025-07-01&endDate=2025-09-30&groupBy=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Reporte de Productos**
```bash
# Ver productos más vendidos
curl -X GET http://localhost:3000/analysis/sales \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data.topProducts'
```

## 🧪 Testing en servidor de prueba

```bash
# Ejecutar todas las pruebas
pnpm test

# Pruebas específicas de inventario
pnpm test -- inventory

# Pruebas específicas de ventas
pnpm test -- sales

# Pruebas con cobertura de código
pnpm test -- --coverage

# Modo watch (recarga automática)
pnpm test -- --watch
```

### 🔍 Validación de Endpoints con cURL

**Verificar que el servidor esté funcionando:**
```bash
curl -X GET http://localhost:3000/
```

**Probar autenticación:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cemac.com", "password": "admin123456"}'
```

**Verificar productos disponibles:**
```bash
curl -X GET http://localhost:3000/sales/products/search \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔐 Seguridad

- Todos los tokens son manejados por Firebase Auth
- Middleware de autenticación en todas las rutas protegidas
- Validación de permisos por roles
- Verificación de usuarios activos
- Soft delete para mantener integridad de datos

### 🛡️ Middleware de Seguridad Administrativo

El sistema implementa un middleware especializado `requireAdminAccess` para proteger todos los endpoints administrativos críticos:

**Características:**
- ✅ **Verificación directa de token**: Usa `auth.verifyIdToken(token)`
- ✅ **Consulta directa a Firebase DB**: Acceso directo a `users/{uid}`
- ✅ **Validación estricta de rol**: Solo usuarios con `role: "admin"`
- ✅ **Soporte dual de tokens**: Compatible con ID tokens y custom tokens
- ✅ **Mensajes específicos**: Error descriptivo para acceso denegado

**Endpoints protegidos:**
- `POST /auth/register` - Registro de nuevos usuarios
- `GET /auth/users` - Listado de todos los usuarios
- `PUT /auth/users/{userId}/status` - Activar/desactivar usuarios
- `PUT /auth/users/{userId}/role` - Cambiar rol de usuarios
- `PUT /auth/users/{userId}/profile` - Actualizar perfil de usuarios

**Respuestas de seguridad:**
```json
// Sin token
{ "error": "Token de acceso requerido" }

// Token inválido
{ "error": "Token no válido" }

// No es administrador
{ "error": "Acceso denegado. Se requieren permisos de administrador" }
```

## � Scripts Disponibles

- `pnpm start` - Iniciar en producción
- `pnpm run dev` - Desarrollo con nodemon
- `pnpm run setup` - Configuración inicial de BD y admin
- `pnpm test` - Ejecutar pruebas
- `pnpm test -- --coverage` - Pruebas con cobertura

## 🔧 Estructura del Proyecto

```
CEMAC-API/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Lógica de autenticación
│   │   ├── inventoryController.js # Lógica de inventario
│   │   └── salesController.js     # Lógica de ventas
│   ├── middleware/
│   │   └── auth.js                # Middleware de autenticación + requireAdminAccess
│   ├── routes/
│   │   ├── authRoutes.js          # Rutas de autenticación
│   │   ├── inventoryRoutes.js     # Rutas de inventario
│   │   └── salesRoutes.js         # Rutas de ventas
│   └── scripts/
│       ├── setupDatabase.js       # Configuración inicial
│       ├── setupSales.js          # Configuración del módulo de ventas
│       └── updateAdminPassword.js # Actualizar contraseña admin
├── test/
│   ├── inventory.test.js          # Pruebas del inventario
│   └── sales.test.js              # Pruebas del sistema de ventas
├── .env                           # Variables de entorno
├── firebaseConfig.js              # Configuración Firebase
├── index.js                       # Servidor principal
├── package.json                   # Dependencias
└── serviceAccountKey.json         # Credenciales Firebase
```

## 📋 Changelog

### ✨ v2.1.0 - Middleware de Seguridad Administrativo (Septiembre 2025)

**🛡️ Nueva Funcionalidad: Middleware `requireAdminAccess`**
- Implementado middleware especializado para endpoints administrativos críticos
- Verificación directa de tokens con `auth.verifyIdToken()`
- Consulta directa a Firebase Database para validación de roles
- Soporte dual para ID tokens y custom tokens
- Mensajes de error específicos y descriptivos

**📋 Nuevos Endpoints Administrativos:**
- `GET /auth/users` - Listado completo de usuarios del sistema
- `PUT /auth/users/{userId}/status` - Activación/desactivación de cuentas
- `PUT /auth/users/{userId}/role` - Gestión de roles y permisos
- `PUT /auth/users/{userId}/profile` - Actualización de perfiles por admin

**🔒 Mejoras de Seguridad:**
- Protección avanzada en todos los endpoints administrativos
- Validaciones anti-auto-modificación para administradores
- Manejo robusto de errores y tokens expirados
- Compatibilidad completa con el sistema de autenticación existente

**📚 Documentación:**
- Documentación técnica completa en `SECURITY-MIDDLEWARE.md`
- Ejemplos de uso y respuestas de API actualizados
- Guías de implementación y mejores prácticas

### 🛡️ Configuración de Seguridad

#### Variables de Entorno Requeridas

```bash
# .env (en desarrollo)
FIREBASE_ADMIN_SDK_PATH=./serviceAccountKey.json
JWT_SECRET=tu_clave_secreta_jwt
NODE_ENV=development
PORT=3000

# .env.production (en producción)
FIREBASE_ADMIN_SDK_PATH=/path/to/serviceAccountKey.json
JWT_SECRET=clave_secreta_super_segura
NODE_ENV=production
PORT=3000
```

#### Mejores Prácticas de Seguridad

1. **Tokens JWT**: Los tokens expiran en 24 horas
2. **Validación de Datos**: Todos los endpoints validan entrada
3. **Autenticación**: Middleware requerido en endpoints sensibles
4. **Logs de Seguridad**: Todas las operaciones se registran
5. **Rate Limiting**: Implementar en producción (recomendado)

### 🚀 Despliegue en Producción

#### Verificación Pre-despliegue

```bash
# 1. Ejecutar todas las pruebas
pnpm test

# 2. Linting del código
pnpm run lint

# 4. Construcción de producción
pnpm run build
```

#### Configuración de Firebase Rules

Asegúrate de tener las reglas de Firebase correctamente configuradas:

```javascript
// firebase-rules.json
{
  "rules": {
    "inventory": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "sales": {
      ".read": "auth != null", 
      ".write": "auth != null"
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 📈 Monitoreo y Mantenimiento

#### Métricas Clave a Monitorear

- **Ventas por Día**: Endpoint `/sales/reports/summary`
- **Stock Bajo**: Productos con stock < 10 unidades
- **Errores de API**: Logs de errores 400/500
- **Tiempo de Respuesta**: < 500ms para consultas
- **Usuarios Activos**: Tokens válidos por día

#### Tareas de Mantenimiento

```bash
# Respaldo de base de datos (semanal)
firebase database:backup

# Limpieza de logs antiguos (mensual)
# Implementar rotación de logs

# Actualización de dependencias (mensual)
pnpm update

# Revisión de seguridad (trimestral)
pnpm audit
```

### 🔧 Troubleshooting

#### Problemas Comunes y Soluciones

**1. Error "Firebase Admin SDK not initialized"**
```bash
# Verificar archivo serviceAccountKey.json
ls -la serviceAccountKey.json

# Verificar permisos
chmod 600 serviceAccountKey.json
```

**2. Error "JWT token expired"**
```bash
# Renovar token (Login nuevamente)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

**3. Error "Stock insuficiente"**
```bash
# Verificar stock actual
curl -X GET http://localhost:3000/inventory/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Actualizar stock si necesario
curl -X PUT http://localhost:3000/inventory/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"stock": 50}'
```

**4. Error de conexión a Firebase**
```bash
# Verificar conectividad
ping firebase.googleapis.com

# Verificar configuración
node -e "console.log(require('./firebaseConfig.js'))"
```

### 📚 Recursos Adicionales

#### Documentación Técnica

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

#### Postman Collection

Para importar todos los endpoints en Postman:

1. Descarga la colección: `CEMAC-API.postman_collection.json`
2. Importa en Postman: `File > Import`
3. Configura variables de entorno:
   - `baseUrl`: `http://localhost:3000`
   - `token`: Tu JWT token obtenido del login

#### Herramientas Recomendadas

- **Postman**: Testing de API
- **MongoDB Compass**: Visualización de datos (si usas MongoDB)
- **Firebase Console**: Gestión de base de datos
- **VS Code**: IDE recomendado con extensiones Node.js

## 📄 Licencia

ISC License

## 🆘 Soporte

Para soporte técnico, contacta al equipo de CEMAC o crea un issue en el repositorio.
