import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import Layout from '../Layout/Layout';
import '../../styles/EditUser.css';
import { AiOutlineSearch } from 'react-icons/ai';
import { BASE_URL } from '../config';

const EditProgram = () => {
  const { auth } = useAuth();
  const { programId } = useParams();
  const [program, setProgram] = useState(null);
  const [formData, setFormData] = useState({
    facultad: '',
    nombre: '',
    semestres: '',
    registroCalificado: ''
  });
  const [associatedRas, setAssociatedRas] = useState([]);
  const [allRas, setAllRas] = useState([]);
  const [searchAssociated, setSearchAssociated] = useState('');
  const [searchAll, setSearchAll] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgram();
    fetchAllRas();
    fetchAssociatedRas();
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/programs/${programId}`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setProgram(response.data);
      setFormData({
        facultad: response.data.facultad,
        nombre: response.data.nombre,
        semestres: response.data.semestres,
        registroCalificado: response.data.registroCalificado
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');
      } else {
        console.error('Error al obtener el programa:', error);
      }
    }
  };

  const fetchAssociatedRas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/ra/program/${programId}`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setAssociatedRas(response.data || []);
    } catch (error) {
      console.error('Error al obtener los RAs asociados:', error);
    }
  };

  const fetchAllRas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/ra`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setAllRas(response.data || []);
    } catch (error) {
      console.error('Error al obtener los RAs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

        // Formateo del campo "Registro Calificado"
        let formattedValue = value;
        if (name === 'registroCalificado') {
          formattedValue = formatRegistroCalificado(value);
        }
    
        setFormData({ ...formData, [name]: formattedValue });
  };

  const formatRegistroCalificado = (value) => {

    let cleanedValue = value.replace(/[^0-9]/g, '');

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
    try {
      await axios.put(`${BASE_URL}/api/programs/update/${programId}`, formData, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Programa actualizado exitosamente');
      navigate('/programas');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        navigate('/programas')
        return;
      }
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');
      } else {
        console.error('Error al actualizar el programa:', error);
      }
    }
  };

  const handleAddRa = async (raId) => {
    try {
      await axios.post(`${BASE_URL}/api/ra/add-programs`, {
        raId,
        programIds: [programId]
      }, {
        headers: {
          Authorization: auth.token,
        },
      });
      fetchAllRas();
      fetchAssociatedRas();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert('La sesión caducó, debes iniciar sesión nuevamente');
        navigate('/login');
      } else {
        window.alert('Error al agregar el RA al programa');
        console.error('Error al agregar el RA al programa:', error);
      }
    }
  };

  const handleRemoveRa = async (raId) => {
    try {
      await axios.post(`${BASE_URL}/api/ra/remove-programs`, {
        raId,
        programIds: [programId]
      }, {
        headers: {
          Authorization: auth.token,
        },
      });
      setAssociatedRas(prevRas => prevRas.filter(ra => ra._id !== raId));
      fetchAllRas();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert('La sesión caducó, debes iniciar sesión nuevamente');
        navigate('/login');
      } else {
        window.alert('Error al excluir el RA del programa');
        console.error('Error al excluir el RA del programa:', error);
      }
    }
  };

  if (!program) return <p>Loading...</p>;

  return (
    <Layout>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Editar Programa</p>
        <label>
        <span>Facultad</span>
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
          
        </label>
        <label>
        <span>Nombre</span>
          <input
            required
            placeholder="Nombre"
            type="text"
            className="input"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          
        </label>
        <label>
        <span>Semestres del programa</span>
          <input
            required
            placeholder="Semestres"
            type="number"
            className="input"
            name="semestres"
            value={formData.semestres}
            onChange={handleChange}
          />
          
        </label>
        <label>
        <span>Registro Calificado</span>
          <input
            placeholder="Registro Calificado"
            type="text"
            className="input"
            name="registroCalificado"
            value={formData.registroCalificado}
            onChange={handleChange}
          />
          
        </label>
        <button className="submit">Actualizar</button>
      </form>

      <h2 className='h2'>RAs Asociados</h2>
      <input
        type="text"
        placeholder="Nombre o descripción"
        value={searchAssociated}
        onChange={(e) => setSearchAssociated(e.target.value)}
      />
      <AiOutlineSearch className="search-icon" style={{ marginLeft: '5px' }}/>
      <table>
        <thead>
          <tr>
            <th>Nombre del RA</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {associatedRas
            .filter(ra =>
              ra.nombre.toLowerCase().includes(searchAssociated.toLowerCase()) ||
              ra.descripcion.toLowerCase().includes(searchAssociated.toLowerCase())
            )
            .map((ra) => (
              <tr key={ra._id}>
                <td>{ra.nombre}</td>
                <td>{ra.descripcion}</td>
                <td>
                  <button onClick={() => handleRemoveRa(ra._id)} className="button">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <h2 className='h2'>Agregar RAs al Programa</h2>
      <input
        type="text"
        placeholder="Nombre o descripción"
        value={searchAll}
        onChange={(e) => setSearchAll(e.target.value)}
      />
      <AiOutlineSearch className="search-icon" style={{ marginLeft: '5px' }}/>
      <table>
        <thead>
          <tr>
            <th>Nombre del RA</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {allRas
            .filter((ra) => 
              !associatedRas.some((ar) => ar._id === ra._id) &&
              (ra.nombre.toLowerCase().includes(searchAll.toLowerCase()) ||
              ra.descripcion.toLowerCase().includes(searchAll.toLowerCase()))
            )
            .map((ra) => (
              <tr key={ra._id}>
                <td>{ra.nombre}</td>
                <td>{ra.descripcion}</td>
                <td>
                  <button onClick={() => handleAddRa(ra._id)} className="button">
                    Agregar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default EditProgram;