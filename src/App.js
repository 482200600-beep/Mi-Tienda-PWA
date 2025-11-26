const obtenerProductos = async () => {
  try {
    console.log('🔗 Conectando a:', `${API_URL}/api/productos`);
    
    // ✅ TEST: Headers simplificados para CORS
    const response = await fetch(`${API_URL}/api/productos`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit' // Cambiar a 'include' si necesitas credenciales
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Datos recibidos:', data);
    
    if (data.success) {
      setProductos(data.productos);
    } else {
      console.error('Error del servidor:', data.error);
    }
  } catch (error) {
    console.error('💥 Error completo:', error);
    console.log('🔍 Detalles del error:', {
      name: error.name,
      message: error.message
    });
    
    // ✅ DATOS DE PRUEBA TEMPORALES (eliminar después)
    console.log('🔄 Usando datos de prueba temporales...');
    const productosPrueba = [
      {
        id: 1,
        nombre: "Laptop Gaming (Modo Prueba)",
        precio: 1200,
        descripcion: "Producto de prueba - Backend en mantenimiento",
        imagen: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=200&fit=crop"
      },
      {
        id: 2,
        nombre: "Smartphone (Modo Prueba)", 
        precio: 599,
        descripcion: "Producto de prueba - Backend en mantenimiento",
        imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop"
      }
    ];
    setProductos(productosPrueba);
  } finally {
    setLoading(false);
  }
};
