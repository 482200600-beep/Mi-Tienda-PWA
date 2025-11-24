import React, { useState } from 'react';

function Carrito({ carrito, total, onActualizarCarrito, onCerrar }) {
  const [actualizando, setActualizando] = useState(false);

  const eliminarDelCarrito = async (itemId) => {
    setActualizando(true);
    try {
      const response = await fetch(`http://localhost:3001/api/carrito/${itemId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        onActualizarCarrito();
      }
    } catch (error) {
      console.error('Error eliminando:', error);
    } finally {
      setActualizando(false);
    }
  };

  const actualizarCantidad = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    setActualizando(true);
    try {
      const response = await fetch(`http://localhost:3001/api/carrito/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantidad: nuevaCantidad })
      });
      
      const data = await response.json();
      if (data.success) {
        onActualizarCarrito();
      }
    } catch (error) {
      console.error('Error actualizando:', error);
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
          <h2>🛒 Tu Carrito ({carrito.length} productos)</h2>
          <button onClick={onCerrar} className="btn-cerrar">×</button>
        </div>
        
        <div className="carrito-items">
          {carrito.map(item => (
            <div key={item.id} className="carrito-item">
              <img src={item.productoImagen} alt={item.productoNombre} />
              <div className="carrito-item-info">
                <h4>{item.productoNombre}</h4>
                <p>${item.productoPrecio} c/u</p>
              </div>
              <div className="carrito-item-cantidad">
                <button 
                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                  disabled={actualizando}
                >
                  -
                </button>
                <span>{item.cantidad}</span>
                <button 
                  onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                  disabled={actualizando}
                >
                  +
                </button>
              </div>
              <div className="carrito-item-total">
                ${item.productoPrecio * item.cantidad}
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
        </div>
      </div>
    </div>
  );
}

export default Carrito;