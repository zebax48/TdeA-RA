import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/styles.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Ocultar el Sidebar por defecto

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app">
      <Header toggleSidebar={toggleSidebar} />
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      <main className={`content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
