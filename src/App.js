import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Carrito from './components/Carrito';
import ProductList from './components/ProductList'; // Import corregido

// Configuración directa sin archivo config.js
const API_URL = process.env.REACT_APP_API_URL || 'https://mi-tienda-pwa.onrender.com';


// Configuración directa sin archivo config.js



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
      console.log('🔗 Conectando a:', `${API_URL}/`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_URL}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      
      if (data.success) {
        setProductos(data.productos);
      } else {
        console.error('Error del servidor:', data.error);
      }
    } catch (error) {
      console.error('💥 Error completo:', error);
      
      if (error.name === 'AbortError') {
        alert('⏰ Timeout: El servidor tardó demasiado en responder');
      } else {
        alert('❌ Error de conexión. Verifica la consola para más detalles.');
      }
    } finally {
      setLoading(false);
    }
  };

  const obtenerCarrito = async (usuarioId) => {
    try {
      console.log('🛒 Obteniendo carrito para usuario:', usuarioId);
      const response = await fetch(`${API_URL}/api/carrito/${usuarioId}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🛒 Datos carrito:', data);
      
      if (data.success) {
        setCarrito(data.carrito);
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
      console.log('➕ Agregando producto al carrito:', producto.id);
      
      const response = await fetch(`${API_URL}/api/carrito/agregar`, {
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
      console.log('📦 Respuesta agregar carrito:', data);
      
      if (data.success) {
        obtenerCarrito(usuario.sub);
        alert('✅ Producto agregado al carrito!');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('💥 Error al agregar al carrito:', error);
      alert('❌ Error al agregar al carrito. Verifica la conexión.');
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
      {/* Header */}
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

      {/* Carrito */}
      {mostrarCarrito && usuario && (
        <Carrito 
          carrito={carrito}
          total={totalCarrito}
          onActualizarCarrito={() => obtenerCarrito(usuario.sub)}
          onCerrar={() => setMostrarCarrito(false)}
          usuario={usuario}
        />
      )}

      {/* ProductList Component */}
      <ProductList 
        products={productos}
        usuario={usuario}
        onAgregarCarrito={agregarAlCarrito}
      />
    </div>
  );
}

export default App;
