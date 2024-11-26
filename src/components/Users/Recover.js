import React, { useState, useContext } from 'react';
import { useAuth } from '../AuthContext/AuthContext';

const Recover = () => {
  const [username, setUsername] = useState('');
  const { recoverPassword } = useContext(useAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await recoverPassword(username);
  };

  return (
    <div>
      <h2>Recuperar Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Recuperar</button>
      </form>
    </div>
  );
};

export default Recover;