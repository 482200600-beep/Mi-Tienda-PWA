const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Configuración para producción
if (process.env.NODE_ENV !== 'production') {
  // Desarrollo: usa el archivo JSON
  const serviceAccount = require('./firebase-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // Producción: usa variables de entorno
  admin.initializeApp({
    credential: admin.credential.cert({
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID,
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
    })
  });
}

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Tus rutas aquí...
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '¡Backend en la nube funcionando!',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/productos', async (req, res) => {
  try {
    const productosRef = db.collection('productos');
    const snapshot = await productosRef.get();
    
    const productos = [];
    snapshot.forEach(doc => {
      productos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, productos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usa el puerto que provea el hosting o 3001 por defecto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
