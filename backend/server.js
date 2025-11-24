const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// IMPORTANTE: Configuración para Render
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID || "e-commerce-pwa-con-react",
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "b314531d71b676a93b13040b5f570a5c59f9daed",
    "private_key": (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@e-commerce-pwa-con-react.iam.gserviceaccount.com",
    "client_id": process.env.FIREBASE_CLIENT_ID || "113511841051115242475",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40e-commerce-pwa-con-react.iam.gserviceaccount.com"
  })
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// TUS RUTAS (mantén las que ya tienes)
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '¡Backend en Render funcionando!',
    timestamp: new Date().toISOString()
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
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RUTAS DEL CARRITO (mantén las que ya tienes)
app.post('/api/carrito/agregar', async (req, res) => {
  // ... tu código existente
});

app.get('/api/carrito/:usuarioId', async (req, res) => {
  // ... tu código existente
});

// IMPORTANTE para Render
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
