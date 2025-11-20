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
- ✅ **Código de barras** y **código de proveedor** por producto
- ✅ Búsqueda por código de barras y código de proveedor
- ✅ **Gestión por cajas** - Soporte para productos empaquetados (piezas por caja)
- ✅ **Movimientos mixtos** - Entradas/salidas por cajas o piezas individuales
- ✅ **Conversión automática** - Cálculo automático entre cajas y piezas
- ✅ **Compatibilidad total** - Mantiene funcionalidad de productos sin cajas

### Sistema de Categorías
- ✅ CRUD completo de categorías de productos
- ✅ Validación de nombres únicos
- ✅ Búsqueda de categorías por nombre y descripción
- ✅ Estadísticas detalladas por categoría
- ✅ **Integración con inventario** - Validación automática al crear/actualizar productos
- ✅ **Actualización en cascada** - Renombrar categoría actualiza todos los productos
- ✅ **Contadores automáticos** - productCount se actualiza automáticamente
- ✅ **Protección de integridad** - No se pueden eliminar categorías con productos

### Sistema de Marcas
- ✅ CRUD completo de marcas de productos
- ✅ Validación de nombres únicos
- ✅ Búsqueda de marcas por nombre y descripción
- ✅ Estadísticas detalladas por marca
- ✅ **Integración con inventario** - Validación automática al crear/actualizar productos
- ✅ **Actualización en cascada** - Renombrar marca actualiza todos los productos
- ✅ **Contadores automáticos** - productCount se actualiza automáticamente
- ✅ **Protección de integridad** - No se pueden eliminar marcas con productos

### Sistema de Proveedores
- ✅ CRUD completo de proveedores
- ✅ Validación de nombres únicos y emails
- ✅ Búsqueda de proveedores por nombre, contacto, email y teléfono
- ✅ Gestión de información de contacto (nombre, email, teléfono, dirección)
- ✅ Estadísticas detalladas por proveedor
- ✅ **Integración con inventario** - Validación automática al crear/actualizar productos
- ✅ **Actualización en cascada** - Renombrar proveedor actualiza todos los productos
- ✅ **Contadores automáticos** - productCount se actualiza automáticamente
- ✅ **Protección de integridad** - No se pueden eliminar proveedores con productos
- ✅ **Estado activo/inactivo** - Control de proveedores activos

### Sistema de Ventas
- ✅ CRUD completo de ventas
- ✅ Registro de ventas con múltiples productos
- ✅ Cálculo automático de totales, IVA y descuentos
- ✅ Actualización automática de stock del inventario
- ✅ Filtros por fecha, cliente, vendedor
- ✅ Estados de venta (pendiente, completada, cancelada, devuelta)
- ✅ Reportes y estadísticas de ventas
- ✅ Integración completa con el sistema de inventario
- ✅ **Integración de vendedores** - Sistema vinculado con usuarios registrados
- ✅ **Validación de vendedores** - Verificación automática de usuarios activos
- ✅ **Trazabilidad de ventas** - Seguimiento por vendedor con UID del usuario

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
- `POST /inventory` - Crear nuevo producto (soporta configuración de cajas)
- `PUT /inventory/:id` - Actualizar producto (incluye gestión de cajas)
- `DELETE /inventory/:id` - Eliminar producto (soft delete)
- `POST /inventory/:id/stock` - Actualizar stock (entrada/salida por cajas o piezas)

### 🏷️ Categorías

#### Lectura (usuarios y administradores)
- `GET /categories` - Listar todas las categorías
- `GET /categories/:id/stats` - Obtener estadísticas de una categoría

#### Escritura (solo administradores)
- `POST /categories` - Crear nueva categoría
- `PUT /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

### 🏭 Marcas

#### Lectura (usuarios y administradores)
- `GET /brands` - Listar todas las marcas
- `GET /brands/:id/stats` - Obtener estadísticas de una marca

#### Escritura (solo administradores)
- `POST /brands` - Crear nueva marca
- `PUT /brands/:id` - Actualizar marca
- `DELETE /brands/:id` - Eliminar marca

### 🚚 Proveedores

#### Lectura (usuarios y administradores)
- `GET /suppliers` - Listar todos los proveedores
- `GET /suppliers/:id/stats` - Obtener estadísticas de un proveedor

#### Escritura (solo administradores)
- `POST /suppliers` - Crear nuevo proveedor
- `PUT /suppliers/:id` - Actualizar proveedor
- `DELETE /suppliers/:id` - Eliminar proveedor

### 💰 Ventas

#### Todos los usuarios autenticados
- `POST /sales` - Crear nueva venta
- `GET /sales` - Listar ventas con filtros
- `GET /sales/:id` - Obtener venta específica
- `PUT /sales/:id/status` - Actualizar estado de venta
- `GET /sales/reports/summary` - Generar reportes de ventas
- `GET /sales/products/search` - Buscar productos disponibles para venta
- `GET /sales/users/vendedores` - Obtener lista de vendedores (usuarios del sistema)

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
- `search` - Buscar en nombre, descripción, código de barras y código de proveedor
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
      "barcode": "7501234567890",
      "supplierCode": "PROV-2024-001",
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
    "stock": 25,
    "barcode": "7501234567890",
    "supplierCode": "PROV-2024-001"
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
  -F "barcode=7501234567890" \
  -F "supplierCode=PROV-2024-001" \
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
- `barcode` - Código de barras del producto
- `supplierCode` - Código de proveedor
- `image` - Archivo de imagen (máximo 5MB)
- `unitsPerBox` - Número de unidades por caja (para productos empaquetados)
- `boxStock` - Número de cajas en stock

**📦 Gestión por Cajas:**

El sistema soporta productos que vienen en cajas/paquetes. Esto es útil para:
- Productos que se compran por caja pero se venden por pieza
- Gestión de inventario de mayoreo
- Trazabilidad de empaques completos

```bash
# Crear producto con configuración de cajas
curl -X POST http://localhost:3000/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Refresco Cola 355ml",
    "description": "Refresco de cola en lata",
    "price": 15.00,
    "availability": "limited",
    "category": "Bebidas",
    "unitsPerBox": 24,
    "boxStock": 10,
    "stock": 12
  }'
```

En este ejemplo:
- `unitsPerBox: 24` - Cada caja contiene 24 piezas
- `boxStock: 10` - Hay 10 cajas completas en almacén
- `stock: 12` - Hay 12 piezas sueltas adicionales
- **Stock total:** (10 × 24) + 12 = 252 piezas disponibles

**Notas importantes:**
- Los campos `unitsPerBox` y `boxStock` son completamente opcionales
- Los productos sin estos campos funcionan normalmente (modo tradicional)
- El stock total siempre se calcula como: `(boxStock × unitsPerBox) + piezasSueltas`


### Obtener Producto (GET /inventory/:id)

```bash
curl -X GET http://localhost:3000/inventory/1234567890abcdef \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "product": {
    "id": "1234567890abcdef",
    "name": "Refresco Cola 355ml",
    "description": "Refresco de cola en lata",
    "price": 15.00,
    "promotionalPrice": null,
    "availability": "limited",
    "category": "Bebidas",
    "stock": 252,
    "unitsPerBox": 24,
    "boxStock": 10,
    "barcode": "7501234567890",
    "supplierCode": "PROV-2024-001",
    "imageUrl": "https://res.cloudinary.com/...",
    "isActive": true,
    "createdAt": "2025-11-16T...",
    "updatedAt": "2025-11-16T...",
    "createdBy": "admin_uid"
  },
  "message": "Producto obtenido exitosamente"
}
```

**Notas:**
- Si el producto tiene `unitsPerBox` y `boxStock`, se incluyen en la respuesta
- El `stock` es el total calculado: (boxStock × unitsPerBox) + piezas sueltas
- Productos sin configuración de cajas no tendrán los campos `unitsPerBox` y `boxStock`

### Actualizar Producto (PUT /inventory/:id)

**⚠️ Solo administradores**

```bash
# Actualización básica
curl -X PUT http://localhost:3000/inventory/1234567890abcdef \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Producto Actualizado",
    "price": 249.99,
    "promotionalPrice": null,
    "barcode": "7509876543210",
    "supplierCode": "PROV-2024-002"
  }'

