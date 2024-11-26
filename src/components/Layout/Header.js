import React, {useState} from 'react';
import '../../styles/styles.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';

const Header = ({ toggleSidebar }) => {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="menu-icon" title='Sidebar' onClick={toggleSidebar} style={{paddingRight: "5%"}}>
        &#9776;
      </div>
      <div className="header-title">Software RA   TdeA</div>
      <div className="menu-icon"  title="Cerrar Sesión" style={{paddingLeft: "77%"}} onClick={handleLogout}>
        &#10162;
      </div>
    </header>
  );
};

export default Header;