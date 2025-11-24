// config.js - Versión PRODUCCIÓN - Actualizado: 2024
export const API_URL = 'https://mi-tienda-pwa.onrender.com';
// src/config.js
const config = {
  // URL de tu backend - usa variable de entorno o URL por defecto
  API_URL: process.env.REACT_APP_API_URL || 'https://mi-tienda-pwa.onrender.com',
  
  // Configuración de la aplicación
  APP_NAME: 'Mi Tienda PWA',
  VERSION: '1.0.0'
};

export default config;
