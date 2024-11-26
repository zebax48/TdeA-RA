import React from 'react';

const SidebarItem = ({ title, children, isOpen, onToggle }) => {
  return (
    <li className="sidebar-item">
      <div className="sidebar-title" onClick={onToggle}>
        {title}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && children}
    </li>
  );
};

export default SidebarItem;