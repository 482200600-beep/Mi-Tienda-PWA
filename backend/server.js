// En server.js
app.use(cors({
  origin: ['http://localhost:3000', 'https://tu-frontend.vercel.app'],
  credentials: true
}));