# Agregar configuración de cajas a producto existente
curl -X PUT http://localhost:3000/inventory/1234567890abcdef \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "unitsPerBox": 24,
    "boxStock": 15
  }'

# Cambiar unitsPerBox (recalcula stock automáticamente)
curl -X PUT http://localhost:3000/inventory/1234567890abcdef \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "unitsPerBox": 12
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "product": {
    "id": "1234567890abcdef",
    "name": "Producto Actualizado",
    "price": 249.99,
    "unitsPerBox": 24,
    "boxStock": 15,
    "stock": 360,
    "updatedAt": "2025-11-16T..."
  },
  "message": "Producto actualizado exitosamente"
}
```

**Notas:**
- Todos los campos son opcionales - solo se actualizan los enviados
- Al cambiar `unitsPerBox`, el stock total se recalcula automáticamente
- Puedes agregar configuración de cajas a productos existentes en cualquier momento
- Para remover la configuración de cajas, envía `unitsPerBox: null` y `boxStock: null`

### Eliminar Producto (DELETE /inventory/:id)

**⚠️ Solo administradores - Soft Delete**

```bash
curl -X DELETE http://localhost:3000/inventory/1234567890abcdef \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

**Notas:**
- Este es un "soft delete" - el producto se marca como inactivo (`isActive: false`)
- El producto no aparecerá en los listados pero se conserva en la base de datos
- El historial de movimientos se mantiene intacto
- Si la categoría tiene productos, se decrementa el contador `productCount`

### Actualizar Stock (POST /inventory/:id/stock)

**⚠️ Solo administradores**

```bash
# Entrada de stock (modo tradicional - por piezas)
curl -X POST http://localhost:3000/inventory/1234567890abcdef/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "entrada",
    "quantity": 50,
    "reason": "Reposición de inventario"
  }'

# Salida de stock (modo tradicional - por piezas)
curl -X POST http://localhost:3000/inventory/1234567890abcdef/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "salida",
    "quantity": 10,
    "reason": "Venta directa"
  }'
```

**📦 Movimientos de Stock por Cajas:**

Para productos con configuración de cajas, puedes hacer movimientos por cajas o por piezas:

```bash
# Entrada de 5 cajas (se convierten automáticamente a piezas)
curl -X POST http://localhost:3000/inventory/1234567890abcdef/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "entrada",
    "unit": "boxes",
    "boxes": 5,
    "reason": "Recepción de proveedor"
  }'

# Salida de 2 cajas
curl -X POST http://localhost:3000/inventory/1234567890abcdef/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "salida",
    "unit": "boxes",
    "boxes": 2,
    "reason": "Venta mayorista"
  }'

# Movimiento mixto: salida de 30 piezas (puede tomar de cajas y piezas sueltas)
curl -X POST http://localhost:3000/inventory/1234567890abcdef/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "salida",
    "unit": "pieces",
    "quantity": 30,
    "reason": "Venta a cliente"
  }'
```

**Campos para movimientos:**

**Modo tradicional (piezas):**
- `type` - `entrada` o `salida`
- `quantity` - Cantidad (número positivo)
- `reason` - Motivo del movimiento

**Modo cajas:**
- `type` - `entrada` o `salida`
- `unit` - `"boxes"` (indica que es movimiento por cajas)
- `boxes` - Número de cajas (se convierte automáticamente a piezas)
- `reason` - Motivo del movimiento

**Modo piezas para productos con cajas:**
- `type` - `entrada` o `salida`
- `unit` - `"pieces"` (indica que es movimiento por piezas)
- `quantity` - Cantidad de piezas
- `reason` - Motivo del movimiento

**Respuesta ejemplo (movimiento por cajas):**
```json
{
  "success": true,
  "message": "Stock actualizado exitosamente",
  "product": {
    "id": "1234567890abcdef",
    "name": "Refresco Cola 355ml",
    "stock": 372,
    "boxStock": 15,
    "unitsPerBox": 24,
    "availability": "limited"
  },
  "movement": {
    "id": "mov_1234567890",
    "type": "entrada",
    "quantity": 120,
    "previousStock": 252,
    "newStock": 372,
    "reason": "Entrada: 5 caja(s) = 120 pieza(s) - Recepción de proveedor",
    "timestamp": "2025-11-16T...",
    "userId": "admin_uid"
  }
}
```

**Respuesta ejemplo (movimiento por piezas):**
```json
{
  "success": true,
  "message": "Stock actualizado exitosamente",
  "product": {
    "id": "1234567890abcdef",
    "name": "Refresco Cola 355ml",
    "stock": 342,
    "boxStock": 15,
    "unitsPerBox": 24,
    "availability": "limited"
  },
  "movement": {
    "id": "mov_1234567891",
    "type": "salida",
    "quantity": 30,
    "previousStock": 372,
    "newStock": 342,
    "reason": "Salida: 30 pieza(s) - Venta a cliente",
    "timestamp": "2025-11-16T...",
    "userId": "admin_uid"
  }
}
```

**Notas:**
- Si no se especifica `unit`, se asume movimiento por piezas (modo tradicional)
- Los movimientos por cajas requieren que el producto tenga `unitsPerBox` configurado
- El historial registra automáticamente la conversión: "5 caja(s) = 120 pieza(s)"
- El sistema valida que no haya stock negativo en salidas
- Para productos con cajas, `boxStock` se actualiza automáticamente

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

### 🏷️ Ejemplos de Gestión de Categorías

#### Listar Todas las Categorías (GET /categories)

```bash
# Listar todas las categorías
curl -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Buscar categorías
curl -X GET "http://localhost:3000/categories?search=electrónica" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "cat_1699123456789_abc",
      "name": "Electrónica",
      "description": "Productos electrónicos y tecnología",
      "productCount": 45,
      "createdAt": "2025-11-10T...",
      "updatedAt": "2025-11-10T...",
      "createdBy": "admin_uid"
    },
    {
      "id": "cat_1699123456789_def",
      "name": "Papelería",
      "description": "Artículos de oficina y escolares",
      "productCount": 128,
      "createdAt": "2025-11-10T...",
      "updatedAt": "2025-11-10T...",
      "createdBy": "admin_uid"
    }
  ],
  "total": 2,
  "message": "Se encontraron 2 categoría(s)"
}
```

**Campos de respuesta:**
- `id` - ID único de la categoría
- `name` - Nombre de la categoría
- `description` - Descripción opcional
- `productCount` - Número de productos en esta categoría
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización
- `createdBy` - ID del usuario que creó la categoría

#### Crear Nueva Categoría (POST /categories)

**⚠️ Solo administradores**

```bash
# Categoría con descripción
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Tecnología",
    "description": "Productos tecnológicos y gadgets"
  }'

# Categoría sin descripción
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Hogar"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "category": {
    "id": "cat_1699123456789_xyz",
    "name": "Tecnología",
    "description": "Productos tecnológicos y gadgets",
    "productCount": 0,
    "createdAt": "2025-11-15T10:30:00Z",
    "updatedAt": "2025-11-15T10:30:00Z",
    "createdBy": "admin_uid"
  }
}
```

**Campos requeridos:**
- `name` - Nombre de la categoría (único)

**Campos opcionales:**
- `description` - Descripción de la categoría

**Validaciones:**
- ✅ El nombre es requerido y no puede estar vacío
- ✅ El nombre debe ser único (case-insensitive)
- ✅ Solo administradores pueden crear categorías

#### Actualizar Categoría (PUT /categories/:id)

