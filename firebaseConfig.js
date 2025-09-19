const admin = require("firebase-admin");
const path = require("path");

// Cargar las credenciales de Firebase
const serviceAccount = require("./serviceAccountKey.json");

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cemac-35ddf-default-rtdb.firebaseio.com"
});

// Exportar referencias útiles
const db = admin.database();
const auth = admin.auth();

module.exports = { admin, db, auth };
