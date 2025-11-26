import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Carrito from './components/Carrito';
import ProductList from './components/ProductList';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // ✅ DATOS LOCALES DE PRODUCTOS
  const productosLocales = [
    {
      id: 1,
      nombre: "Laptop Gaming",
      precio: 1200,
      descripcion: "Laptop para gaming de alta performance con RGB",
      imagen: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      nombre: "Smartphone Pro",
      precio: 799,
      descripcion: "Teléfono inteligente última generación, 5G, 128GB",
      imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      nombre: "Tablet Digital",
      precio: 459,
      descripcion: "Tablet perfecta para trabajo y entretenimiento",
      imagen: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      nombre: "Auriculares Wireless",
      precio: 199,
      descripcion: "Sonido premium con cancelación de ruido",
      imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      nombre: "Smart Watch",
      precio: 299,
      descripcion: "Reloj inteligente con monitor de salud",
      imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      nombre: "Cámara Profesional",
      precio: 1200,
      descripcion: "Cámara DSLR para fotografía profesional",
      imagen: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop"
    }
  ];

  // Cargar usuario y productos al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const carritoGuardado = localStorage.getItem('carrito');
    
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
    
    // ✅ Usar datos locales inmediatamente
    setProductos(productosLocales);
    setLoading(false);
    
    console.log('✅ App cargada con productos locales');
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }, [carrito]);

  // ✅ FUNCIÓN SIMPLIFICADA - Agregar al carrito LOCAL
  const agregarAlCarrito = (producto) => {
    if (!usuario) {
      alert('Por favor inicia sesión para agregar productos al carrito');
      return;
    }

    console.log('➕ Agregando producto:', producto.nombre);
    
    // Buscar si el producto ya está en el carrito
    const itemExistenteIndex = carrito.findIndex(
      item => item.productoId === producto.id && item.usuarioId === usuario.sub
    );

    let nuevoCarrito;
    
    if (itemExistenteIndex !== -1) {
      // Actualizar cantidad si ya existe
      nuevoCarrito = [...carrito];
      nuevoCarrito[itemExistenteIndex].cantidad += 1;
    } else {
      // Agregar nuevo item al carrito
      const nuevoItem = {
        id: Date.now().toString(),
        usuarioId: usuario.sub,
        productoId: producto.id,
        cantidad: 1,
        productoNombre: producto.nombre,
        productoPrecio: producto.precio,
        productoImagen: producto.imagen,
        productoDescripcion: producto.descripcion,
        fechaAgregado: new Date().toISOString()
      };
      nuevoCarrito = [...carrito, nuevoItem];
    }

    setCarrito(nuevoCarrito);
    alert('✅ Producto agregado al carrito!');
  };

  // ✅ Actualizar cantidad en el carrito
  const actualizarCantidadCarrito = (itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      // Eliminar item si cantidad es 0
      const nuevoCarrito = carrito.filter(item => item.id !== itemId);
      setCarrito(nuevoCarrito);
    } else {
      // Actualizar cantidad
      const nuevoCarrito = carrito.map(item =>
        item.id === itemId ? { ...item, cantidad: nuevaCantidad } : item
      );
      setCarrito(nuevoCarrito);
    }
  };

  // ✅ Eliminar item del carrito
  const eliminarDelCarrito = (itemId) => {
    const nuevoCarrito = carrito.filter(item => item.id !== itemId);
    setCarrito(nuevoCarrito);
  };

  const handleLogin = (userData) => {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrito');
    setUsuario(null);
    setCarrito([]);
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.productoPrecio * item.cantidad), 0);
  const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (loading) {
    return (
      <div className="App">
        <h1>🛍️ Mi Tienda PWA</h1>
        <div className="loading">🔄 Cargando...</div>
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
          onActualizarCantidad={actualizarCantidadCarrito}
          onEliminarItem={eliminarDelCarrito}
          onCerrar={() => setMostrarCarrito(false)}
        />
      )}

      {/* ProductList */}
      <ProductList 
        products={productos}
        usuario={usuario}
        onAgregarCarrito={agregarAlCarrito}
      />

      {/* Info Footer */}
      <footer className="app-footer">
        <p>✅ Tienda funcionando con datos locales</p>
        <p>🛒 Carrito guardado en tu navegador</p>
      </footer>
    </div>
  );
}

export default App;