**⚠️ Solo administradores**

```bash
# Actualizar nombre y descripción
curl -X PUT http://localhost:3000/categories/cat_1699123456789_xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Tecnología Avanzada",
    "description": "Productos de tecnología de última generación"
  }'

# Actualizar solo el nombre
curl -X PUT http://localhost:3000/categories/cat_1699123456789_xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Tech"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Categoría actualizada exitosamente",
  "category": {
    "id": "cat_1699123456789_xyz",
    "name": "Tecnología Avanzada",
    "description": "Productos de tecnología de última generación",
    "productCount": 15,
    "createdAt": "2025-11-15T10:30:00Z",
    "updatedAt": "2025-11-15T11:45:00Z",
    "createdBy": "admin_uid",
    "updatedBy": "admin_uid"
  }
}
```

**Características importantes:**
- ✅ **Actualización en cascada**: Si cambias el nombre, se actualiza automáticamente en todos los productos
- ✅ Validación de nombre único
- ✅ Solo administradores pueden actualizar
- ✅ Todos los campos son opcionales (solo se actualizan los proporcionados)

#### Eliminar Categoría (DELETE /categories/:id)

**⚠️ Solo administradores**

```bash
curl -X DELETE http://localhost:3000/categories/cat_1699123456789_xyz \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Categoría eliminada exitosamente",
  "categoryId": "cat_1699123456789_xyz"
}
```

**Error si tiene productos asociados:**
```json
{
  "success": false,
  "message": "No se puede eliminar la categoría porque tiene 15 producto(s) asociado(s)"
}
```

**Validaciones:**
- ✅ No se puede eliminar una categoría con productos asociados
- ✅ Solo administradores pueden eliminar
- ✅ Protección de integridad referencial

#### Obtener Estadísticas de Categoría (GET /categories/:id/stats)

```bash
curl -X GET http://localhost:3000/categories/cat_1699123456789_xyz/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "category": {
    "id": "cat_1699123456789_xyz",
    "name": "Tecnología",
    "description": "Productos tecnológicos y gadgets",
    "productCount": 45,
    "createdAt": "2025-11-15T10:30:00Z",
    "updatedAt": "2025-11-15T10:30:00Z",
    "createdBy": "admin_uid"
  },
  "stats": {
    "productCount": 45,
    "activeProducts": 43,
    "limitedProducts": 35,
    "unlimitedProducts": 8,
    "totalStock": 1250,
    "lowStockProducts": 5,
    "averagePrice": 299.99
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

**Estadísticas incluidas:**
- `productCount` - Total de productos en la categoría
- `activeProducts` - Productos activos (no eliminados)
- `limitedProducts` - Productos con disponibilidad limitada
- `unlimitedProducts` - Productos con disponibilidad ilimitada
- `totalStock` - Stock total de todos los productos
- `lowStockProducts` - Productos con stock bajo (stock <= minStock)
- `averagePrice` - Precio promedio de los productos

### Integración de Categorías con Inventario

#### Crear Producto con Categoría Validada

Al crear un producto, **la categoría debe existir previamente**:

```bash
# 1. Primero crear la categoría
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Electrónica"
  }'

# 2. Luego crear el producto
curl -X POST http://localhost:3000/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Laptop Gaming",
    "description": "Laptop de alto rendimiento",
    "price": 1299.99,
    "availability": "limited",
    "category": "Electrónica",
    "stock": 10
  }'
```

**Si la categoría no existe:**
```json
{
  "success": false,
  "message": "La categoría especificada no existe. Por favor, créala primero en /categories"
}
```

#### Actualización Automática de Contadores

El sistema actualiza automáticamente el contador `productCount`:

**Al crear un producto:**
- ➕ Se incrementa `productCount` de la categoría

**Al actualizar la categoría de un producto:**
- ➖ Se decrementa `productCount` de la categoría anterior
- ➕ Se incrementa `productCount` de la nueva categoría

**Al eliminar un producto:**
- ➖ Se decrementa `productCount` de la categoría

#### Renombrar Categoría en Todos los Productos

Cuando actualizas el nombre de una categoría, **todos los productos se actualizan automáticamente**:

```bash
# Cambiar nombre de "Electrónica" a "Tecnología"
curl -X PUT http://localhost:3000/categories/cat_123/
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Tecnología"
  }'
```

Resultado:
- ✅ Categoría renombrada
- ✅ Todos los productos con `category: "Electrónica"` ahora tienen `category: "Tecnología"`
- ✅ Actualización en cascada automática

### Validaciones del Sistema de Categorías

#### Errores Comunes

**1. Nombre requerido:**
```json
{
  "success": false,
  "message": "El nombre de la categoría es requerido"
}
```

**2. Categoría duplicada:**
```json
{
  "success": false,
  "message": "Ya existe una categoría con ese nombre"
}
```

**3. Categoría no encontrada:**
```json
{
  "success": false,
  "message": "Categoría no encontrada"
}
```

**4. No se puede eliminar con productos:**
```json
{
  "success": false,
  "message": "No se puede eliminar la categoría porque tiene 45 producto(s) asociado(s)"
}
```

**5. Sin permisos de administrador:**
```json
{
  "error": "Acceso denegado. Se requieren permisos de administrador"
}
```

### 🏭 Ejemplos de Gestión de Marcas

#### Listar Todas las Marcas (GET /brands)

```bash
# Listar todas las marcas
curl -X GET http://localhost:3000/brands \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Buscar marcas
curl -X GET "http://localhost:3000/brands?search=samsung" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "brands": [
    {
      "id": "brand_1699123456789_abc",
      "name": "Samsung",
      "description": "Productos electrónicos Samsung",
      "productCount": 35,
      "createdAt": "2025-11-15T10:30:00Z",
      "updatedAt": "2025-11-15T10:30:00Z",
      "createdBy": "admin_uid"
    },
    {
      "id": "brand_1699123456789_def",
      "name": "Sony",
      "description": "Electrónica de consumo Sony",
      "productCount": 28,
      "createdAt": "2025-11-15T11:00:00Z",
      "updatedAt": "2025-11-15T11:00:00Z",
      "createdBy": "admin_uid"
    }
  ],
  "total": 2,
  "message": "Se encontraron 2 marca(s)"
}
```

**Campos de respuesta:**
- `id` - ID único de la marca
- `name` - Nombre de la marca
- `description` - Descripción opcional
- `productCount` - Número de productos de esta marca
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización
- `createdBy` - ID del usuario que creó la marca

#### Crear Nueva Marca (POST /brands)

**⚠️ Solo administradores**

```bash
# Marca con descripción
curl -X POST http://localhost:3000/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Apple",
    "description": "Productos Apple Inc."
  }'

# Marca sin descripción
curl -X POST http://localhost:3000/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "LG"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Marca creada exitosamente",
  "brand": {
    "id": "brand_1699123456789_xyz",
    "name": "Apple",
    "description": "Productos Apple Inc.",
    "productCount": 0,
    "createdAt": "2025-11-15T10:30:00Z",
    "updatedAt": "2025-11-15T10:30:00Z",
    "createdBy": "admin_uid"
  }
}
```

**Campos requeridos:**
- `name` - Nombre de la marca (único)

**Campos opcionales:**
- `description` - Descripción de la marca

**Validaciones:**
- ✅ El nombre es requerido y no puede estar vacío
- ✅ El nombre debe ser único (case-insensitive)
- ✅ Solo administradores pueden crear marcas

#### Actualizar Marca (PUT /brands/:id)

**⚠️ Solo administradores**

```bash
# Actualizar nombre y descripción
curl -X PUT http://localhost:3000/brands/brand_1699123456789_xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Apple Inc.",
    "description": "Productos tecnológicos Apple Inc."
  }'

