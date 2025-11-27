import React, { useState, useEffect } from 'react';
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
        setProductos(productosReserva);
      }
    } catch (error) {
      console.error('❌ Error Firebase:', error);
      setProductos(productosReserva);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DATOS DE RESERVA
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
      
      setCarrito(prev => [...prev, { ...producto, cantidad: 1 }]);
      mostrarNotificacion('✅ Producto agregado al carrito!');
    } catch (error) {
      console.error('Error:', error);
      setCarrito(prev => [...prev, { ...producto, cantidad: 1 }]);
      mostrarNotificacion('✅ Producto agregado (modo local)');
    }
  };

  const mostrarNotificacion = (mensaje) => {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => notificacion.classList.add('show'), 100);
    
    setTimeout(() => {
      notificacion.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion);
        }
      }, 300);
    }, 3000);
  };

  // Observador de intersección para animaciones
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.scroll-section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Navegación suave
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
          <h2>Cargando Místico Store...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Video de fondo solo en hero */}
      <div className="hero-video">
        <video 
          autoPlay 
          muted 
          loop
          playsInline
        >
          <source src="/hero-background.mp4" type="video/mp4" />
          Tu navegador no soporta el elemento video.
        </video>
        <div className="hero-overlay"></div>
      </div>

      {/* Barra de navegación */}
      <nav className="navbar" id="navbar">
        <a href="#inicio" className="nav-logo" onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }}>
          Místico Store
        </a>
        
        <div className="menu-toggle" id="mobile-menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <ul className="nav-links" id="nav-links">
          <li><a href="#productos" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>Productos</a></li>
          <li><a href="#categorias" onClick={(e) => { e.preventDefault(); scrollToSection('categorias'); }}>Categorías</a></li>
          <li><a href="#ofertas" onClick={(e) => { e.preventDefault(); scrollToSection('ofertas'); }}>Ofertas</a></li>
          <li><a href="#contacto" onClick={(e) => { e.preventDefault(); scrollToSection('contacto'); }}>Contacto</a></li>
          <li>
            {usuario ? (
              <div className="usuario-nav">
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
      </nav>
      
      {/* Overlay para menú móvil */}
      <div className="nav-overlay" id="nav-overlay"></div>

      {/* Sección Hero */}
      <section id="inicio" className="hero scroll-section">
        <div className="hero-content">
          <h1>Bienvenido a Místico Store</h1>
          <p>Descubre tecnología de otro mundo</p>
          <a href="#productos" className="btn" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>
            Explorar Productos
          </a>
        </div>
      </section>

      {/* Sección Productos */}
      <section id="productos" className="scroll-section">
        <div className="section-content">
          <div className="card">
            <h2>Nuestros Productos</h2>
            <p>Explora nuestra selección premium de tecnología y dispositivos innovadores. Cada producto ha sido cuidadosamente seleccionado para ofrecerte la mejor experiencia.</p>
            <div className="internal-nav">
              <a href="#tecnologia">Tecnología</a>
              <a href="#smartphones">Smartphones</a>
              <a href="#audio">Audio</a>
              <a href="#wearables">Wearables</a>
            </div>
          </div>
          
          {/* Lista de productos */}
          <div className="products-container">
            <ProductList 
              products={productos}
              usuario={usuario}
              onAgregarCarrito={agregarAlCarrito}
            />
          </div>
        </div>
      </section>

      {/* Sección Categorías */}
      <section id="categorias" className="scroll-section">
        <div className="section-content">
          <div className="card">
            <h2>Categorías</h2>
            <p>Navega por nuestras categorías especializadas para encontrar exactamente lo que necesitas.</p>
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
                <p>Relojes y bandas inteligentes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Ofertas */}
      <section id="ofertas" className="scroll-section">
        <div className="section-content">
          <div className="card">
            <h2>Ofertas Especiales</h2>
            <p>No te pierdas nuestras promociones exclusivas y descuentos limitados en productos seleccionados.</p>
            <p>¡Solo por tiempo limitado!</p>
            <a href="#productos" className="btn" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>
              Ver Ofertas
            </a>
          </div>
        </div>
      </section>

      {/* Sección Contacto */}
      <section id="contacto" className="scroll-section">
        <div className="section-content">
          <div className="card">
            <h2>Contacto</h2>
            <p><strong>📧 Correo:</strong> contacto@misticostore.com</p>
            <p><strong>📞 Teléfono:</strong> +52 498 981 5100</p>
            <p><strong>📍 Ubicación:</strong> Guadalupe, Zacatecas, México</p>
            <p style={{marginTop: '1rem'}}>¿Tienes preguntas sobre nuestros productos? Contáctanos y te ayudaremos.</p>
            <a href="mailto:contacto@misticostore.com" className="btn" style={{marginTop: '1rem'}}>
              Enviar Mensaje
            </a>
          </div>
        </div>
      </section>

      <footer>
        <small>&copy; 2024 Místico Store. Todos los derechos reservados.</small>
      </footer>
    </div>
  );
}

export default App;
