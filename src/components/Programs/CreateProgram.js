import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../config';
import Layout from '../Layout/Layout';
import Spinner from '../Spinner';
import '../../styles/EditUser.css';

const CreateProgram = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    facultad: '',
    nombre: '',
    semestres: '',
    registroCalificado: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numero = parseInt(formData.semestres);
    if (numero < 1 || numero > 10){
      window.alert('Elija un semestre entre 1 y 10');
      return;
    }

    // Formateo del campo "Registro Calificado"
    let formattedValue = value;
    if (name === 'registroCalificado') {
      formattedValue = formatRegistroCalificado(value);
    }

    setFormData({ ...formData, [name]: formattedValue });
  };

  const formatRegistroCalificado = (value) => {
    // Elimina cualquier carácter que no sea un número
    let cleanedValue = value.replace(/[^0-9]/g, '');

    // Formatear el valor a medida que se escribe
    let formattedValue = '';

    if (cleanedValue.length > 0) {
      formattedValue = cleanedValue.slice(0, 4);
    }
    if (cleanedValue.length >= 4) {
      formattedValue += '-' + cleanedValue.slice(4, 5);
    }
    if (cleanedValue.length >= 5) {
      formattedValue += ' | ' + cleanedValue.slice(5, 9);
    }
    if (cleanedValue.length >= 9) {
      formattedValue += '-' + cleanedValue.slice(9, 10);
    }

    return formattedValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.facultad === '' || formData.facultad === 'seleccione') {
      window.alert('Seleccione una Facultad para el programa');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/programs/create`, formData, {
        headers: {
          Authorization: auth.token,
        },
      });
  
      if (response.data && response.data.programId) {
        const { programId } = response.data;
  
        window.alert('Programa creado exitosamente');
        const confirm = window.confirm('¿Desea agregar RAs al programa?');
        if (confirm) {
          navigate(`/edit-program/${programId}`);
        } else {
          navigate('/programas');
        }
      } else {
        console.error('Error: No se recibió programId en la respuesta');
        window.alert('Error al crear el programa. Inténtelo nuevamente.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        window.alert("El programa ya existe");
      } else if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');
      } else {
        console.error('Error al crear el programa:', error);
        window.alert('Error al crear el programa. Inténtelo nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Crear Programa</p>
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
          <input
            required
            placeholder="Semestres  1 - 10"
            type="number"
            min={1}
            max={10}
            className="input"
            name="semestres"
            value={formData.semestres}
            onChange={handleChange}
            onKeyDown={(e) => e.preventDefault()}
          />
          <span>Semestres</span>
        </label>
        <label>
          <input
            placeholder="Registro Calificado"
            type="text"
            className="input"
            name="registroCalificado"
            value={formData.registroCalificado}
            onChange={handleChange}
          />
          <span>Registro Calificado</span>
        </label>
        <button className="submit" disabled={loading}>
          {loading ? <Spinner size={16} color="#fff" /> : 'Crear'}
        </button>
      </form>
    </Layout>
  );
};

export default CreateProgram;