# Actualizar solo el nombre
curl -X PUT http://localhost:3000/brands/brand_1699123456789_xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Apple"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Marca actualizada exitosamente",
  "brand": {
    "id": "brand_1699123456789_xyz",
    "name": "Apple Inc.",
    "description": "Productos tecnológicos Apple Inc.",
    "productCount": 25,
    "createdAt": "2025-11-15T10:30:00Z",
    "updatedAt": "2025-11-15T11:45:00Z",
    "createdBy": "admin_uid",
    "updatedBy": "admin_uid"
  }
}
```

**Características importantes:**
- ✅ **Actualización en cascada**: Si cambias el nombre, se actualiza automáticamente en todos los productos
- ✅ Validación de nombre único
- ✅ Solo administradores pueden actualizar
- ✅ Todos los campos son opcionales (solo se actualizan los proporcionados)

#### Eliminar Marca (DELETE /brands/:id)

**⚠️ Solo administradores**

```bash
curl -X DELETE http://localhost:3000/brands/brand_1699123456789_xyz \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Marca eliminada exitosamente",
  "brandId": "brand_1699123456789_xyz"
}
```

**Error si tiene productos asociados:**
```json
{
  "success": false,
  "message": "No se puede eliminar la marca porque tiene 25 producto(s) asociado(s)"
}
```

**Validaciones:**
- ✅ No se puede eliminar una marca con productos asociados
- ✅ Solo administradores pueden eliminar
- ✅ Protección de integridad referencial

#### Obtener Estadísticas de Marca (GET /brands/:id/stats)

```bash
curl -X GET http://localhost:3000/brands/brand_1699123456789_xyz/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "brand": {
    "id": "brand_1699123456789_xyz",
    "name": "Samsung",
    "description": "Productos electrónicos Samsung",
    "productCount": 35,
    "createdAt": "2025-11-15T10:30:00Z",
    "updatedAt": "2025-11-15T10:30:00Z",
    "createdBy": "admin_uid"
  },
  "stats": {
    "productCount": 35,
    "activeProducts": 33,
    "limitedProducts": 28,
    "unlimitedProducts": 5,
    "totalStock": 850,
    "lowStockProducts": 7,
    "averagePrice": 459.99
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

**Estadísticas incluidas:**
- `productCount` - Total de productos de la marca
- `activeProducts` - Productos activos (no eliminados)
- `limitedProducts` - Productos con disponibilidad limitada
- `unlimitedProducts` - Productos con disponibilidad ilimitada
- `totalStock` - Stock total de todos los productos
- `lowStockProducts` - Productos con stock bajo
- `averagePrice` - Precio promedio de los productos

### Integración de Marcas con Inventario

#### Crear Producto con Marca Validada

Al crear un producto, **la marca debe existir previamente si se especifica**:

```bash
# 1. Primero crear la marca
curl -X POST http://localhost:3000/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Samsung"
  }'

# 2. Luego crear el producto
curl -X POST http://localhost:3000/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Samsung Galaxy S24",
    "description": "Smartphone de última generación",
    "price": 999.99,
    "availability": "limited",
    "category": "Electrónica",
    "brand": "Samsung",
    "stock": 15
  }'
```

**Si la marca no existe:**
```json
{
  "success": false,
  "message": "La marca especificada no existe. Por favor, créala primero en /brands"
}
```

#### Filtrar Productos por Marca

```bash
# Obtener todos los productos de una marca
curl -X GET "http://localhost:3000/inventory?brand=Samsung" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Combinar filtros: marca + categoría
curl -X GET "http://localhost:3000/inventory?brand=Samsung&category=Electrónica" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

#### Actualización Automática de Contadores

El sistema actualiza automáticamente el contador `productCount`:

**Al crear un producto:**
- ➕ Se incrementa `productCount` de la marca

**Al actualizar la marca de un producto:**
- ➖ Se decrementa `productCount` de la marca anterior
- ➕ Se incrementa `productCount` de la nueva marca

**Al eliminar un producto:**
- ➖ Se decrementa `productCount` de la marca

#### Renombrar Marca en Todos los Productos

Cuando actualizas el nombre de una marca, **todos los productos se actualizan automáticamente**:

```bash
# Cambiar nombre de "Samsung" a "Samsung Electronics"
curl -X PUT http://localhost:3000/brands/brand_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Samsung Electronics"
  }'
```

Resultado:
- ✅ Marca renombrada
- ✅ Todos los productos con `brand: "Samsung"` ahora tienen `brand: "Samsung Electronics"`
- ✅ Actualización en cascada automática

### Validaciones del Sistema de Marcas

#### Errores Comunes

**1. Nombre requerido:**
```json
{
  "success": false,
  "message": "El nombre de la marca es requerido"
}
```

**2. Marca duplicada:**
```json
{
  "success": false,
  "message": "Ya existe una marca con ese nombre"
}
```

**3. Marca no encontrada:**
```json
{
  "success": false,
  "message": "Marca no encontrada"
}
```

**4. No se puede eliminar con productos:**
```json
{
  "success": false,
  "message": "No se puede eliminar la marca porque tiene 35 producto(s) asociado(s)"
}
```

**5. Sin permisos de administrador:**
```json
{
  "error": "Acceso denegado. Se requieren permisos de administrador"
}
```

### 🚚 Ejemplos de Gestión de Proveedores

#### Listar Todos los Proveedores (GET /suppliers)

```bash
# Listar todos los proveedores
curl -X GET http://localhost:3000/suppliers \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Buscar proveedores
curl -X GET "http://localhost:3000/suppliers?search=tecnología" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "suppliers": [
    {
      "id": "supplier_1699123456789_abc",
      "name": "Distribuidora Tecnología S.A.",
      "description": "Proveedor mayorista de electrónica",
      "contactName": "Juan Pérez",
      "email": "ventas@techdist.com",
      "phone": "+52 55 1234 5678",
      "address": "Av. Principal 123, CDMX",
      "productCount": 42,
      "isActive": true,
      "createdAt": "2025-11-15T10:30:00Z",
      "updatedAt": "2025-11-15T10:30:00Z",
      "createdBy": "admin_uid"
    },
    {
      "id": "supplier_1699123456789_def",
      "name": "Importadora Global",
      "description": "Importación de productos tecnológicos",
      "contactName": "María García",
      "email": "contacto@impglobal.com",
      "phone": "+52 55 9876 5432",
      "address": "Calle Comercio 456, Monterrey",
      "productCount": 18,
      "isActive": true,
      "createdAt": "2025-11-15T11:00:00Z",
      "updatedAt": "2025-11-15T11:00:00Z",
      "createdBy": "admin_uid"
    }
  ],
  "total": 2,
  "message": "Se encontraron 2 proveedor(es)"
}
```

**Campos de respuesta:**
- `id` - ID único del proveedor
- `name` - Nombre de la empresa proveedora
- `description` - Descripción opcional
- `contactName` - Nombre de la persona de contacto
- `email` - Email de contacto
- `phone` - Teléfono de contacto
- `address` - Dirección física
- `productCount` - Número de productos de este proveedor
- `isActive` - Estado del proveedor (activo/inactivo)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización
- `createdBy` - ID del usuario que creó el proveedor

#### Crear Nuevo Proveedor (POST /suppliers)

**⚠️ Solo administradores**

```bash
# Proveedor con información completa
curl -X POST http://localhost:3000/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Distribuidora ABC S.A.",
    "description": "Proveedor mayorista de productos varios",
    "contactName": "Carlos Rodríguez",
    "email": "ventas@distribuidoraabc.com",
    "phone": "+52 55 1234 5678",
    "address": "Av. Industrial 789, CDMX"
  }'

