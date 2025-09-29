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

// GET ALL USERS - Solo administradores pueden ver todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    // Verificar que el usuario autenticado sea administrador (ya verificado por middleware)
    
    // Obtener todos los usuarios de Realtime Database
    const usersRef = db.ref('users');
    const usersSnapshot = await usersRef.once('value');
    const usersData = usersSnapshot.val();

    if (!usersData) {
      return res.json({
        success: true,
        users: [],
        message: 'No hay usuarios registrados'
      });
    }

    // Convertir objeto a array y agregar información adicional de Firebase Auth
    const users = [];
    
    for (const uid in usersData) {
      try {
        // Obtener información adicional de Firebase Auth
        const userRecord = await auth.getUser(uid);
        
        const userData = usersData[uid];
        
        users.push({
          uid: uid,
          email: userData.email || userRecord.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || 'user',
          isActive: userData.isActive !== false,
          createdAt: userData.createdAt || null,
          lastLogin: userData.lastLogin || null,
          emailVerified: userRecord.emailVerified || false
        });
      } catch (authError) {
        // Si hay error obteniendo datos de Firebase Auth, usar solo datos de Database
        console.warn(`Error obteniendo datos de Auth para usuario ${uid}:`, authError.message);
        
        const userData = usersData[uid];
        users.push({
          uid: uid,
          email: userData.email || 'N/A',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || 'user',
          isActive: userData.isActive !== false,
          createdAt: userData.createdAt || null,
          lastLogin: userData.lastLogin || null,
          emailVerified: false
        });
      }
    }

    // Ordenar usuarios por fecha de creación (más recientes primero)
    users.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      users: users,
      message: 'Usuarios obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo todos los usuarios:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los usuarios'
    });
  }
};

