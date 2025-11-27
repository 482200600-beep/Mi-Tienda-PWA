import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import './App.css';
import Login from './components/Login';
import ProductList from './components/ProductList';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef(null);

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
    }
  ];

  useEffect(() => {
    // Forzar la reproducción del video
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Error reproduciendo video:', error);
        // Si falla, intentar con usuario interaction
        document.addEventListener('click', () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }, { once: true });
      });
    }
  }, []);

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

  const agregarAlCarrito = async (producto) => {
    if (!usuario) {
      alert('Por favor inicia sesión para agregar productos al carrito');
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
      
      setCarrito(prev => [...prev, { ...producto, cantidad: 1 }]);
      alert('✅ Producto agregado al carrito!');
    } catch (error) {
      console.error('Error:', error);
      setCarrito(prev => [...prev, { ...producto, cantidad: 1 }]);
      alert('✅ Producto agregado al carrito!');
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) setUsuario(JSON.parse(usuarioGuardado));
    obtenerProductos();

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
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    setCarrito([]);
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
            <button className="btn-carrito">
              <i className="fas fa-shopping-cart"></i>
              <span className="carrito-badge">{carrito.length}</span>
            </button>
          </li>
        </ul>

        <div 
          className={`nav-overlay ${menuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        ></div>
      </nav>

      {/* Hero Section con video - CORREGIDO */}
      <section id="inicio" className="hero">
        <div className="hero-video">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            loop 
            playsInline
            webkit-playsinline="true"
          >
            <source src="/hero-background.mp4" type="video/mp4" />
            Tu navegador no soporta el elemento video.
          </video>
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1>Bienvenido a Místico Store</h1>
          <p>Descubre tecnología de otro mundo</p>
          <a href="#productos" className="btn" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>
            Explorar Productos
          </a>
        </div>
      </section>

      {/* Otras secciones... */}
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

      <footer>
        <div className="container">
          <small>&copy; 2024 Místico Store. Todos los derechos reservados.</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
