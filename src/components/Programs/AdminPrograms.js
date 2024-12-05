import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Spinner from '../Spinner';
import '../../styles/AdminUsers.css';
import { BASE_URL } from '../config';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({
    facultad: '',
    nombre: '',
    semestres: '',
    registroCalificado: ''
  });
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/programs`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setPrograms(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');
      } else {
        console.error('Error al obtener los programas:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (programId) => {
    navigate(`/edit-program/${programId}`);
  };

  const handleDelete = async (programId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este programa?');
    if (confirmDelete) {
      try {
        await axios.delete(`${BASE_URL}/api/programs/delete/${programId}`, {
          headers: {
            Authorization: auth.token,
          },
        });
        fetchPrograms();
        window.alert("Programa eliminado exitosamente");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.alert("La sesión caducó, debes iniciar sesión nuevamente");
          navigate('/login');
        } else {
          console.error('Error al eliminar el programa:', error);
        }
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

  const filteredPrograms = programs.filter((program) =>
    program.facultad.toLowerCase().includes(search.facultad.toLowerCase()) &&
    program.nombre.toLowerCase().includes(search.nombre.toLowerCase()) &&
    program.semestres.toString().includes(search.semestres) &&
    program.registroCalificado.toLowerCase().includes(search.registroCalificado.toLowerCase())
  );

  return (
    <Layout>
      <div className="admin-users">
        <p className='title'>Programas</p>
        {loading && <Spinner size={60} fullScreen={true}/>}
        <button onClick={() => navigate('/crear-programa')}>Crear Programa</button>
        <table>
          <thead>
            <tr>
              <th>Facultad</th>
              <th>Nombre</th>
              <th>Semestres</th>
              <th>Registro Calificado</th>
              <th>Acciones</th>
            </tr>
            <tr>
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
                  placeholder="Buscar Semestres"
                  name="semestres"
                  value={search.semestres}
                  onChange={handleSearchChange}
                  style={{ maxWidth: '9em' }}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar RC"
                  name="registroCalificado"
                  value={search.registroCalificado}
                  onChange={handleSearchChange}
                  style={{ maxWidth: '9em' }}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((program) => (
              <tr key={program._id}>
                <td>{program.facultad}</td>
                <td>{program.nombre}</td>
                <td>{program.semestres}</td>
                <td>{program.registroCalificado}</td>
                <td>
                  <button title="Ver resultados" onClick={() => navigate(`/results/${program._id}`)}>Ver resultados</button>
                  <button title="Editar este Programa" onClick={() => handleEdit(program._id)}>&#9998;</button>
                  <button title="Eliminar este Programa" onClick={() => handleDelete(program._id)}>&#935;</button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminPrograms;
