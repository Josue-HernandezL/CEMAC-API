const { auth, db } = require('../../firebaseConfig');
const bcrypt = require('bcryptjs');

// Función para crear un usuario en Firebase Auth y Realtime Database
const createUserWithEmailAndPassword = async (email, password, userData) => {
  try {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false,
      disabled: false
    });

    // Guardar datos adicionales en Realtime Database (incluyendo hash de contraseña)
    const userRef = db.ref(`users/${userRecord.uid}`);
    await userRef.set({
      email: email,
      passwordHash: hashedPassword, // Almacenamos el hash para poder verificar login
      role: userData.role || 'user',
      isActive: userData.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    });

    return { uid: userRecord.uid, email: email };
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
};

// LOGIN - Verificar credenciales y generar token personalizado
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email en Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Obtener datos del usuario desde Realtime Database
    const userRef = db.ref(`users/${userRecord.uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo
    if (userData.isActive === false) {
      return res.status(403).json({ error: 'Cuenta desactivada. Contacte al administrador' });
    }

    // Verificar contraseña usando el hash almacenado
    if (!userData.passwordHash) {
      return res.status(401).json({ error: 'Error de autenticación. Contacte al administrador' });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token personalizado
    const customToken = await auth.createCustomToken(userRecord.uid, {
      role: userData.role,
      email: userData.email
    });

    // Actualizar último acceso
    await userRef.update({
      lastLogin: new Date().toISOString()
    });

    res.json({
      message: 'Login exitoso',
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// REGISTER - Solo administradores pueden registrar usuarios
const register = async (req, res) => {
  try {
    const { email, password, role = 'user', firstName, lastName } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar que el usuario autenticado sea administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden registrar usuarios' });
    }

    // Verificar si el email ya existe
    try {
      await auth.getUserByEmail(email);
      return res.status(400).json({ error: 'El email ya está registrado' });
    } catch (error) {
      // Si no encuentra el usuario, es bueno, podemos continuar
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Crear usuario
    const newUser = await createUserWithEmailAndPassword(email, password, {
      role: role,
      firstName: firstName || '',
      lastName: lastName || '',
      isActive: true,
      createdBy: req.user.uid,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        uid: newUser.uid,
        email: newUser.email,
        role: role,
        isActive: true
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Email inválido' });
    } else if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Contraseña muy débil' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// RECOVER - Enviar email de recuperación de contraseña
const recover = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Verificar que el usuario existe
    try {
      const userRecord = await auth.getUserByEmail(email);
      
      // Verificar que el usuario esté activo
      const userRef = db.ref(`users/${userRecord.uid}`);
      const userSnapshot = await userRef.once('value');
      const userData = userSnapshot.val();

      if (!userData || userData.isActive === false) {
        return res.status(403).json({ error: 'Cuenta desactivada o no encontrada' });
      }

      // Generar link de recuperación
      const resetLink = await auth.generatePasswordResetLink(email);

      // Registrar solicitud de recuperación
      const recoveryRef = db.ref(`recoveryRequests/${userRecord.uid}`);
      await recoveryRef.set({
        email: email,
        requestedAt: new Date().toISOString(),
        resetLink: resetLink,
        used: false
      });

      res.json({
        message: 'Se ha enviado un enlace de recuperación a tu email',
        resetLink: resetLink // En producción, esto se enviaría por email
      });

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Por seguridad, no revelamos si el email existe o no
        return res.json({
          message: 'Si el email existe en nuestro sistema, se ha enviado un enlace de recuperación'
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error en recuperación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PROFILE - Obtener información del perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const { uid } = req.user;

    // Obtener datos actualizados del usuario
    const userRef = db.ref(`users/${uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      return res.status(404).json({ error: 'Datos de perfil no encontrados' });
    }

    // Obtener información adicional de Firebase Auth
    const userRecord = await auth.getUser(uid);

    res.json({
      profile: {
        uid: uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        role: userData.role,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
        updatedAt: userData.updatedAt
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función auxiliar para actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { firstName, lastName } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    const userRef = db.ref(`users/${uid}`);
    await userRef.update(updateData);

    res.json({
      message: 'Perfil actualizado exitosamente',
      updatedFields: updateData
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  login,
  register,
  recover,
  getProfile,
  updateProfile,
  createUserWithEmailAndPassword
};