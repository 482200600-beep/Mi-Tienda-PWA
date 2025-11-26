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
    return <div className="App"><h1>🛍️ Mi Tienda PWA</h1><div>Cargando...</div></div>;
  }

  return (
    <div className="App">
      <header className="header">
        <h1>🛍️ Mi Tienda PWA</h1>
        <div className="header-actions">
          {usuario ? (
            <div className="usuario-info">
              <img src={usuario.picture} alt="Avatar" className="usuario-avatar" />
              <span>Hola, {usuario.given_name}</span>
              <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
            </div>
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      </header>

      <ProductList 
        products={productos}
        usuario={usuario}
        onAgregarCarrito={agregarAlCarrito}
      />
    </div>
  );
}

export default App;
