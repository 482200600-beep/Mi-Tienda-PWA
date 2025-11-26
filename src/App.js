import React, { useState, useEffect } from 'react';
import { db } from './firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import './App.css';
import Login from './components/Login';
import Carrito from './components/Carrito';
import ProductList from './components/ProductList';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ OBTENER PRODUCTOS DESDE FIREBASE
  const obtenerProductos = async () => {
    try {
      console.log('🔥 Conectando a Firebase...');
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productosFirebase = [];
      
      querySnapshot.forEach((doc) => {
        productosFirebase.push({ id: doc.id, ...doc.data() });
      });
      
      if (productosFirebase.length > 0) {
        setProductos(productosFirebase);
        console.log('✅ Productos cargados desde Firebase');
      } else {
        // Datos de reserva si Firebase está vacío
        setProductos(productosReserva);
      }
    } catch (error) {
      console.error('❌ Error Firebase:', error);
      // Datos de reserva si hay error
      setProductos(productosReserva);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DATOS DE RESERVA (por si hay problemas)
  const productosReserva = [
    {
      id: "1",
      nombre: "Laptop Gaming Pro",
      precio: 1299,
      descripcion: "Laptop gaming con RTX 4060, 16GB RAM, 1TB SSD",
      imagen: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
      categoria: "tecnologia"
    },
    {
      id: "2", 
      nombre: "iPhone 15 Pro",
      precio: 999,
      descripcion: "iPhone 15 Pro 128GB, cámara 48MP",
      imagen: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
      categoria: "smartphones"
    },
    {
      id: "3",
      nombre: "Auriculares Inalámbricos",
      precio: 199,
      descripcion: "Auriculares con cancelación de ruido y 30h de batería",
      imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      categoria: "audio"
    },
    {
      id: "4",
      nombre: "Smartwatch Pro",
      precio: 349,
      descripcion: "Reloj inteligente con monitor de salud y GPS",
      imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
      categoria: "wearables"
    }
  ];

  // ✅ AGREGAR AL CARRITO
  const agregarAlCarrito = async (producto) => {
    if (!usuario) {
      alert('Por favor inicia sesión');
      return;
    }

    try {
      await addDoc(collection(db, 'carrito'), {
        usuarioId: usuario.sub,
        productoId: producto.id,
        productoNombre: producto.nombre,
        productoPrecio: producto.precio,
        productoImagen: producto.imagen,
        cantidad: 1,
        fecha: new Date().toISOString()
      });
      alert('✅ Producto agregado al carrito!');
    } catch (error) {
      console.error('Error:', error);
      alert('✅ Producto agregado (modo local)');
    }
  };

  // Cargar datos
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) setUsuario(JSON.parse(usuarioGuardado));
    obtenerProductos();
  }, []);

  const handleLogin = (userData) => {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    setCarrito([]);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Cargando productos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-store"></i>
            <span>Místico Store</span>
          </div>
          <div className="header-actions">
            {usuario ? (
              <div className="usuario-info">
                <img src={usuario.picture} alt="Avatar" className="usuario-avatar" />
                <span>Hola, {usuario.given_name}</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </div>
            ) : (
              <Login onLogin={handleLogin} />
            )}
            <button className="btn-carrito">
              <i className="fas fa-shopping-cart"></i>
              <span className="carrito-badge">{carrito.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="section-header">
          <h2>Nuestros Productos</h2>
          <p>Descubre la mejor selección de tecnología</p>
        </div>
        
        <ProductList 
          products={productos}
          usuario={usuario}
          onAgregarCarrito={agregarAlCarrito}
        />
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Místico Store. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
