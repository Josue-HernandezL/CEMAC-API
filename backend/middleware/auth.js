const { auth, db } = require('../../firebaseConfig');

// Middleware para verificar token de Firebase (ID Token o Custom Token)
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    let decodedToken;
    let uid;

    try {
      // Primero intentar verificar como ID Token
      decodedToken = await auth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (error) {
      if (error.code === 'auth/argument-error' && error.message.includes('custom token')) {
        // Si es un custom token, necesitamos decodificarlo de otra manera
        // Los custom tokens están firmados pero necesitamos extraer el UID
        try {
          // Decodificar el custom token (sin verificar, solo para extraer datos)
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(token);
          
          if (!decoded || !decoded.uid) {
            throw new Error('Custom token inválido');
          }
          
          uid = decoded.uid;
          decodedToken = { uid: decoded.uid, ...decoded };
        } catch (customTokenError) {
          console.error('Error decodificando custom token:', customTokenError);
          return res.status(401).json({ error: 'Token inválido' });
        }
      } else {
        throw error;
      }
    }
    
    // Obtener información adicional del usuario desde Realtime Database
    const userRef = db.ref(`users/${uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();
    
    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos' });
    }

    // Agregar información del usuario al request
    req.user = {
      uid: uid,
      email: userData.email,
      role: userData.role || 'user',
      isActive: userData.isActive !== false, // Por defecto true si no está definido
      ...userData
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expirado' });
    } else if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    return res.status(401).json({ error: 'Token no válido' });
  }
};

// Middleware para verificar si el usuario es administrador
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  
  next();
};

// Middleware para verificar si el usuario está activo
const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  
  if (!req.user.isActive) {
    return res.status(403).json({ error: 'Cuenta desactivada. Contacte al administrador' });
  }
  
  next();
};

// Middleware combinado: token válido + usuario activo
const authenticateUser = [verifyFirebaseToken, requireActiveUser];

// Middleware combinado: token válido + usuario activo + admin
const authenticateAdmin = [verifyFirebaseToken, requireActiveUser, requireAdmin];

module.exports = {
  verifyFirebaseToken,
  requireAdmin,
  requireActiveUser,
  authenticateUser,
  authenticateAdmin
};