import React, { useState, useEffect } from 'react';
import { db } from './firebase/config';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import './App.css';
import Login from './components/Login';
import ProductList from './components/ProductList';
import Carrito from './components/Carrito'; // Nuevo componente

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [carritoOpen, setCarritoOpen] = useState(false); // Estado para mostrar/ocultar carrito

  // Datos de prueba
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

  const obtenerProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productosFirebase = [];
      
      querySnapshot.forEach((doc) => {
        productosFirebase.push({ id: doc.id, ...doc.data() });
      });
      
      setProductos(productosFirebase.length > 0 ? productosFirebase : productosReserva);
    } catch (error) {
      console.error('Error:', error);
      setProductos(productosReserva);
    } finally {
      setLoading(false);
    }
  };

  // Obtener carrito del usuario desde Firebase
  const obtenerCarrito = async (usuarioId) => {
    try {
      const q = query(
        collection(db, 'carrito'), 
        where('usuarioId', '==', usuarioId)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const carritoItems = [];
        querySnapshot.forEach((doc) => {
          carritoItems.push({ 
            id: doc.id, 
            ...doc.data(),
            productoId: doc.data().productoId || doc.data().id
          });
        });
        setCarrito(carritoItems);
      });

      return unsubscribe;
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
      // Verificar si el producto ya está en el carrito
      const itemExistente = carrito.find(item => 
        item.productoId === producto.id || item.id === producto.id
      );

      if (itemExistente) {
        alert('⚠️ Este producto ya está en tu carrito');
        return;
      }

      await addDoc(collection(db, 'carrito'), {
        usuarioId: usuario.uid || usuario.sub,
        productoId: producto.id,
        productoNombre: producto.nombre,
        productoPrecio: producto.precio,
        productoImagen: producto.imagen,
        productoDescripcion: producto.descripcion,
        cantidad: 1,
        fecha: new Date().toISOString()
      });
      
      alert('✅ Producto agregado al carrito!');
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('❌ Error al agregar producto. Intenta nuevamente.');
    }
  };

  const eliminarDelCarrito = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'carrito', itemId));
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      alert('❌ Error al eliminar producto del carrito');
    }
  };

  const vaciarCarrito = async () => {
    if (!usuario) return;

    try {
      const q = query(
        collection(db, 'carrito'), 
        where('usuarioId', '==', usuario.uid || usuario.sub)
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      alert('🗑️ Carrito vaciado');
    } catch (error) {
      console.error('Error vaciando carrito:', error);
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.productoPrecio * item.cantidad), 0);
  };

  const toggleCarrito = () => {
    if (!usuario) {
      alert('Por favor inicia sesión para ver tu carrito');
      return;
    }
    setCarritoOpen(!carritoOpen);
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const userData = JSON.parse(usuarioGuardado);
      setUsuario(userData);
      
      // Obtener carrito cuando hay usuario
      if (userData.uid || userData.sub) {
        obtenerCarrito(userData.uid || userData.sub);
      }
    }
    
    obtenerProductos();

    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (userData) => {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
    
    // Obtener carrito después del login
    if (userData.uid || userData.sub) {
      obtenerCarrito(userData.uid || userData.sub);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    setCarrito([]);
    setCarritoOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Cargando Místico Store...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar" id="navbar">
        <a href="#inicio" className="nav-logo" onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }}>
          Místico Store
        </a>
        
        <div className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li><a href="#productos" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>Productos</a></li>
          <li><a href="#categorias" onClick={(e) => { e.preventDefault(); scrollToSection('categorias'); }}>Categorías</a></li>
          <li><a href="#ofertas" onClick={(e) => { e.preventDefault(); scrollToSection('ofertas'); }}>Ofertas</a></li>
          <li><a href="#contacto" onClick={(e) => { e.preventDefault(); scrollToSection('contacto'); }}>Contacto</a></li>
          <li className="nav-auth">
            {usuario ? (
              <div className="usuario-info">
                <img src={usuario.picture} alt="Avatar" className="usuario-avatar" />
                <span>Hola, {usuario.given_name}</span>
                <button onClick={handleLogout} className="login-btn">
                  <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </div>
            ) : (
              <Login onLogin={handleLogin} />
            )}
          </li>
          <li>
            <button className="btn-carrito" onClick={toggleCarrito}>
              <span className="carrito-text">Carrito</span>
              <span className="carrito-badge">{carrito.length}</span>
            </button>
          </li>
        </ul>

        <div 
          className={`nav-overlay ${menuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        ></div>
      </nav>

      {/* Componente Carrito */}
      <Carrito 
        isOpen={carritoOpen}
        onClose={() => setCarritoOpen(false)}
        carrito={carrito}
        onEliminarItem={eliminarDelCarrito}
        onVaciarCarrito={vaciarCarrito}
        total={calcularTotal()}
        usuario={usuario}
      />

      {/* Hero Section */}
      <section id="inicio" className="hero">
        <div className="hero-content">
          <h1>Bienvenido a Místico Store</h1>
          <p>Descubre tecnología de otro mundo</p>
          <a href="#productos" className="btn" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>
            Explorar Productos
          </a>
        </div>
      </section>

      {/* Sección Productos */}
      <section id="productos" className="section productos-section">
        <div className="container">
          <div className="section-header">
            <h2>Nuestros Productos</h2>
            <p>Los mejores productos tecnológicos al mejor precio</p>
          </div>
          <ProductList 
            products={productos}
            usuario={usuario}
            onAgregarCarrito={agregarAlCarrito}
          />
        </div>
      </section>

      {/* Sección Categorías */}
      <section id="categorias" className="section categorias-section">
        <div className="container">
          <div className="section-header">
            <h2>Categorías</h2>
            <p>Encuentra lo que necesitas</p>
          </div>
          <div className="categorias-grid">
            <div className="categoria-card">
              <i className="fas fa-laptop"></i>
              <h3>Tecnología</h3>
              <p>Laptops, PCs y accesorios</p>
            </div>
            <div className="categoria-card">
              <i className="fas fa-mobile-alt"></i>
              <h3>Smartphones</h3>
              <p>Teléfonos y tablets</p>
            </div>
            <div className="categoria-card">
              <i className="fas fa-headphones"></i>
              <h3>Audio</h3>
              <p>Auriculares y altavoces</p>
            </div>
            <div className="categoria-card">
              <i className="fas fa-clock"></i>
              <h3>Wearables</h3>
              <p>Relojes inteligentes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Ofertas */}
      <section id="ofertas" className="section ofertas-section">
        <div className="container">
          <div className="section-content">
            <h2>Ofertas Especiales</h2>
            <p>Descuentos exclusivos por tiempo limitado</p>
            <a href="#productos" className="btn" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>
              Ver Ofertas
            </a>
          </div>
        </div>
      </section>

      {/* Sección Contacto */}
      <section id="contacto" className="section contacto-section">
        <div className="container">
          <div className="section-content">
            <h2>Contacto</h2>
            <div className="contacto-info">
              <p><i className="fas fa-envelope"></i> contacto@misticostore.com</p>
              <p><i className="fas fa-phone"></i> +52 498 981 5100</p>
              <p><i className="fas fa-map-marker-alt"></i> Guadalupe, Zacatecas, México</p>
            </div>
            <a href="mailto:contacto@misticostore.com" className="btn">
              Enviar Mensaje
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <small>&copy; 2024 Místico Store. Todos los derechos reservados.</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
