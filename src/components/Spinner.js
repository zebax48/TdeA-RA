import React from 'react';
import '../styles/Spinner.css';

const Spinner = ({ size = 24, color = '#000', fullScreen = false }) => {
  return (
    <div className={`spinner-container ${fullScreen ? 'full-screen' : ''}`}>
      <div
        className="spinner-circle"
        style={{
          width: size,
          height: size,
          borderColor: `${color} transparent transparent transparent`,
        }}
      />
    </div>
  );
};

export default Spinner;