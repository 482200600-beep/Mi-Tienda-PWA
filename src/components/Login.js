import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';

const CLIENT_ID = "12965070830-mjmnsh17fp13kr2471vjpnf46799jedt.apps.googleusercontent.com";

function Login({ onLogin }) {
  const responseGoogle = (response) => {
    console.log("Login Exitoso!");
    const userObject = jwtDecode(response.credential);
    console.log("Usuario:", userObject);
    
    // Guardar usuario en localStorage y estado
    localStorage.setItem('usuario', JSON.stringify(userObject));
    onLogin(userObject);
  };

  const errorGoogle = (error) => {
    console.log("Error en el login:", error);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <p>Para agregar productos al carrito</p>
        <GoogleLogin
          onSuccess={responseGoogle}
          onError={errorGoogle}
          theme="filled_blue"
          size="large"
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
