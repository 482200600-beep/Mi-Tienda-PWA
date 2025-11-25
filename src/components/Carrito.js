import React, { useState } from 'react';
import { API_URL } from './config';

function Carrito({ carrito, total, onActualizarCarrito, onCerrar, usuario }) {
  const [actualizando, setActualizando] = useState(false);

  const eliminarDelCarrito = async (itemId) => {
    if (!usuario) {
      alert('Debe iniciar sesión para modificar el carrito');
      return;
    }

    setActualizando(true);
    try {
      const response = await fetch(`${API_URL}/api/carrito/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId: usuario.sub })
      });
      
      const data = await response.json();
      if (data.success) {
        onActualizarCarrito();
        alert('Producto eliminado del carrito');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error de conexión al eliminar producto');
    } finally {
      setActualizando(false);
    }
  };

  const actualizarCantidad = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(itemId);
      return;
    }

    if (!usuario) {
      alert('Debe iniciar sesión para modificar el carrito');
      return;
    }
    
    setActualizando(true);
    try {
      const response = await fetch(`${API_URL}/api/carrito/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cantidad: nuevaCantidad,
          usuarioId: usuario.sub 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        onActualizarCarrito();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error actualizando:', error);
      alert('Error de conexión al actualizar cantidad');
    } finally {
      setActualizando(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="carrito-overlay">
        <div className="carrito-modal">
          <div className="carrito-header">
            <h2>🛒 Tu Carrito</h2>
            <button onClick={onCerrar} className="btn-cerrar">×</button>
          </div>
          <div className="carrito-vacio">
            <p>Tu carrito está vacío</p>
            <button onClick={onCerrar} className="btn-seguir-comprando">
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-overlay">
      <div className="carrito-modal">
        <div className="carrito-header">
          <h2>🛒 Tu Carrito ({carrito.reduce((sum, item) => sum + item.cantidad, 0)} items)</h2>
          <button onClick={onCerrar} className="btn-cerrar">×</button>
        </div>
        
        <div className="carrito-items">
          {carrito.map(item => (
            <div key={item.id} className="carrito-item">
              <img 
                src={item.productoImagen || item.imagen} 
                alt={item.productoNombre || item.nombre}
                className="carrito-item-imagen"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop';
                }}
              />
              <div className="carrito-item-info">
                <h4>{item.productoNombre || item.nombre}</h4>
                <p>${item.productoPrecio || item.precio} c/u</p>
              </div>
              <div className="carrito-item-cantidad">
                <button 
                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                  disabled={actualizando}
                  className="btn-cantidad"
                >
                  -
                </button>
                <span className="cantidad-numero">{item.cantidad}</span>
                <button 
                  onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                  disabled={actualizando}
                  className="btn-cantidad"
                >
                  +
                </button>
              </div>
              <div className="carrito-item-total">
                ${(item.productoPrecio || item.precio) * item.cantidad}
              </div>
              <button 
                onClick={() => eliminarDelCarrito(item.id)}
                className="btn-eliminar"
                disabled={actualizando}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
        
        <div className="carrito-total">
          <h3>Total: ${total}</h3>
          <button className="btn-comprar">
            Proceder al Pago
          </button>
          <button onClick={onCerrar} className="btn-seguir-comprando">
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
}

export default Carrito;
