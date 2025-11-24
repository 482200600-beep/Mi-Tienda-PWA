const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// CONFIGURACIÓN FIREBASE PARA RENDER
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
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40e-commerce-pwa-con-react.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  })
});

const db = admin.firestore();
const app = express();

// CORS MEJORADO - Permite todas las origins (para testing)
app.use(cors({
  origin: true,  // Permite todas las origins
  credentials: true
}));

app.use(express.json());

// RUTA DE PRUEBA
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '¡Backend en Render funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// RUTA PARA OBTENER PRODUCTOS
app.get('/api/productos', async (req, res) => {
  try {
    console.log('🔍 Obteniendo productos de Firestore...');
    
    const productosRef = db.collection('productos');
    const snapshot = await productosRef.get();
    
    const productos = [];
    snapshot.forEach(doc => {
      productos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Encontrados ${productos.length} productos`);
    res.json({ 
      success: true, 
      productos,
      count: productos.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Error al conectar con la base de datos'
    });
  }
});

// RUTAS DEL CARRITO

// 1. Agregar producto al carrito
app.post('/api/carrito/agregar', async (req, res) => {
  try {
    const { usuarioId, productoId, cantidad = 1 } = req.body;

    if (!usuarioId || !productoId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan usuarioId o productoId' 
      });
    }

    // Verificar si el producto existe
    const productoDoc = await db.collection('productos').doc(productoId).get();
    if (!productoDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Producto no encontrado' 
      });
    }

    const producto = productoDoc.data();

    // Verificar si el producto ya está en el carrito del usuario
    const carritoSnapshot = await db.collection('carrito')
      .where('usuarioId', '==', usuarioId)
      .where('productoId', '==', productoId)
      .get();

    let resultado;
    
    if (!carritoSnapshot.empty) {
      // Actualizar cantidad si ya existe
      const item = carritoSnapshot.docs[0];
      const nuevaCantidad = item.data().cantidad + parseInt(cantidad);
      
      resultado = await db.collection('carrito').doc(item.id).update({
        cantidad: nuevaCantidad,
        actualizado: new Date()
      });
    } else {
      // Agregar nuevo item al carrito
      const carritoItem = {
        usuarioId,
        productoId,
        productoNombre: producto.nombre,
        productoPrecio: producto.precio,
        productoImagen: producto.imagen,
        cantidad: parseInt(cantidad),
        creado: new Date(),
        actualizado: new Date()
      };
      
      resultado = await db.collection('carrito').add(carritoItem);
    }

    res.json({ 
      success: true, 
      message: 'Producto agregado al carrito'
    });

  } catch (error) {
    console.error('Error agregando al carrito:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 2. Obtener carrito del usuario
app.get('/api/carrito/:usuarioId', async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;

    const carritoSnapshot = await db.collection('carrito')
      .where('usuarioId', '==', usuarioId)
      .get();

    const carrito = [];
    let total = 0;

    carritoSnapshot.forEach(doc => {
      const item = {
        id: doc.id,
        ...doc.data()
      };
      carrito.push(item);
      total += item.productoPrecio * item.cantidad;
    });

    res.json({ 
      success: true, 
      carrito,
      total,
      cantidadItems: carrito.length
    });

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 3. Eliminar item del carrito
app.delete('/api/carrito/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;

    await db.collection('carrito').doc(itemId).delete();

    res.json({ 
      success: true, 
      message: 'Producto eliminado del carrito' 
    });

  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 4. Actualizar cantidad en carrito
app.put('/api/carrito/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { cantidad } = req.body;

    if (cantidad <= 0) {
      // Si la cantidad es 0 o menor, eliminar el item
      await db.collection('carrito').doc(itemId).delete();
      return res.json({ 
        success: true, 
        message: 'Producto eliminado del carrito' 
      });
    }

    await db.collection('carrito').doc(itemId).update({
      cantidad: parseInt(cantidad),
      actualizado: new Date()
    });

    res.json({ 
      success: true, 
      message: 'Carrito actualizado' 
    });

  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// MANEJO DE ERRORES PARA RUTAS NO ENCONTRADAS
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    availableRoutes: [
      'GET /api/test',
      'GET /api/productos',
      'POST /api/carrito/agregar',
      'GET /api/carrito/:usuarioId',
      'DELETE /api/carrito/:itemId',
      'PUT /api/carrito/:itemId'
    ]
  });
});

// INICIAR SERVIDOR - IMPORTANTE PARA RENDER
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
});
