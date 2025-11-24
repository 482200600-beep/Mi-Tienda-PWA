import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Carrito from './components/Carrito';

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
      const response = await fetch('http://localhost:3001/api/productos');
      const data = await response.json();
      
      if (data.success) {
        setProductos(data.productos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerCarrito = async (usuarioId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/carrito/${usuarioId}`);
      const data = await response.json();
      
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
      const response = await fetch('http://localhost:3001/api/carrito/agregar', {
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
        // Recargar carrito
        obtenerCarrito(usuario.sub);
        alert('Producto agregado al carrito!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar al carrito');
    }
  };

  const handleLogin = (userData) => {
    setUsuario(userData);
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
        <h1>Mi Tienda PWA</h1>
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
        />
      )}

      {/* Productos */}
      <div className="productos-grid">
        {productos.map(producto => (
          <div key={producto.id} className="producto-card">
            <img 
              src={producto.imagen} 
              alt={producto.nombre}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
              }}
            />
            <h3>{producto.nombre}</h3>
            <p className="precio">${producto.precio}</p>
            <p className="descripcion">{producto.descripcion}</p>
            <button 
              className="btn-agregar"
              onClick={() => agregarAlCarrito(producto)}
              disabled={!usuario}
            >
              {usuario ? '🛒 Agregar al Carrito' : '🔒 Inicia sesión para comprar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;