# Proveedor con datos mínimos
curl -X POST http://localhost:3000/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Proveedor XYZ"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Proveedor creado exitosamente",
  "supplier": {
    "id": "supplier_1699123456789_xyz",
    "name": "Distribuidora ABC S.A.",
    "description": "Proveedor mayorista de productos varios",
    "contactName": "Carlos Rodríguez",
    "email": "ventas@distribuidoraabc.com",
    "phone": "+52 55 1234 5678",
    "address": "Av. Industrial 789, CDMX",
    "productCount": 0,
    "isActive": true,
    "createdAt": "2025-11-20T10:30:00Z",
    "updatedAt": "2025-11-20T10:30:00Z",
    "createdBy": "admin_uid"
  }
}
```

**Campos requeridos:**
- `name` - Nombre del proveedor (único)

**Campos opcionales:**
- `description` - Descripción del proveedor
- `contactName` - Nombre de la persona de contacto
- `email` - Email de contacto (se valida formato)
- `phone` - Teléfono de contacto
- `address` - Dirección física del proveedor

**Validaciones:**
- ✅ El nombre es requerido y no puede estar vacío
- ✅ El nombre debe ser único (case-insensitive)
- ✅ El email debe tener formato válido si se proporciona
- ✅ Solo administradores pueden crear proveedores

#### Actualizar Proveedor (PUT /suppliers/:id)

**⚠️ Solo administradores**

```bash
# Actualizar información completa
curl -X PUT http://localhost:3000/suppliers/supplier_1699123456789_xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Distribuidora ABC Internacional S.A.",
    "description": "Proveedor mayorista internacional de productos varios",
    "contactName": "Carlos Rodríguez Gómez",
    "email": "ventas.internacional@distribuidoraabc.com",
    "phone": "+52 55 1234 5678 ext. 102",
    "address": "Av. Industrial 789, Col. Centro, CDMX",
    "isActive": true
  }'

# Actualizar solo algunos campos
curl -X PUT http://localhost:3000/suppliers/supplier_1699123456789_xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "nuevoemail@distribuidoraabc.com",
    "phone": "+52 55 8888 9999"
  }'

# Desactivar proveedor
curl -X PUT http://localhost:3000/suppliers/supplier_1699123456789_xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "isActive": false
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Proveedor actualizado exitosamente",
  "supplier": {
    "id": "supplier_1699123456789_xyz",
    "name": "Distribuidora ABC Internacional S.A.",
    "description": "Proveedor mayorista internacional de productos varios",
    "contactName": "Carlos Rodríguez Gómez",
    "email": "ventas.internacional@distribuidoraabc.com",
    "phone": "+52 55 1234 5678 ext. 102",
    "address": "Av. Industrial 789, Col. Centro, CDMX",
    "productCount": 15,
    "isActive": true,
    "createdAt": "2025-11-20T10:30:00Z",
    "updatedAt": "2025-11-20T11:45:00Z",
    "createdBy": "admin_uid",
    "updatedBy": "admin_uid"
  }
}
```

**Características importantes:**
- ✅ **Actualización en cascada**: Si cambias el nombre, se actualiza automáticamente en todos los productos
- ✅ Validación de nombre único
- ✅ Validación de formato de email
- ✅ Control de estado activo/inactivo
- ✅ Solo administradores pueden actualizar
- ✅ Todos los campos son opcionales (solo se actualizan los proporcionados)

#### Eliminar Proveedor (DELETE /suppliers/:id)

**⚠️ Solo administradores**

```bash
curl -X DELETE http://localhost:3000/suppliers/supplier_1699123456789_xyz \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Proveedor eliminado exitosamente",
  "supplierId": "supplier_1699123456789_xyz"
}
```

**Error si tiene productos asociados:**
```json
{
  "success": false,
  "message": "No se puede eliminar el proveedor porque tiene 15 producto(s) asociado(s)"
}
```

**Validaciones:**
- ✅ No se puede eliminar un proveedor con productos asociados
- ✅ Solo administradores pueden eliminar
- ✅ Protección de integridad referencial

#### Obtener Estadísticas de Proveedor (GET /suppliers/:id/stats)

```bash
curl -X GET http://localhost:3000/suppliers/supplier_1699123456789_xyz/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "supplier": {
    "id": "supplier_1699123456789_xyz",
    "name": "Distribuidora ABC S.A.",
    "description": "Proveedor mayorista de productos varios",
    "contactName": "Carlos Rodríguez",
    "email": "ventas@distribuidoraabc.com",
    "phone": "+52 55 1234 5678",
    "address": "Av. Industrial 789, CDMX",
    "productCount": 42,
    "isActive": true,
    "createdAt": "2025-11-20T10:30:00Z",
    "updatedAt": "2025-11-20T10:30:00Z",
    "createdBy": "admin_uid"
  },
  "stats": {
    "productCount": 42,
    "activeProducts": 40,
    "limitedProducts": 35,
    "unlimitedProducts": 5,
    "totalStock": 1250,
    "lowStockProducts": 8,
    "averagePrice": 349.99
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

**Estadísticas incluidas:**
- `productCount` - Total de productos del proveedor
- `activeProducts` - Productos activos (no eliminados)
- `limitedProducts` - Productos con disponibilidad limitada
- `unlimitedProducts` - Productos con disponibilidad ilimitada
- `totalStock` - Stock total de todos los productos
- `lowStockProducts` - Productos con stock bajo
- `averagePrice` - Precio promedio de los productos

### Integración de Proveedores con Inventario

#### Crear Producto con Proveedor Validado

Al crear un producto, **el proveedor debe existir previamente si se especifica**:

```bash
# 1. Primero crear el proveedor
curl -X POST http://localhost:3000/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Distribuidora XYZ",
    "email": "ventas@xyz.com"
  }'

# 2. Luego crear el producto
curl -X POST http://localhost:3000/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Producto Importado",
    "description": "Producto traído por distribuidor",
    "price": 299.99,
    "availability": "limited",
    "category": "Electrónica",
    "brand": "Samsung",
    "supplier": "Distribuidora XYZ",
    "stock": 20
  }'
```

**Si el proveedor no existe:**
```json
{
  "success": false,
  "message": "El proveedor especificado no existe. Por favor, créalo primero en /suppliers"
}
```

#### Filtrar Productos por Proveedor

```bash
# Obtener todos los productos de un proveedor
curl -X GET "http://localhost:3000/inventory?supplier=Distribuidora%20XYZ" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Combinar filtros: proveedor + marca + categoría
curl -X GET "http://localhost:3000/inventory?supplier=Distribuidora%20XYZ&brand=Samsung&category=Electrónica" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

#### Actualización Automática de Contadores

El sistema actualiza automáticamente el contador `productCount`:

**Al crear un producto:**
- ➕ Se incrementa `productCount` del proveedor

**Al actualizar el proveedor de un producto:**
- ➖ Se decrementa `productCount` del proveedor anterior
- ➕ Se incrementa `productCount` del nuevo proveedor

**Al eliminar un producto:**
- ➖ Se decrementa `productCount` del proveedor

#### Renombrar Proveedor en Todos los Productos

Cuando actualizas el nombre de un proveedor, **todos los productos se actualizan automáticamente**:

```bash
# Cambiar nombre de "Distribuidora XYZ" a "Distribuidora XYZ Internacional"
curl -X PUT http://localhost:3000/suppliers/supplier_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Distribuidora XYZ Internacional"
  }'
```

Resultado:
- ✅ Proveedor renombrado
- ✅ Todos los productos con `supplier: "Distribuidora XYZ"` ahora tienen `supplier: "Distribuidora XYZ Internacional"`
- ✅ Actualización en cascada automática

### Validaciones del Sistema de Proveedores

#### Errores Comunes

**1. Nombre requerido:**
```json
{
  "success": false,
  "message": "El nombre del proveedor es requerido"
}
```

**2. Proveedor duplicado:**
```json
{
  "success": false,
  "message": "Ya existe un proveedor con ese nombre"
}
```

**3. Email inválido:**
```json
{
  "success": false,
  "message": "El formato del email no es válido"
}
```

**4. Proveedor no encontrado:**
```json
{
  "success": false,
  "message": "Proveedor no encontrado"
}
```

**5. No se puede eliminar con productos:**
```json
{
  "success": false,
  "message": "No se puede eliminar el proveedor porque tiene 42 producto(s) asociado(s)"
}
```

**6. Sin permisos de administrador:**
```json
{
  "error": "Acceso denegado. Se requieren permisos de administrador"
}
```

### Ejemplo Completo: Crear Producto con Categoría, Marca y Proveedor

```bash
# Paso 1: Crear categoría
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Electrónica",
    "description": "Productos electrónicos y tecnología"
  }'

