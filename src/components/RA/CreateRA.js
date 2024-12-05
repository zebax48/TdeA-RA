import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import Layout from '../Layout/Layout';
import { BASE_URL } from '../config';
import Spinner from '../Spinner';
import '../../styles/EditUser.css';

const CreateRA = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    facultad: '',
    descripcion: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.facultad === '' || formData.facultad === 'seleccione') {
      window.alert('Seleccione una Facultad para el RA');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/ra/create`, formData, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Resultado de Aprendizaje creado exitosamente');
      navigate('/ra');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        window.alert('El resultado de aprendizaje ya existe');
        return;
      }
      if (error.response && error.response.status === 401) {
        window.alert('La sesión caducó, debes iniciar sesión nuevamente');
        navigate('/login');
      } else {
        console.error('Error al crear el resultado de aprendizaje:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Crear RA</p>
        <label>
          <input
            required
            placeholder="Nombre"
            type="text"
            className="input"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <span>Nombre</span>
        </label>
        <label>
          <select
            required
            className="input"
            name="facultad"
            value={formData.facultad}
            onChange={handleChange}
          >
            <option value="seleccione">Seleccione:</option>
            <option value="Ingeniería">Ingeniería</option>
            <option value="Ciencias Administrativas y Económicas">Ciencias Administrativas y Económicas</option>
            <option value="Educación y Ciencias Sociales">Educación y Ciencias Sociales</option>
            <option value="Derecho y Ciencias Forenses">Derecho y Ciencias Forenses</option>
            <option value="Ciencias Básicas y Áreas Comunes">Ciencias Básicas y Áreas Comunes</option>
          </select>
          <span>Facultad</span>
        </label>
        <label>
          <input
            required
            placeholder="Descripción"
            type="text"
            className="input"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />
          <span>Descripción</span>
        </label>
        <button className="submit" disabled={loading}>
          {loading ? <Spinner size={16} color="#fff" /> : 'Crear'}
        </button>
      </form>
    </Layout>
  );
};

export default CreateRA;