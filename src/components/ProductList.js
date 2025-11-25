import React from 'react';

const ProductList = ({ products, usuario, onAgregarCarrito }) => {
  return (
    <div className="productos-grid">
      {products && products.length > 0 ? (
        products.map(producto => (
          <div key={producto.id} className="producto-card">
            <img 
              src={producto.imagen} 
              alt={producto.nombre}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
              }}
            />
            <h3>{producto.nombre}</h3>
            <p className="precio">${producto.precio}</p>
            <p className="descripcion">{producto.descripcion}</p>
            <button 
              className="btn-agregar"
              onClick={() => onAgregarCarrito(producto)}
              disabled={!usuario}
            >
              {usuario ? '🛒 Agregar al Carrito' : '🔒 Inicia sesión para comprar'}
            </button>
          </div>
        ))
      ) : (
        <div className="no-productos">
          <p>😔 No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