// UPDATE USER STATUS - Solo administradores pueden activar/desactivar usuarios
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const adminUid = req.user.uid;

    // Validaciones básicas
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo isActive debe ser un valor booleano (true/false)'
      });
    }

    // Verificar que el admin no se esté desactivando a sí mismo
    if (userId === adminUid && !isActive) {
      return res.status(403).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    // Verificar que el usuario a modificar existe
    const targetUserRef = db.ref(`users/${userId}`);
    const targetUserSnapshot = await targetUserRef.once('value');
    
    if (!targetUserSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const targetUserData = targetUserSnapshot.val();

    // Actualizar el estado del usuario
    const updateData = {
      isActive: isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUid
    };

    // Si se está desactivando, agregar información de desactivación
    if (!isActive) {
      updateData.deactivatedAt = new Date().toISOString();
      updateData.deactivatedBy = adminUid;
    } else {
      // Si se está reactivando, limpiar información de desactivación
      updateData.deactivatedAt = null;
      updateData.deactivatedBy = null;
      updateData.reactivatedAt = new Date().toISOString();
      updateData.reactivatedBy = adminUid;
    }

    await targetUserRef.update(updateData);

    // También actualizar en Firebase Auth si es necesario (deshabilitar/habilitar usuario)
    try {
      await auth.updateUser(userId, {
        disabled: !isActive
      });
    } catch (authError) {
      console.warn(`No se pudo actualizar el estado en Firebase Auth para usuario ${userId}:`, authError.message);
      // Continuamos aunque falle Firebase Auth, ya que el estado en la DB ya se actualizó
    }

    // Preparar respuesta
    const updatedUser = {
      uid: userId,
      email: targetUserData.email,
      firstName: targetUserData.firstName || '',
      lastName: targetUserData.lastName || '',
      role: targetUserData.role,
      isActive: isActive
    };

    res.json({
      success: true,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      user: updatedUser
    });

    // Log de la acción para auditoría
    console.log(`Admin ${adminUid} ${isActive ? 'activó' : 'desactivó'} al usuario ${userId} (${targetUserData.email})`);

  } catch (error) {
    console.error('Error actualizando estado del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE USER ROLE - Solo administradores pueden cambiar roles de usuarios
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminUid = req.user.uid;

    // Validaciones básicas
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Campo role es requerido'
      });
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Los roles permitidos son: admin, user'
      });
    }

    // Verificar que el usuario a modificar existe
    const targetUserRef = db.ref(`users/${userId}`);
    const targetUserSnapshot = await targetUserRef.once('value');
    
    if (!targetUserSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const targetUserData = targetUserSnapshot.val();

    // Verificar que el admin no se esté quitando sus propios privilegios
    if (userId === adminUid && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No puedes quitarte tus propios privilegios de administrador'
      });
    }

    // Verificar si el rol ya es el mismo
    if (targetUserData.role === role) {
      return res.status(400).json({
        success: false,
        message: `El usuario ya tiene el rol "${role}"`
      });
    }

    // Actualizar el rol del usuario
    const updateData = {
      role: role,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUid,
      roleChangedAt: new Date().toISOString(),
      roleChangedBy: adminUid,
      previousRole: targetUserData.role
    };

    await targetUserRef.update(updateData);

    // También actualizar custom claims en Firebase Auth para consistencia
    try {
      await auth.setCustomUserClaims(userId, {
        role: role,
        email: targetUserData.email
      });
    } catch (authError) {
      console.warn(`No se pudieron actualizar los custom claims para usuario ${userId}:`, authError.message);
      // Continuamos aunque falle, ya que el rol en la DB ya se actualizó
    }

    // Preparar respuesta
    const updatedUser = {
      uid: userId,
      email: targetUserData.email,
      firstName: targetUserData.firstName || '',
      lastName: targetUserData.lastName || '',
      role: role,
      isActive: targetUserData.isActive !== false
    };

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      user: updatedUser
    });

    // Log de la acción para auditoría
    console.log(`Admin ${adminUid} cambió el rol del usuario ${userId} (${targetUserData.email}) de "${targetUserData.role}" a "${role}"`);

  } catch (error) {
    console.error('Error actualizando rol del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE USER PROFILE BY ADMIN - Solo administradores pueden actualizar perfiles de otros usuarios
const updateUserProfileByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName } = req.body;
    const adminUid = req.user.uid;

    // Validaciones básicas
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }

    // Verificar que al menos un campo esté presente para actualizar
    if (!firstName && !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos firstName o lastName para actualizar'
      });
    }

    // Verificar que el usuario a modificar existe
    const targetUserRef = db.ref(`users/${userId}`);
    const targetUserSnapshot = await targetUserRef.once('value');
    
    if (!targetUserSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const targetUserData = targetUserSnapshot.val();

    // Preparar datos de actualización
    const updateData = {
      updatedAt: new Date().toISOString(),
      updatedBy: adminUid
    };

    // Solo actualizar los campos que se proporcionaron
    if (firstName !== undefined) {
      updateData.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName.trim();
    }

    // Actualizar el perfil del usuario
    await targetUserRef.update(updateData);

    // Obtener los datos actualizados para la respuesta
    const updatedUserSnapshot = await targetUserRef.once('value');
    const updatedUserData = updatedUserSnapshot.val();

    // Preparar respuesta
    const responseUser = {
      uid: userId,
      firstName: updatedUserData.firstName || '',
      lastName: updatedUserData.lastName || '',
      updatedAt: updatedUserData.updatedAt
    };

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: responseUser
    });

    // Log de la acción para auditoría
    const changedFields = [];
    if (firstName !== undefined) changedFields.push(`firstName: "${firstName}"`);
    if (lastName !== undefined) changedFields.push(`lastName: "${lastName}"`);
    
    console.log(`Admin ${adminUid} actualizó el perfil del usuario ${userId} (${targetUserData.email}): ${changedFields.join(', ')}`);

  } catch (error) {
    console.error('Error actualizando perfil del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  login,
  register,
  recover,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserProfileByAdmin,
  createUserWithEmailAndPassword
};