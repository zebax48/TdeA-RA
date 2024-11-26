import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/Layout';
import { useAuth } from '../AuthContext/AuthContext';
import { BASE_URL } from '../config';
import '../../styles/ListRA.css';

const Pruebas = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [pruebas, setPruebas] = useState([]);
  const [search, setSearch] = useState({
    nombre: '',
    programa: '',
    semestre: '',
    facultad: '',
    ra: '',
    descripcion: '',
    encargado: '',
    fecha: ''
  });

  useEffect(() => {
    const fetchPruebas = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/pruebas`, {
          headers: {
            Authorization: auth.token,
          },
        });
        setPruebas(response.data);
      } catch (error) {
        console.error('Error fetching pruebas:', error);
      }
    };

    fetchPruebas();
  }, [auth.token]);

  const handleSearchChange = (e) => {
    setSearch({
      ...search,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (id) => {
    navigate(`/editar-prueba/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta prueba?');
    if (confirmDelete) {
      try {
        await axios.delete(`${BASE_URL}/api/pruebas/${id}`, {
          headers: {
            Authorization: auth.token,
          },
        });
        setPruebas(pruebas.filter(prueba => prueba._id !== id));
      } catch (error) {
        console.error('Error deleting prueba:', error);
      }
    }
  };

  const isMatchingSearch = (prueba) => {
    return (
      (prueba.nombre || '').toLowerCase().includes(search.nombre.toLowerCase()) &&
      (prueba.programa?.nombre || '').toLowerCase().includes(search.programa.toLowerCase()) &&
      (prueba.semestre || '').toLowerCase().includes(search.semestre.toLowerCase()) &&
      (prueba.programa?.facultad || '').toLowerCase().includes(search.facultad.toLowerCase()) &&
      (prueba.resultadosAprendizaje?.some(ra => (ra.nombre || '').toLowerCase().includes(search.ra.toLowerCase()))) &&
      (prueba.descripcion || '').toLowerCase().includes(search.descripcion.toLowerCase()) &&
      (prueba.grupos?.some(grupo => {
        const encargado = grupo.encargado || {};
        const fullName = `${encargado.nombres || ''} ${encargado.apellidos || ''}`.toLowerCase().trim();
        return fullName.includes(search.encargado.toLowerCase());
      })) &&
      (prueba.fecha || '').includes(search.fecha)
    );
  };

  return (
    <Layout>
      <div>
        <p className='title'>Pruebas</p>
        <button onClick={() => navigate('/crear-prueba')}>Crear Prueba</button>
        <button onClick={() => navigate('/grupos')}>Ver grupos</button>
        <table>
          <thead>
            <tr>
              <th>
                Nombre
                <input type="text" name="nombre" value={search.nombre} onChange={handleSearchChange} />
              </th>
              <th>
                Programa
                <input type="text" name="programa" value={search.programa} onChange={handleSearchChange} />
              </th>
              <th>
                Semestre evaluado
                <input type="text" name="semestre" value={search.semestre} onChange={handleSearchChange} />
              </th>
              <th>
                Facultad
                <input type="text" name="facultad" value={search.facultad} onChange={handleSearchChange} />
              </th>
              <th>
                RA
                <input type="text" name="ra" value={search.ra} onChange={handleSearchChange} />
              </th>
              <th>
                Grupos
              </th>
              <th>
                Encargados
                <input type="text" name="encargado" value={search.encargado} onChange={handleSearchChange} />
              </th>
              <th>
                Descripción
                <input type="text" name="descripcion" value={search.descripcion} onChange={handleSearchChange} />
              </th>
              <th>
                Fecha de creación
                <input type="text" name="fecha" value={search.fecha} onChange={handleSearchChange} />
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pruebas.filter(isMatchingSearch).map(prueba => (
              <tr key={prueba._id}>
                <td>{prueba.nombre}</td>
                <td>{prueba.programa?.nombre}</td>
                <td>{prueba.semestre}</td>
                <td>{prueba.programa?.facultad}</td>
                <td>{prueba.resultadosAprendizaje.map(ra => ra.nombre).join(', ')}</td>
                <td>{prueba.grupos.length}</td>
                <td>
                  {prueba.grupos.map(grupo => {
                    const { nombres, apellidos } = grupo.encargado || {};
                    return `${nombres || ''} ${apellidos || ''}`.trim();
                  }).join(', ')}
                </td>
                <td>{prueba.descripcion}</td>
                <td>{prueba.fecha}</td>
                <td>
                  <button title='Editar Prueba' onClick={() => handleEdit(prueba._id)}>&#9998;</button>
                  <button title='Eliminar Prueba' onClick={() => handleDelete(prueba._id)}>&#935;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Pruebas;