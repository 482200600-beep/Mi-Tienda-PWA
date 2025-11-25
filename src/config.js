// src/config.js
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://mi-tienda-pwa.onrender.com',
  APP_NAME: 'Mi Tienda PWA',
  VERSION: '1.0.0'
};

export const { API_URL, APP_NAME, VERSION } = config;
export default config;
