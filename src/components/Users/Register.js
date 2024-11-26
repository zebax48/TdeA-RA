import React, { useState } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import '../../styles/register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [cc, setCc] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [role, setRole] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      window.alert('Las contraseñas no coinciden');
      return;
    }
    if (role == '' | role == 'seleccione') {
      window.alert('Seleccione un Role para el usuario');
      return;
    }
    try {
      await register({ username, cc, password, nombres, apellidos, celular, correo, role });
      window.alert("Usuario creado exitosamente");
      navigate('/users'); 
    }catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');         
      }
    } 
  };

  return (
    <Layout>
        <form className="form" onSubmit={handleSubmit}>
          <p className="title">Crear usuario</p>
          <div className="flex">
            <label>
              <input 
                required 
                placeholder="Nombres" 
                type="text" 
                className="input" 
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
              />
              <span>Nombres</span>
            </label>
            <label>
              <input 
                required 
                placeholder="Apellidos" 
                type="text" 
                className="input" 
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
              />
              <span>Apellidos</span>
            </label>
          </div>  
          <label>
            <input 
              required 
              placeholder="Correo" 
              type="email" 
              className="input" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <span>Correo</span>
          </label> 
          <label>
            <input 
              required 
              placeholder="sebastian.agudelo2" 
              type="text" 
              className="input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <span>Usuario</span>
          </label>
          <label>
            <input 
              required 
              placeholder="# Documento" 
              type="text" 
              className="input" 
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
            <span>CC</span>
          </label>
          <label>
            <input 
              required 
              placeholder="Contraseña" 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span>Contraseña</span>
          </label>
          <label>
            <input 
              required 
              placeholder="Confirmar contraseña" 
              type="password" 
              className="input" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span>Confirmar contraseña</span>
          </label>
          <label>
            <input 
              required 
              placeholder="Celular" 
              type="text" 
              className="input" 
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
            />
            <span>Celular</span>
          </label>
          <label>
            <select
              required 
              className="input" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
            <option value="seleccione">Seleccione:</option>
              <option value="admin">admin</option>
              <option value="Coordinador">Coordinador</option>
              <option value="Evaluador">Evaluador</option>
              <option value="Profesor">Profesor</option>
            </select>
            <span>Role</span>
          </label>
          <button className="submit">CREAR</button>
        </form>
    </Layout>
  );
};

export default Register;