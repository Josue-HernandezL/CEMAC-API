const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // App Password de Gmail
    },
    secure: true,
    port: 465
  });
};

// Plantilla HTML para el email de recuperación de contraseña
const createPasswordResetEmailTemplate = (resetLink, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecimiento de Contraseña - CEMAC</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #4CAF50;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 10px;
            }
            h1 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 28px;
            }
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                color: #555;
            }
            .reset-button {
                display: inline-block;
                background-color: #4CAF50;
                color: white !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .reset-button:hover {
                background-color: #45a049;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
                text-align: center;
            }
            .security-info {
                background-color: #e8f5e8;
                border-left: 4px solid #4CAF50;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 5px 5px 0;
            }
            .link-container {
                text-align: center;
                margin: 30px 0;
            }
            .alternative-link {
                word-break: break-all;
                color: #666;
                font-size: 12px;
                margin-top: 15px;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 3px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏪 CEMAC</div>
                <h1>Restablecimiento de Contraseña</h1>
            </div>
            
            <div class="message">
                <p>Hola,</p>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada con el email: <strong>${userEmail}</strong></p>
                <p>Si fuiste tú quien solicitó este cambio, haz clic en el botón de abajo para continuar:</p>
            </div>

            <div class="link-container">
                <a href="${resetLink}" class="reset-button">
                    🔐 Restablecer Contraseña
                </a>
                
                <div class="alternative-link">
                    <p><strong>¿No puedes hacer clic en el botón?</strong></p>
                    <p>Copia y pega este enlace en tu navegador:</p>
                    <p>${resetLink}</p>
                </div>
            </div>

            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                    <li>Este enlace expira en <strong>1 hora</strong></li>
                    <li>Solo puede ser usado una vez</li>
                    <li>Si no solicitaste este cambio, ignora este email</li>
                    <li>Tu contraseña actual permanecerá sin cambios</li>
                </ul>
            </div>

            <div class="security-info">
                <strong>🔒 Consejos de seguridad:</strong>
                <ul>
                    <li>Nunca compartas tu contraseña con nadie</li>
                    <li>Usa una contraseña única y segura</li>
                    <li>Si sospechas actividad no autorizada, contacta a soporte inmediatamente</li>
                </ul>
            </div>

            <div class="footer">
                <p><strong>CEMAC - Sistema de Gestión</strong></p>
                <p>Este es un email automático, por favor no responder a este mensaje.</p>
                <p>Si necesitas ayuda, contacta al administrador del sistema.</p>
                <p><small>© ${new Date().getFullYear()} CEMAC. Todos los derechos reservados.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Función para enviar email de recuperación de contraseña
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      throw new Error('Variables de entorno de email no configuradas. Verifique EMAIL_USER y EMAIL_APP_PASSWORD.');
    }

    const transporter = createTransporter();

    // Verificar la conexión del transportador
    await transporter.verify();
    console.log('✅ Servidor de email listo para enviar mensajes');

    // Configurar las opciones del email
    const mailOptions = {
      from: {
        name: 'CEMAC - Sistema de Gestión',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Restablecimiento de Contraseña - CEMAC',
      html: createPasswordResetEmailTemplate(resetLink, email),
      text: `
        CEMAC - Restablecimiento de Contraseña
        
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta (${email}).
        
        Para continuar, visita el siguiente enlace:
        ${resetLink}
        
        Este enlace expira en 1 hora y solo puede ser usado una vez.
        
        Si no solicitaste este cambio, ignora este email.
        
        CEMAC - Sistema de Gestión
      `
    };

    // Enviar el email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email de recuperación enviado exitosamente:', {
      messageId: result.messageId,
      to: email,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email enviado exitosamente'
    };

  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    
    // Categorizar diferentes tipos de errores
    if (error.code === 'EAUTH') {
      throw new Error('Error de autenticación del email. Verifique las credenciales de EMAIL_USER y EMAIL_APP_PASSWORD.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Error de conexión con el servidor de email. Verifique su conexión a internet.');
    } else if (error.code === 'EMESSAGE') {
      throw new Error('Error en el formato del mensaje de email.');
    } else {
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }
};

// Función para validar configuración de email
const validateEmailConfig = () => {
  const requiredVars = ['EMAIL_USER', 'EMAIL_APP_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Variables de entorno de email faltantes:', missingVars);
    return false;
  }
  
  console.log('✅ Configuración de email validada correctamente');
  return true;
};

module.exports = {
  sendPasswordResetEmail,
  validateEmailConfig
};