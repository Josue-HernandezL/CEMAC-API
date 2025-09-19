require('dotenv').config();
const { db, auth } = require('../../firebaseConfig');
const bcrypt = require('bcryptjs');

const updateAdminPassword = async () => {
  try {
    console.log(' Actualizando hash de contraseña para admin existente...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'jh6466011@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    
    // Buscar usuario por email
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log(` Usuario encontrado: ${userRecord.email}`);
    
    // Generar hash de contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Actualizar en Realtime Database
    const userRef = db.ref(`users/${userRecord.uid}`);
    await userRef.update({
      passwordHash: hashedPassword,
      updatedAt: new Date().toISOString()
    });
    
    console.log(' Hash de contraseña actualizado correctamente');
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${adminEmail}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    process.exit(1);
  }
};

updateAdminPassword();