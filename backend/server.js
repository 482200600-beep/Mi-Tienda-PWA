const express = require('express');
const cors = require('cors');
const app = express();

// CORS config MEJORADO
app.use(cors({
  origin: [
    'https://mi-tienda-pwa-kned.vercel.app', // Tu frontend en Render
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Manejar preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

// Ruta de productos (ya funciona)
app.get('/api/productos', (req, res) => {
  console.log('📦 Petición recibida en /api/productos');
  
  const productos = [
    {
      id: 1,
      nombre: "Laptop Gaming",
      precio: 1200,
      descripcion: "Laptop para gaming de alta performance",
      imagen: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      nombre: "Smartphone",
      precio: 599,
      descripcion: "Teléfono inteligente última generación",
      imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop"
    }
  ];
  
  res.json({
    success: true,
    productos: productos,
    count: productos.length
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});



