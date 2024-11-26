import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import Layout from '../Layout/Layout';
import { BASE_URL } from '../config';
import '../../styles/ListRA.css';

const ListRA = () => {
  const { auth } = useAuth();
  const [resultados, setResultados] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    nombre: '',
    facultad: '',
    descripcion: '',
  });

  useEffect(() => {
    fetchResultados();
  }, []);

  const fetchResultados = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/ra`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setResultados(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert('La sesión caducó, debes iniciar sesión nuevamente');
        navigate('/login');
      } else {
        console.error('Error al obtener los resultados de aprendizaje:', error);
      }
    }
  };

  const handleDelete = async (raId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este RA?');
    if (confirmDelete) {
    try {
      await axios.delete(`${BASE_URL}/api/ra/delete/${raId}`, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Resultado de Aprendizaje eliminado exitosamente');
      fetchResultados();
    } catch (error) {
      console.error('Error al eliminar el Resultado de Aprendizaje:', error);
    }
  }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch({
      ...search,
      [name]: value,
    });
  };

  const filteredPrograms = resultados.filter((program) =>
    
    program.nombre.toLowerCase().includes(search.nombre.toLowerCase()) &&
    program.facultad.toLowerCase().includes(search.facultad.toLowerCase()) &&
    program.descripcion.toLowerCase().includes(search.descripcion.toLowerCase())
  );

  return (
    <Layout>
      <div className="admin-users">
        <p className='title'>Resultados de Aprendizaje</p>
        <button>
            <Link to="/crear-ra" className="button">
                 Crear RA
             </Link>
        </button>

        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Facultad</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
            <tr>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Nombre"
                  name="nombre"
                  value={search.nombre}
                  onChange={handleSearchChange}
                  style={{ maxWidth: '10em' }}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Facultad"
                  name="facultad"
                  value={search.facultad}
                  onChange={handleSearchChange}
                  style={{ maxWidth: '10em' }}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Descripción"
                  name="descripcion"
                  value={search.descripcion}
                  onChange={handleSearchChange}
                  style={{ maxWidth: '16em' }}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((ra) => (
              <tr key={ra._id}>
                <td>{ra.nombre}</td>
                <td>{ra.facultad}</td>
                <td>{ra.descripcion}</td>
                <td>
                    <button title='Editar RA'>
                        <Link to={`/editar-ra/${ra._id}`} className="button">
                        &#9998;
                        </Link>
                    </button>

                  <button title='Eliminar RA' onClick={() => handleDelete(ra._id)} className="button">
                        &#935;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ListRA;