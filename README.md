# CEMAC API - Sistema de Autenticación

API REST con autenticación Firebase que permite que solo un administrador pueda registrar usuarios en el sistema.

## 🚀 Características

- ✅ Autenticación con Firebase Auth
- ✅ Solo administradores pueden registrar usuarios
- ✅ Gestión de sesiones con tokens Firebase
- ✅ Recuperación de contraseña
- ✅ Base de datos Firebase Realtime Database
- ✅ Middleware de autorización
- ✅ Endpoints RESTful

## 📋 Endpoints Disponibles

### Públicos (no requieren autenticación)
- `POST /auth/login` - Iniciar sesión
- `POST /auth/recover` - Recuperar contraseña

### Protegidos (requieren token)
- `GET /auth/profile` - Obtener perfil del usuario
- `PUT /auth/profile` - Actualizar perfil del usuario
- `GET /auth/verify` - Verificar token válido

### Solo Administradores
- `POST /auth/register` - Registrar nuevo usuario

## 🛠️ Instalación

### 1. Clonar y configurar

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
copy .env.example .env
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto o usa uno existente
3. Descarga el archivo `serviceAccountKey.json`
4. Colócalo en la raíz del proyecto
5. Habilita Realtime Database en modo de prueba

### 3. Configurar administrador inicial

Edita el archivo `.env` con las credenciales del administrador:

```env
ADMIN_EMAIL=admin@cemac.com
ADMIN_PASSWORD=admin123456
ADMIN_FIRST_NAME=Administrador
ADMIN_LAST_NAME=CEMAC
```

### 4. Ejecutar configuración inicial

```bash
pnpm run setup
```

Este comando creará:
- Usuario administrador inicial
- Estructura de base de datos
- Configuración inicial del sistema

### 5. Iniciar servidor

```bash
# Desarrollo
pnpm run dev

# Producción
pnpm start
```

## 📡 Uso de la API

### Login (POST /auth/login)

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

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Servidor
PORT=3000
NODE_ENV=development

# Administrador inicial
ADMIN_EMAIL=admin@cemac.com
ADMIN_PASSWORD=admin123456
ADMIN_FIRST_NAME=Administrador
ADMIN_LAST_NAME=CEMAC

# Opcional
JWT_SECRET=tu_jwt_secret
SESSION_SECRET=tu_session_secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

### Estructura de Base de Datos

```
/
├── users/
│   └── {uid}/
│       ├── email: string
│       ├── role: "admin" | "user"
│       ├── firstName: string
│       ├── lastName: string
│       ├── isActive: boolean
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── lastLogin: timestamp
├── config/
│   ├── settings/
│   └── roles/
└── recoveryRequests/
    └── {uid}/
        ├── email: string
        ├── requestedAt: timestamp
        ├── resetLink: string
        └── used: boolean
```

## 🔐 Seguridad

- Todos los tokens son manejados por Firebase Auth
- Middleware de autenticación en todas las rutas protegidas
- Validación de permisos por roles
- Verificación de usuarios activos
- Hash de contraseñas con bcrypt (backup)

## 🧪 Testing

Usa herramientas como Postman, Insomnia o curl para probar los endpoints.

### Headers requeridos para rutas protegidas:
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json
```

## 📝 Scripts Disponibles

- `pnpm start` - Iniciar en producción
- `pnpm run dev` - Desarrollo con nodemon
- `pnpm run setup` - Configuración inicial de BD y admin



## 📄 Licencia

ISC License

## 🆘 Soporte

Para soporte técnico, contacta al equipo de CEMAC o crea un issue en el repositorio.
