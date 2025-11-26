import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ TUS CREDENCIALES REALES
const firebaseConfig = {
  apiKey: "AIzaSyB4i0eBOLPF38fwsGNuxLWtzflG4YtSkVc",
  authDomain: "e-commerce-pwa-con-react.firebaseapp.com",
  projectId: "e-commerce-pwa-con-react",
  storageBucket: "e-commerce-pwa-con-react.firebasestorage.app",
  messagingSenderId: "862933082794",
  appId: "1:862933082794:web:52ce6d034b0050113b26d3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);
export default app;
