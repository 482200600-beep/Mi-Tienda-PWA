// src/components/ProductList.js
import React from 'react';

const ProductList = ({ productos, onAddToCart, usuario }) => {
  return (
    <div className="productos-grid">
      {productos.map(producto => (
        <div key={producto.id} className="producto-card">
          <img 
            src={producto.imagen} 
            alt={producto.nombre}
            className="producto-imagen"
          />
          <div className="producto-info">
            <h3 className="producto-nombre">{producto.nombre}</h3>
            <p className="producto-precio">${producto.precio}</p>
            <p className="producto-descripcion">{producto.descripcion}</p>
            <button 
              className="btn-agregar"
              onClick={() => onAddToCart(producto)}
              disabled={!usuario}
            >
              {usuario ? '🛒 Agregar al Carrito' : '🔒 Inicia sesión'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