# Paso 2: Crear marca
curl -X POST http://localhost:3000/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Samsung",
    "description": "Productos Samsung"
  }'

# Paso 3: Crear proveedor
curl -X POST http://localhost:3000/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Tech Import S.A.",
    "description": "Importador de electrónica",
    "contactName": "Juan Pérez",
    "email": "ventas@techimport.com",
    "phone": "+52 55 1234 5678"
  }'

# Paso 4: Crear producto con toda la información
curl -X POST http://localhost:3000/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Samsung Galaxy S24 Ultra",
    "description": "Smartphone flagship con 512GB",
    "price": 1299.99,
    "promotionalPrice": 1199.99,
    "availability": "limited",
    "category": "Electrónica",
    "brand": "Samsung",
    "supplier": "Tech Import S.A.",
    "stock": 25,
    "barcode": "8806095184234",
    "supplierCode": "SGS24U-512-BLK"
  }'
```

**Respuesta final del producto:**
```json
{
  "success": true,
  "product": {
    "id": "product_1732089600000_abc123",
    "name": "Samsung Galaxy S24 Ultra",
    "description": "Smartphone flagship con 512GB",
    "price": 1299.99,
    "promotionalPrice": 1199.99,
    "availability": "limited",
    "category": "Electrónica",
    "brand": "Samsung",
    "supplier": "Tech Import S.A.",
    "stock": 25,
    "barcode": "8806095184234",
    "supplierCode": "SGS24U-512-BLK",
    "imageUrl": null,
    "isActive": true,
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z",
    "createdBy": "admin_uid"
  },
  "message": "Producto creado exitosamente"
}
```

**🎯 Consultas combinadas:**

```bash
# Buscar todos los productos Samsung de Electrónica del proveedor Tech Import
curl -X GET "http://localhost:3000/inventory?category=Electrónica&brand=Samsung&supplier=Tech%20Import%20S.A." \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Obtener estadísticas de cada entidad
curl -X GET http://localhost:3000/categories/cat_123/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

curl -X GET http://localhost:3000/brands/brand_456/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

curl -X GET http://localhost:3000/suppliers/supplier_789/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 💰 Ejemplos de Ventas

#### Obtener Lista de Vendedores (GET /sales/users/vendedores)

**Descripción:** Obtiene la lista de usuarios registrados en el sistema que pueden actuar como vendedores.

```bash
# Obtener todos los vendedores activos
curl -X GET http://localhost:3000/sales/users/vendedores \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Incluir vendedores inactivos
curl -X GET "http://localhost:3000/sales/users/vendedores?includeInactive=true" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "vendedores": [
    {
      "uid": "user_abc123xyz",
      "email": "juan.perez@empresa.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "fullName": "Juan Pérez",
      "role": "user",
      "isActive": true
    },
    {
      "uid": "user_def456uvw",
      "email": "maria.garcia@empresa.com",
      "firstName": "María",
      "lastName": "García",
      "fullName": "María García",
      "role": "admin",
      "isActive": true
    }
  ],
  "total": 2,
  "message": "Se encontraron 2 vendedores"
}
```

**Características:**
- ✅ Retorna solo usuarios activos por defecto
- ✅ Incluye información completa del usuario
- ✅ Ordenados alfabéticamente por nombre
- ✅ Útil para poblar dropdown/select en formularios de venta

#### Crear Nueva Venta (POST /sales)

**Ejemplo 1: Venta sin IVA (precios ya incluyen impuestos)**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "cliente": "Juan Pérez",
    "vendedorId": "user_abc123xyz",
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
    "vendedorId": "user_def456uvw",
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

**Ejemplo 3: Venta sin vendedor asignado**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "cliente": "Ana Rodríguez",
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
    "vendedorId": "user_abc123xyz",
    "vendedor": "Juan Pérez",
    "vendedorEmail": "juan.perez@empresa.com",
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
    "vendedorId": "user_def456uvw",
    "vendedor": "María García",
    "vendedorEmail": "maria.garcia@empresa.com",
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
- `vendedorId` - UID del usuario vendedor del sistema (default: null, aparecerá como "No asignado")
- `descuento` - Porcentaje de descuento (0-100, default: 0)
- `iva` - Porcentaje de IVA a aplicar (0-100, default: 0)
- `paymentMethod` - Método de pago (default: "efectivo")
- `notes` - Notas adicionales

**🎯 Integración con Sistema de Vendedores:**

1. **Obtener lista de vendedores disponibles:**
```bash
GET /sales/users/vendedores
```

2. **Crear venta con vendedor asignado:**
```bash
POST /sales
{
  "vendedorId": "user_abc123xyz",  // UID del usuario
  "cliente": "Cliente",
  "products": [...]
}
```

3. **Validaciones automáticas:**
- ✅ El sistema valida que el `vendedorId` exista
- ✅ Verifica que el vendedor esté activo (`isActive: true`)
- ✅ Obtiene automáticamente nombre completo y email del vendedor
- ✅ Si no se proporciona `vendedorId`, se registra como "No asignado"

**Respuestas de error:**
```json
// Vendedor no encontrado o inactivo
{
  "success": false,
  "message": "Vendedor no encontrado o inactivo"
}
```

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
curl -X GET "http://localhost:3000/sales?startDate=2025-09-01&endDate=2025-09-30&vendedor=user_abc123xyz&page=1&limit=10&sortBy=total&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Parámetros de consulta disponibles:**
- `page` / `limit` - Paginación
- `startDate` / `endDate` - Filtro por rango de fechas (YYYY-MM-DD)
- `vendedor` - Filtrar por **UID del vendedor**, **email** o **nombre**
- `cliente` - Filtrar por nombre del cliente
- `status` - Filtrar por estado (pendiente, completada, cancelada, devuelta)
- `sortBy` - Ordenar por campo (createdAt, total, cliente, vendedor)
- `sortOrder` - Orden (asc, desc)

**🎯 Filtrado Flexible por Vendedor:**
```bash
# Por UID del usuario
GET /sales?vendedor=user_abc123xyz

# Por email del vendedor
GET /sales?vendedor=juan.perez@empresa.com

# Por nombre del vendedor
GET /sales?vendedor=Juan
```

**Respuesta:**
```json
{
  "success": true,
  "sales": [
    {
      "id": "sale_1234567890",
      "cliente": "Juan Pérez",
      "vendedorId": "user_abc123xyz",
      "vendedor": "Juan Pérez",
      "vendedorEmail": "juan.perez@empresa.com",
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
curl -X GET "http://localhost:3000/sales/reports/summary?startDate=2025-09-01&endDate=2025-09-30&vendedor=user_abc123xyz" \
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
        "vendedorId": "user_abc123xyz",
        "vendedor": "Juan Pérez",
        "vendedorEmail": "juan.perez@empresa.com",
        "totalSales": 23,
        "totalRevenue": 7420.50
      },
      {
        "vendedorId": "user_def456uvw",
        "vendedor": "María García",
        "vendedorEmail": "maria.garcia@empresa.com",
        "totalSales": 18,
        "totalRevenue": 5827.80
      },
      {
        "vendedorId": null,
        "vendedor": "No asignado",
        "vendedorEmail": null,
        "totalSales": 6,
        "totalRevenue": 2000.00
      }
    ]
  },
  "message": "Reporte generado exitosamente"
}
```

