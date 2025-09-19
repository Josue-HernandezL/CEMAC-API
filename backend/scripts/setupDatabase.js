require('dotenv').config();
const { createUserWithEmailAndPassword } = require('../controllers/authController');
const { db, auth } = require('../../firebaseConfig');

const setupInitialAdmin = async () => {
  try {
    console.log('Iniciando configuración de la base de datos...');
    
    // Configuración del administrador inicial
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cemac.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
    const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Administrador';
    const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'CEMAC';

    console.log(`Creando administrador con email: ${ADMIN_EMAIL}`);

    // Verificar si ya existe un administrador
    try {
      const existingUser = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('El administrador ya existe:', existingUser.email);
      
      // Verificar si tiene rol de admin en la base de datos
      const userRef = db.ref(`users/${existingUser.uid}`);
      const userSnapshot = await userRef.once('value');
      const userData = userSnapshot.val();
      
      if (userData && userData.role === 'admin') {
        console.log('El usuario ya tiene permisos de administrador');
        return;
      } else {
        // Actualizar rol a admin si no lo tiene
        await userRef.update({
          role: 'admin',
          updatedAt: new Date().toISOString()
        });
        console.log('Rol de administrador actualizado para el usuario existente');
        return;
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // Si no existe, continuamos con la creación
    }

    // Crear usuario administrador
    const adminUser = await createUserWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD, {
      role: 'admin',
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    });

    console.log('Administrador creado exitosamente:');
    console.log(`   - UID: ${adminUser.uid}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Rol: admin`);

    // Crear estructura inicial de la base de datos
    console.log('Creando estructura inicial de la base de datos...');
    
    const initialData = {
      settings: {
        appName: 'CEMAC API',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        adminContact: ADMIN_EMAIL
      },
      roles: {
        admin: {
          name: 'Administrador',
          permissions: ['create_users', 'manage_users', 'view_all', 'delete_users'],
          description: 'Acceso completo al sistema'
        },
        user: {
          name: 'Usuario',
          permissions: ['view_profile', 'update_profile'],
          description: 'Usuario estándar del sistema'
        }
      }
    };

    // Guardar configuración inicial
    await db.ref('config').set(initialData);
    console.log('Estructura de base de datos creada');

    console.log('\n Configuración completada exitosamente!');
    console.log('\n Credenciales del administrador:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Contraseña: ${ADMIN_PASSWORD}`);
    console.log('\n IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error(' Error durante la configuración:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log(' El email del administrador ya está en uso');
    } else if (error.code === 'auth/weak-password') {
      console.log(' La contraseña del administrador es muy débil');
    } else {
      console.log(' Verifica que:');
      console.log('   - El archivo serviceAccountKey.json existe y es válido');
      console.log('   - La configuración de Firebase es correcta');
      console.log('   - Tienes conexión a internet');
    }
    
    process.exit(1);
  }
};

// Función para verificar la conexión a Firebase
const verifyFirebaseConnection = async () => {
  try {
    console.log(' Verificando conexión a Firebase...');
    
    // Intentar leer/escribir en la base de datos
    const testRef = db.ref('test');
    await testRef.set({ timestamp: new Date().toISOString() });
    await testRef.remove();
    
    console.log(' Conexión a Firebase establecida correctamente');
    return true;
  } catch (error) {
    console.error(' Error de conexión a Firebase:', error.message);
    return false;
  }
};

// Función principal
const main = async () => {
  try {
    console.log('='.repeat(60));
    console.log('        CEMAC API - CONFIGURACIÓN INICIAL');
    console.log('='.repeat(60));
    
    // Verificar conexión
    const isConnected = await verifyFirebaseConnection();
    if (!isConnected) {
      console.log(' No se pudo conectar a Firebase. Abortando...');
      process.exit(1);
    }

    // Configurar administrador
    await setupInitialAdmin();
    
    console.log('\n='.repeat(60));
    console.log('   CONFIGURACIÓN COMPLETADA');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('Error fatal:', error);
    process.exit(1);
  }
};

// Ejecutar si el script se llama directamente
if (require.main === module) {
  main();
}

module.exports = { setupInitialAdmin, verifyFirebaseConnection };