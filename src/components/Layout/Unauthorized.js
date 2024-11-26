import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Layout/HeaderI';
import Footer from '../Layout/FooterI';
import '../../styles/Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBackToGroups = () => {
    navigate('/grupos');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="unauthorized-container">
      <Header/>
      <div className="unauthorized-content">
        <h1 className="unauthorized-title">Acceso Denegado</h1>
        <p className="unauthorized-text">
          Lo sentimos, no tienes permiso para acceder a esta página.
        </p>
        <button className="unauthorized-button" onClick={handleBackToGroups}>
          Volver a Grupos
        </button>
        <button className="unauthorized-button" onClick={handleBackToLogin}>
          Iniciar Sesión
        </button>
      </div>
      <Footer/>
    </div>
  );
};

export default Unauthorized;