**🎯 Características del Reporte de Vendedores:**
- ✅ Incluye información completa del vendedor (UID, nombre, email)
- ✅ Agrupa ventas por vendedor específico
- ✅ Separa ventas sin vendedor asignado
- ✅ Ordenado por ingresos totales (mayor a menor)

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

---

## 🚨 Sistema de Alertas

El sistema de alertas permite monitorear el inventario y gestionar notificaciones para eventos críticos como stock bajo, productos agotados y otras situaciones que requieren atención.

### 🔔 Endpoints de Alertas

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | `/alerts/generate` | Admin | Generar alertas automáticas |
| GET | `/alerts` | User/Admin | Listar con filtros |
| GET | `/alerts/latest-critical` | User/Admin | Última alerta crítica |
| GET | `/alerts/count` | User/Admin | Contadores |
| GET | `/alerts/history` | User/Admin | Historial |
| GET | `/alerts/:alertId` | User/Admin | Obtener por ID |
| PUT | `/alerts/mark-all-read` | User/Admin | Marcar todas |
| PUT | `/alerts/settings/thresholds` | Admin | Configurar umbrales |
| PUT | `/alerts/:alertId/status` | User/Admin | Actualizar estado |
| DELETE | `/alerts/:alertId` | Admin | Eliminar alerta |

### 📋 Estructura de Datos de Alertas

```json
{
  "id": "alert_1234567890_abc123xyz",
  "type": "stock_low",
  "priority": "urgente",
  "status": "pendiente",
  "productId": "prod_123",
  "productName": "Cuaderno Profesional 100 hojas",
  "productCategory": "Cuadernos y Libretas",
  "currentStock": 5,
  "minThreshold": 20,
  "message": "Stock bajo: Solo quedan 5 unidades de Cuaderno Profesional 100 hojas en Cuadernos y Libretas",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z",
  "resolvedAt": null,
  "resolvedBy": null,
  "actions": [
    {
      "actionType": "status_change",
      "previousStatus": "pendiente",
      "newStatus": "en_proceso",
      "userId": "user_id_123",
      "userName": "Juan Pérez",
      "timestamp": "2024-01-15T14:20:00.000Z",
      "notes": "Pedido realizado al proveedor"
    }
  ]
}
```

### 🎯 Tipos de Alerta

- **`stock_low`** - Stock por debajo del umbral mínimo
- **`stock_out`** - Producto completamente agotado (stock = 0)
- **`expiration`** - Producto próximo a vencer
- **`price_change`** - Cambio significativo de precio
- **`other`** - Otras alertas personalizadas

### 🔴 Niveles de Prioridad

- **`critica`** - Stock agotado (0 unidades), requiere atención inmediata
- **`urgente`** - Stock muy bajo (< 10 unidades)
- **`media`** - Stock bajo pero dentro de límites manejables
- **`baja`** - Alertas informativas

### 🔄 Estados de Alerta

- **`pendiente`** - Alerta nueva sin atender
- **`en_proceso`** - Alguien está trabajando en resolver la alerta
- **`atendido`** - Alerta solucionada exitosamente
- **`descartado`** - Alerta ignorada o no relevante

### 📡 Ejemplos de Uso

#### 1. Generar Alertas Automáticas (POST /alerts/generate)

**⚠️ Solo administradores**

```bash
curl -X POST http://localhost:3000/alerts/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Alertas generadas exitosamente",
  "data": {
    "totalGenerated": 8,
    "byPriority": {
      "urgente": 2,
      "alta": 3,
      "media": 2,
      "baja": 1
    },
    "alerts": [
      {
        "id": "alert_1234567890_abc",
        "type": "stock_low",
        "priority": "urgente",
        "productName": "Cuaderno Profesional",
        "currentStock": 0,
        "minThreshold": 20,
        "message": "Producto agotado: Cuaderno Profesional en Papelería"
      }
    ]
  }
}
```

**Características:**
- ✅ Analiza todo el inventario
- ✅ Solo productos con `availability: "limited"`
- ✅ No genera alertas duplicadas
- ✅ Asigna prioridad automáticamente según umbrales

#### 2. Listar Alertas con Filtros (GET /alerts)

```bash
# Todas las alertas
curl -X GET http://localhost:3000/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Con filtros
curl -X GET "http://localhost:3000/alerts?status=pendiente&priority=urgente&page=1&limit=10&sortBy=date&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Parámetros disponibles:**
- `status` - `pendiente`, `en_proceso`, `atendido`, `descartado`
- `priority` - `critica`, `urgente`, `media`, `baja`
- `startDate` / `endDate` - Rango de fechas (YYYY-MM-DD)
- `page` / `limit` - Paginación (default: 1, 50)
- `sortBy` - `date`, `priority`, `productName`
- `sortOrder` - `asc`, `desc`

**Respuesta:**
```json
{
  "success": true,
  "message": "Alertas obtenidas exitosamente",
  "data": {
    "alerts": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalAlerts": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    },
    "summary": {
      "total": 25,
      "byStatus": {
        "pendiente": 10,
        "en_proceso": 8,
        "atendido": 5,
        "descartado": 2
      },
      "byPriority": {
        "urgente": 3,
        "alta": 8,
        "media": 10,
        "baja": 4
      }
    }
  }
}
```

#### 3. Obtener Última Alerta Crítica (GET /alerts/latest-critical)

```bash
curl -X GET http://localhost:3000/alerts/latest-critical \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta (con alerta):**
```json
{
  "success": true,
  "data": {
    "hasAlert": true,
    "alert": {
      "id": "alert_1234567890_abc",
      "type": "stock_low",
      "priority": "urgente",
      "status": "pendiente",
      "productName": "Cuaderno Profesional",
      "currentStock": 0,
      "message": "Producto agotado: Cuaderno Profesional en Papelería",
      "createdAt": "2025-11-10T10:30:00.000Z"
    }
  }
}
```

**Respuesta (sin alertas):**
```json
{
  "success": true,
  "data": {
    "hasAlert": false,
    "alert": null
  }
}
```

#### 4. Obtener Alerta Específica (GET /alerts/:alertId)

```bash
curl -X GET http://localhost:3000/alerts/alert_1234567890_abc \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "alert_1234567890_abc",
    "type": "stock_low",
    "priority": "urgente",
    "status": "en_proceso",
    "productName": "Cuaderno Profesional",
    "currentStock": 0,
    "message": "Producto agotado",
    "createdAt": "2025-11-10T10:30:00.000Z",
    "updatedAt": "2025-11-10T11:00:00.000Z",
    "actions": [
      {
        "actionType": "status_change",
        "previousStatus": "pendiente",
        "newStatus": "en_proceso",
        "userId": "user_123",
        "userName": "Juan Pérez",
        "timestamp": "2025-11-10T11:00:00.000Z",
        "notes": "Revisando inventario"
      }
    ]
  }
}
```

#### 5. Actualizar Estado de Alerta (PUT /alerts/:alertId/status)

```bash
curl -X PUT http://localhost:3000/alerts/alert_1234567890_abc/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "atendido",
    "notes": "Se realizó pedido al proveedor. Llegará en 3 días."
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Estado de alerta actualizado a: atendido",
  "data": {
    "id": "alert_1234567890_abc",
    "status": "atendido",
    "resolvedAt": "2025-11-10T12:00:00.000Z",
    "resolvedBy": "user_123",
    "lastAction": {
      "actionType": "status_change",
      "previousStatus": "en_proceso",
      "newStatus": "atendido",
      "userName": "Juan Pérez",
      "notes": "Se realizó pedido al proveedor. Llegará en 3 días."
    }
  }
}
```

#### 6. Marcar Todas como Atendidas (PUT /alerts/mark-all-read)

