import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from '../Layout/HeaderI';
import Footer from '../Layout/FooterI';
import Spinner from '../Spinner';
import '../../styles/Login.css';
import '../../styles/App.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, auth, resetAuth } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reseteamos auth al cargar el componente de login para evitar redirecciones previas
    resetAuth();
  }, []);

  useEffect(() => {
    if (auth.token && auth.role) {
      if (auth.role === 'Evaluador') {
        navigate('/grupos');
      } else {
        navigate('/dashboard');
      }
    }
  }, [auth, navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials);
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="page-container">
      <Header />
      <div className="login-container">
        <div className="login-box">
          <img src="/assets/logoLogin.jpg" alt="Tecnológico de Antioquia" className="logo" />
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                className="input-field"
              />
              <span className="icon">&#128100;</span> {/* Ícono de usuario */}
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="input-field"
              />
              <span className="icon">&#128274;</span> {/* Ícono de candado */}
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? <Spinner size={16} color="#fff" /> : 'Ingresar'}
            </button>
          </form>
          <a href="/recover" className="recover-link">Recuperar contraseña</a>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Login;