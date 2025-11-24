// Configuración para desarrollo y producción
export const API_URL = 'https://mi-tienda-pwa.onrender.com';
export const API_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'  // Desarrollo local
    : 'https://mi-tienda-pwa.onrender.com';  // Producción

