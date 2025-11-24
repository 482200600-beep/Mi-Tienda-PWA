const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// 1. CARGAR CREDENCIALES DE FIREBASE
const serviceAccount = require('./firebase-key.json');

// 2. INICIALIZAR FIREBASE
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 3. OBTENER LA BASE DE DATOS
const db = admin.firestore();

// 4. CREAR EL SERVIDOR
const app = express();
app.use(cors());
app.use(express.json());

// 5. RUTA DE PRUEBA - ¡EMPECEMOS POR ESTA!
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '¡El backend está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// 6. RUTA PARA OBTENER PRODUCTOS
app.get('/api/productos', async (req, res) => {
  try {
    console.log('Obteniendo productos de Firestore...');
    
    // Obtener todos los documentos de la colección "productos"
    const productosRef = db.collection('productos');
    const snapshot = await productosRef.get();
    
    const productos = [];
    snapshot.forEach(doc => {
      productos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Encontrados ${productos.length} productos`);
    res.json({ success: true, productos });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. INICIAR SERVIDOR
const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado en http://localhost:3001');
  console.log('📊 Rutas disponibles:');
  console.log('   http://localhost:3001/api/test');
  console.log('   http://localhost:3001/api/productos');
});

// ... (código existente)

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

// ... (resto del código existente)