```bash
# Sin filtros (todas las alertas)
curl -X PUT http://localhost:3000/alerts/mark-all-read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'

# Con filtros
curl -X PUT http://localhost:3000/alerts/mark-all-read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "filters": {
      "priority": "baja",
      "status": "pendiente"
    },
    "notes": "Revisión masiva de alertas"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "15 alertas marcadas como atendidas",
  "data": {
    "totalProcessed": 15,
    "byPriority": {
      "urgente": 0,
      "alta": 2,
      "media": 5,
      "baja": 8
    },
    "timestamp": "2025-11-10T13:00:00.000Z"
  }
}
```

#### 7. Obtener Contadores (GET /alerts/count)

```bash
curl -X GET http://localhost:3000/alerts/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 10,
    "inProgress": 8,
    "resolved": 7,
    "byStatus": {
      "pendiente": 10,
      "en_proceso": 8,
      "atendido": 5,
      "descartado": 2
    },
    "byPriority": {
      "urgente": 3,
      "alta": 8,
      "media": 10,
      "baja": 4
    },
    "criticalAlerts": 11,
    "lastUpdated": "2025-11-10T13:00:00.000Z"
  }
}
```

#### 8. Configurar Umbrales (PUT /alerts/settings/thresholds)

**⚠️ Solo administradores**

```bash
curl -X PUT http://localhost:3000/alerts/settings/thresholds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "stockThresholds": {
      "urgente": 0,
      "alta": 5,
      "media": 15,
      "baja": 25
    }
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Umbrales actualizados exitosamente",
  "data": {
    "stockThresholds": {
      "urgente": 0,
      "alta": 5,
      "media": 15,
      "baja": 25
    },
    "updatedAt": "2025-11-10T14:00:00.000Z",
    "updatedBy": "admin_user_id"
  }
}
```

#### 9. Obtener Historial (GET /alerts/history)

```bash
# Historial general
curl -X GET http://localhost:3000/alerts/history \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filtrado por mes
curl -X GET "http://localhost:3000/alerts/history?month=2025-11&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_1234567890_abc",
        "productName": "Cuaderno Profesional",
        "priority": "urgente",
        "finalStatus": "atendido",
        "createdAt": "2025-11-10T10:30:00.000Z",
        "resolvedAt": "2025-11-10T12:00:00.000Z",
        "resolutionTime": 5400000,
        "resolvedBy": "user_123"
      }
    ],
    "metrics": {
      "totalResolved": 45,
      "averageResolutionTime": 7200000,
      "resolvedByStatus": {
        "atendido": 38,
        "descartado": 7
      },
      "fastestResolution": 1800000,
      "slowestResolution": 86400000
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "total": 45
    }
  }
}
```

#### 10. Eliminar Alerta (DELETE /alerts/:alertId)

**⚠️ Solo administradores**

```bash
curl -X DELETE http://localhost:3000/alerts/alert_1234567890_abc \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Alerta eliminada exitosamente",
  "data": {
    "deletedAlertId": "alert_1234567890_abc",
    "deletedAt": "2025-11-10T15:00:00.000Z",
    "deletedBy": "admin_user_id"
  }
}
```

### ⚙️ Configuración de Alertas

**Umbrales por defecto:**
- **Urgente**: 0 unidades (stock agotado)
- **Alta**: 5 unidades
- **Media**: 10 unidades
- **Baja**: 20 unidades

**Script de configuración inicial:**
```bash
node backend/scripts/setupAlerts.js
```

### 🔄 Generación Automática de Alertas

Las alertas se generan automáticamente cuando:
1. Se actualiza el stock de un producto (`POST /inventory/:id/stock`)
2. Se ejecuta manualmente (`POST /alerts/generate`)

**Lógica de prioridad automática:**
```javascript
if (currentStock === 0) {
  priority = 'urgente'  // Stock agotado
} else if (currentStock < 10) {
  priority = 'alta'     // Stock crítico
} else {
  priority = 'media'    // Stock bajo
}
```

**Prevención de duplicados:**
- No se crean alertas duplicadas para el mismo producto
- Solo se genera una nueva alerta cuando la anterior está resuelta o descartada

### ⚠️ Validaciones de Alertas

**Errores comunes:**

1. **Campo requerido faltante:**
```json
{
  "success": false,
  "error": "El campo status es requerido",
  "code": "MISSING_STATUS",
  "validStatuses": ["pendiente", "en_proceso", "atendido", "descartado"]
}
```

2. **Estado inválido:**
```json
{
  "success": false,
  "error": "Estado inválido",
  "code": "INVALID_STATUS",
  "validStatuses": ["pendiente", "en_proceso", "atendido", "descartado"]
}
```

3. **Alerta no encontrada:**
```json
{
  "success": false,
  "error": "Alerta no encontrada",
  "code": "ALERT_NOT_FOUND"
}
```

4. **Umbrales inválidos:**
```json
{
  "success": false,
  "error": "Valores de umbral inválidos. Deben estar en orden ascendente",
  "code": "INVALID_THRESHOLDS"
}
```

### 📊 Casos de Uso del Sistema de Alertas

**1. Dashboard de Monitoreo**
```bash
# Ver contadores generales
curl -X GET http://localhost:3000/alerts/count \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver última alerta crítica
curl -X GET http://localhost:3000/alerts/latest-critical \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. Flujo de Resolución de Alertas**
```bash
# 1. Ver alertas pendientes urgentes
curl -X GET "http://localhost:3000/alerts?status=pendiente&priority=urgente" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Marcar como "en proceso"
curl -X PUT http://localhost:3000/alerts/alert_123/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "en_proceso", "notes": "Realizando pedido"}'

# 3. Actualizar stock cuando llega el pedido
curl -X POST http://localhost:3000/inventory/prod_123/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"type": "entrada", "quantity": 100, "reason": "Reposición"}'

# 4. Marcar alerta como atendida
curl -X PUT http://localhost:3000/alerts/alert_123/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "atendido", "notes": "Stock repuesto exitosamente"}'
```

**3. Verificación Programada**
```bash
# Ejecutar verificación diaria (puede usarse en cron job)
curl -X POST http://localhost:3000/alerts/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**4. Análisis de Historial**
```bash
# Ver métricas del mes
curl -X GET "http://localhost:3000/alerts/history?month=2025-11" \
  -H "Authorization: Bearer YOUR_TOKEN"
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
│   │   ├── authController.js         # Lógica de autenticación
│   │   ├── inventoryController.js    # Lógica de inventario
│   │   ├── categoriesController.js   # Lógica de categorías
│   │   ├── salesController.js        # Lógica de ventas
│   │   ├── customersController.js    # Lógica de clientes
│   │   └── analysisController.js     # Lógica de análisis
│   ├── middleware/
│   │   └── auth.js                   # Middleware de autenticación + requireAdminAccess
│   ├── routes/
│   │   ├── authRoutes.js             # Rutas de autenticación
│   │   ├── inventoryRoutes.js        # Rutas de inventario
│   │   ├── categoriesRoutes.js       # Rutas de categorías
│   │   ├── salesRoutes.js            # Rutas de ventas
│   │   ├── customersRoutes.js        # Rutas de clientes
│   │   └── analysisRoutes.js         # Rutas de análisis
│   └── scripts/
│       ├── setupDatabase.js          # Configuración inicial
│       ├── setupInventory.js         # Configuración del módulo de inventario
│       ├── setupSales.js             # Configuración del módulo de ventas
│       └── updateAdminPassword.js    # Actualizar contraseña admin
├── test/
│   ├── auth.test.js                  # Pruebas de autenticación
│   ├── inventory.test.js             # Pruebas del inventario
│   ├── sales.test.js                 # Pruebas del sistema de ventas
│   └── customers.test.js             # Pruebas del sistema de clientes
├── .env                              # Variables de entorno
├── firebaseConfig.js                 # Configuración Firebase
├── index.js                          # Servidor principal
├── package.json                      # Dependencias
└── serviceAccountKey.json            # Credenciales Firebase
```
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
