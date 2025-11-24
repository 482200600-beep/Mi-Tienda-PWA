// En backend/server.js - mejora CORS
app.use(cors({
  origin: [
    'http://localhost:5173',  // Desarrollo
    'http://localhost:3000',  // Desarrollo alternativo
    'https://mi-tienda-pwa-kned.vercel.app',  // Tu dominio de Vercel
    'https://*.vercel.app'    // Todos los subdominios de Vercel
  ],
  credentials: true
}));
