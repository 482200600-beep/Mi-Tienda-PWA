// En tu frontend, crea un archivo config.js
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-backend-en-railway.app'  // URL de Railway
  : 'http://localhost:3001';              // Local

// Luego en tus componentes:
const response = await fetch(`${API_URL}/api/productos`);
