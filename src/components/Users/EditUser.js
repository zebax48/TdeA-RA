import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import Layout from '../Layout/Layout';
import { BASE_URL } from '../config';
import '../../styles/EditUser.css';

const EditUser = () => {
  const { auth } = useAuth();
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    newUsername: '',
    newCc: '',
    newPassword: '',
    newNombres: '',
    newApellidos: '',
    newCelular: '',
    newCorreo: '',
    newRole: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, [username]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${username}`, {
        headers: {
          Authorization: auth.token,
        },
        });
      setUser(response.data);
      setFormData({
        newUsername: response.data.username,
        newCc: response.data.cc,
        newNombres: response.data.nombres,
        newApellidos: response.data.apellidos,
        newCelular: response.data.celular,
        newCorreo: response.data.correo,
        newRole: response.data.role,
        newPassword: ''
      });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            window.alert("La sesión caducó, debes iniciar sesión nuevamente");
            navigate('/login');         
          } else {
            console.error('Error al obtener usuarios:', error);
          }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/users/update/${username}`, formData, {        
        headers: {
        Authorization: auth.token,
      }},
    );
      window.alert('Usuario actualizado exitosamente');
      navigate('/users');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            window.alert("La sesión caducó, debes iniciar sesión nuevamente");
            navigate('/login');         
          } else {
            console.error('Error al actualizar el usuario:', error);
          }
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <Layout>

      <form className="form" onSubmit={handleSubmit}>
          <p className="title">Editar usuario</p>
          <div className="flex">
            <label>
              <input 
                required 
                placeholder="Nombres" 
                type="text" 
                className="input"
                name="newNombres" 
                value={formData.newNombres} 
                onChange={handleChange}
              />
              <span>Nombres</span>
            </label>
            <label>
              <input 
                required 
                placeholder="Apellidos" 
                type="text" 
                className="input" 
                name="newApellidos" 
                value={formData.newApellidos} 
                onChange={handleChange}
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
              name="newCorreo" 
              value={formData.newCorreo} 
              onChange={handleChange}
            />
            <span>Correo</span>
          </label> 
          <label>
            <input 
              required 
              placeholder="sebastian.agudelo2" 
              type="text" 
              className="input" 
              name="newUsername" 
              value={formData.newUsername} 
              onChange={handleChange}
            />
            <span>Usuario</span>
          </label>
          <label>
            <input 
              required 
              placeholder="# Documento" 
              type="text" 
              className="input"
              name="newCc" 
              value={formData.newCc} 
              onChange={handleChange} 
            />
            <span>CC</span>
          </label>
          <label>
            <input 
              required 
              placeholder="Celular" 
              type="text" 
              className="input" 
              name="newCelular" 
              value={formData.newCelular} 
              onChange={handleChange}
            />
            <span>Celular</span>
          </label>
          <label>
            <select 
              required 
              className="input" 
              name="newRole" 
              value={formData.newRole} 
              onChange={handleChange}
            >
              <option value="">Seleccione:</option>
              <option value="admin">admin</option>
              <option value="Coordinador">Coordinador</option>
              <option value="Evaluador">Evaluador</option>
              <option value="Profesor">Profesor</option>
            </select>
            <span>Rol</span>
          </label>
          <button className="submit">Actualizar</button>
        </form>
    </Layout>
  );
};

export default EditUser;