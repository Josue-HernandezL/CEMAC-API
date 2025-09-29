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

## 📊 Módulo de Análisis de Ventas e Inventario

El módulo de análisis proporciona estadísticas avanzadas y reportes tanto para ventas como para inventario, facilitando la toma de decisiones empresariales.

### 🛒 Endpoints de Análisis de Ventas

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
      }
    ]
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

#### Estadísticas por Período Personalizado (GET /analysis/sales/custom)

```bash
curl -X GET "http://localhost:3000/analysis/sales/custom?startDate=2025-09-01&endDate=2025-09-30&groupBy=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Resumen Ejecutivo (GET /analysis/sales/summary)

```bash
curl -X GET http://localhost:3000/analysis/sales/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 📦 Endpoints de Análisis de Inventario

#### Obtener Análisis Completo de Inventario (GET /analysis/inventory)

Proporciona niveles de stock actuales, productos con bajo stock y distribución por categorías.

```bash
curl -X GET http://localhost:3000/analysis/inventory \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "stockLevels": {
      "labels": ["Libretas", "Lápices", "Plumas", "Pegamento"],
      "values": [120, 350, 200, 80]
    },
    "lowStock": [
      {
        "id": "prod456",
        "name": "Pegamento escolar",
        "currentStock": 80,
        "minThreshold": 100
      }
    ],
    "categoryDistribution": {
      "Papelería": 45,
      "Escolar": 30,
      "Oficina": 25
    }
  },
  "message": "Análisis de inventario obtenido exitosamente"
}
```

**Características del análisis de inventario:**

- **stockLevels**: Top 10 productos ordenados por nivel de stock
- **lowStock**: Productos con stock por debajo del umbral mínimo
- **categoryDistribution**: Distribución porcentual por categorías

#### Obtener Análisis de Rotación (GET /analysis/inventory/rotation)

Analiza la rotación de productos basada en las ventas de los últimos 30 días.

```bash
curl -X GET http://localhost:3000/analysis/inventory/rotation \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "rotationAnalysis": [
      {
        "id": "prod123",
        "name": "Producto A",
        "currentStock": 100,
        "soldLast30Days": 45,
        "rotationRate": 45.0,
        "category": "Papelería"
      }
    ],
    "summary": {
      "totalProducts": 25,
      "averageRotation": 32.5,
      "highRotation": 8,
      "lowRotation": 12
    }
  },
  "message": "Análisis de rotación de inventario obtenido exitosamente"
}
```

**Métricas de rotación:**
- **rotationRate**: Porcentaje de stock vendido en 30 días
- **highRotation**: Productos con rotación > 50%
- **lowRotation**: Productos con rotación < 10%

### 🎯 Casos de Uso del Análisis

**1. Dashboard Ejecutivo**
```bash
# Resumen de ventas
curl -X GET http://localhost:3000/analysis/sales/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Estado del inventario
curl -X GET http://localhost:3000/analysis/inventory \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. Gestión de Stock**
```bash
# Identificar productos con bajo stock
curl -X GET http://localhost:3000/analysis/inventory \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data.lowStock'

# Analizar rotación para reabastecimiento
curl -X GET http://localhost:3000/analysis/inventory/rotation \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Análisis de Categorías**
```bash
# Ver distribución por categorías
curl -X GET http://localhost:3000/analysis/inventory \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data.categoryDistribution'
```

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

3. **Datos insuficientes:**
```json
{
  "success": true,
  "data": {
    "stockLevels": {"labels": [], "values": []},
    "lowStock": [],
    "categoryDistribution": {}
  },
  "message": "Análisis de inventario obtenido exitosamente"
}
```

## 🧪 Testing en servidor de prueba

```bash
# Ejecutar todas las pruebas
pnpm test

# Pruebas específicas de inventario
pnpm test -- inventory

# Pruebas con cobertura de código
pnpm test -- --coverage

# Modo watch (recarga automática)
pnpm test -- --watch
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
│   │   └── inventoryController.js # Lógica de inventario
│   ├── middleware/
│   │   └── auth.js                # Middleware de autenticación + requireAdminAccess
│   ├── routes/
│   │   ├── authRoutes.js          # Rutas de autenticación
│   │   └── inventoryRoutes.js     # Rutas de inventario
│   └── scripts/
│       ├── setupDatabase.js       # Configuración inicial
│       └── updateAdminPassword.js # Actualizar contraseña admin
├── test/
│   └── inventory.test.js          # Pruebas del sistema
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

## 📄 Licencia

ISC License

## 🆘 Soporte

Para soporte técnico, contacta al equipo de CEMAC o crea un issue en el repositorio.
