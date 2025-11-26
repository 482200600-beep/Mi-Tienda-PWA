import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Carrito from './components/Carrito';
import ProductList from './components/ProductList';

// ✅ URL CORREGIDA - Usar proxy en desarrollo, Render en producción
const API_URL = process.env.NODE_ENV === 'development' 
  ? '' // Usará el proxy definido en package.json
  : 'https://mi-tienda-pwa.onrender.com';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    obtenerProductos();
  }, []);

  // Cargar carrito cuando el usuario cambia
  useEffect(() => {
    if (usuario) {
      obtenerCarrito(usuario.sub);
    }
  }, [usuario]);

  const obtenerProductos = async () => {
    try {
      // ✅ RUTA RELATIVA cuando usamos proxy
      const url = process.env.NODE_ENV === 'development' 
        ? '/api/productos' 
        : `${API_URL}/api/productos`;
      
      console.log('🔗 Conectando a:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      
      if (data.success) {
        setProductos(data.productos);
      } else {
        throw new Error('Error del servidor: ' + data.error);
      }
    } catch (error) {
      console.error('💥 Error cargando productos:', error);
      
      // ✅ DATOS DE PRUEBA SI FALLA LA CONEXIÓN
      console.log('🔄 Usando datos de prueba...');
      const productosPrueba = [
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
        },
        {
          id: 3,
          nombre: "Auriculares Bluetooth",
          precio: 199,
          descripcion: "Sonido de alta calidad sin cables",
          imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop"
        }
      ];
      setProductos(productosPrueba);
    } finally {
      setLoading(false);
    }
  };

  const obtenerCarrito = async (usuarioId) => {
    if (!usuarioId) return;
    
    try {
      const url = process.env.NODE_ENV === 'development'
        ? `/api/carrito/${usuarioId}`
        : `${API_URL}/api/carrito/${usuarioId}`;
        
      console.log('🛒 Obteniendo carrito:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCarrito(data.carrito);
        }
      }
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
    }
  };

  const agregarAlCarrito = async (producto) => {
    if (!usuario) {
      alert('Por favor inicia sesión para agregar productos al carrito');
      return;
    }

    try {
      const url = process.env.NODE_ENV === 'development'
        ? '/api/carrito/agregar'
        : `${API_URL}/api/carrito/agregar`;
      
      console.log('➕ Agregando producto:', producto.id);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: usuario.sub,
          productoId: producto.id,
          cantidad: 1
        })
      });

      const data = await response.json();
      
      if (data.success) {
        obtenerCarrito(usuario.sub);
        alert('✅ Producto agregado al carrito!');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('✅ Producto agregado (modo prueba)');
      // En modo prueba, simulamos que se agregó
      const nuevoItem = {
        id: Date.now(),
        productoId: producto.id,
        productoNombre: producto.nombre,
        productoPrecio: producto.precio,
        productoImagen: producto.imagen,
        cantidad: 1
      };
      setCarrito(prev => [...prev, nuevoItem]);
    }
  };

  const handleLogin = (userData) => {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    setCarrito([]);
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.productoPrecio * item.cantidad), 0);
  const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (loading) {
    return (
      <div className="App">
        <h1>🛍️ Mi Tienda PWA</h1>
        <div className="loading">🔄 Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <h1>🛍️ Mi Tienda PWA</h1>
        <div className="header-actions">
          {usuario ? (
            <>
              <button 
                className="btn-carrito"
                onClick={() => setMostrarCarrito(!mostrarCarrito)}
              >
                🛒 Carrito ({cantidadCarrito})
              </button>
              <div className="usuario-info">
                <img 
                  src={usuario.picture} 
                  alt="Avatar" 
                  className="usuario-avatar"
                />
                <span>Hola, {usuario.given_name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      </header>

      {mostrarCarrito && usuario && (
        <Carrito 
          carrito={carrito}
          total={totalCarrito}
          onActualizarCarrito={() => obtenerCarrito(usuario.sub)}
          onCerrar={() => setMostrarCarrito(false)}
          usuario={usuario}
        />
      )}

      <ProductList 
        products={productos}
        usuario={usuario}
        onAgregarCarrito={agregarAlCarrito}
      />
    </div>
  );
}

export default App;
