const express = require('express');
const cors = require('cors'); // ✅ Cambiado de 'express' a 'cors'
const app = express();

// CORS config
app.use(cors({
  origin: '*', // Temporalmente permite todos
  credentials: true
}));

app.use(express.json());

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Ruta de productos
app.get('/api/productos', (req, res) => {
  console.log('📦 Petición recibida en /api/productos');
  
  // Datos de prueba
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

// Puerto para Render
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
});
