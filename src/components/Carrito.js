import React from 'react';
import './Carrito.css';

const Carrito = ({ 
  carrito, 
  total, 
  onActualizarCantidad, 
  onEliminarItem, 
  onCerrar,
  onVaciarCarrito 
}) => {
  
  const handleCantidadChange = (itemId, nuevaCantidad) => {
    onActualizarCantidad(itemId, nuevaCantidad);
  };

  const handleEliminar = (itemId) => {
    onEliminarItem(itemId);
  };

  const handleVaciarCarrito = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      onVaciarCarrito();
    }
  };

  return (
    <div className="carrito-overlay" onClick={onCerrar}>
      <div className="carrito-sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Header del Carrito */}
        <div className="carrito-header">
          <h3>Tu Carrito</h3>
          <button className="btn-cerrar" onClick={onCerrar}>
            <span>×</span>
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="carrito-content">
          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <div className="icono-vacio">🛒</div>
              <p>Tu carrito está vacío</p>
              <span>Agrega algunos productos</span>
            </div>
          ) : (
            <>
              <div className="carrito-items">
                {carrito.map((item) => (
                  <div key={item.id} className="carrito-item">
                    <img 
                      src={item.imagen} 
                      alt={item.nombre}
                      className="item-imagen"
                    />
                    
                    <div className="item-info">
                      <h4 className="item-nombre">{item.nombre}</h4>
                      <p className="item-precio">${item.precio}</p>
                      
                      <div className="item-controls">
                        <div className="cantidad-controls">
                          <button 
                            onClick={() => handleCantidadChange(item.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1}
                          >
                            −
                          </button>
                          <span>{item.cantidad}</span>
                          <button 
                            onClick={() => handleCantidadChange(item.id, item.cantidad + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          className="btn-eliminar"
                          onClick={() => handleEliminar(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer del Carrito */}
              <div className="carrito-footer">
                <div className="carrito-total">
                  <span>Total:</span>
                  <span className="total-precio">${total}</span>
                </div>
                
                <div className="carrito-actions">
                  <button 
                    className="btn-vaciar"
                    onClick={handleVaciarCarrito}
                  >
                    Vaciar Carrito
                  </button>
                  <button className="btn-comprar">
                    Finalizar Compra
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carrito;
