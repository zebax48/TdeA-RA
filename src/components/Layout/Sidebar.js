import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import '../../styles/styles.css';
import { useAuth } from '../AuthContext/AuthContext';

const Sidebar = ({ isOpen }) => {
    const {auth} = useAuth(); 
    const nameAuth = auth.nombres;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="profile">
        <div class="card-client">
    <div class="user-picture">
        <img src="/assets/logoSlide.png" alt="User" className="profile-pic" />
    </div>
    <p class="name-client"> {nameAuth}<br/>{auth.apellidos}
        <span> <br/>{auth.role}
        </span>
    </p>
    <div class="social-media">
        <a href="https://campus.tdea.edu.co/">
            <button>CAMPUS</button>
        </a>
    </div>
</div>
      </div>
      <ul className="card-client">
        <SidebarItem title="Administrar Usuarios" isOpen={isUserMenuOpen} onToggle={handleUserMenuToggle}>
        {isOpen && (
            <ul className={`submenu ${isUserMenuOpen ? 'open' : ''}`}>
                <a href='/register'>
                    <li className='li'>Crear usuario</li>
                </a>
              
              <a href='/users'>
                <li className='li'>Ver usuarios</li>
              </a>
              
            </ul>
          )}
        </SidebarItem>
        <a href='/programas'>
            <li className='sidebar-item'>Programas</li>
        </a>
        <a href='/ra'>
           <li className='sidebar-item'>Resultados de Aprendizaje</li>
        </a>
        
        <a href='/pruebas'>
          <li className='sidebar-item'>Pruebas</li>
        </a>
        
      </ul>
    </div>
  );
};


export default Sidebar;