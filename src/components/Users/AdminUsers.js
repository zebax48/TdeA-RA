import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { BASE_URL } from '../config';
import '../../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState({
    username: '',
    cc: '',
    nombres: '',
    apellidos: '',
    celular: '',
    correo: '',
    role: '',
  });
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setUsers(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');         
      } else {
        console.error('Error al actualizar el usuario:', error);
      }
    }
  };

  const handleEdit = (username) => {
    navigate(`/edit-user/${username}`);
  };

  const handleDelete = async (username) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (confirmDelete) {
      try {
        await axios.delete(`${BASE_URL}/api/users/delete/${username}`, {
          headers: {
            Authorization: auth.token,
          },
        });
        fetchUsers();
        window.alert("Usuario eliminado exitosamente");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.alert("La sesión caducó, debes iniciar sesión nuevamente");
          navigate('/login');         
        } else {
          console.error('Error al eliminar el usuario:', error);
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

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.username.toLowerCase()) &&
    user.cc.toLowerCase().includes(search.cc.toLowerCase()) &&
    user.nombres.toLowerCase().includes(search.nombres.toLowerCase()) &&
    user.apellidos.toLowerCase().includes(search.apellidos.toLowerCase()) &&
    user.celular.toLowerCase().includes(search.celular.toLowerCase()) &&
    user.correo.toLowerCase().includes(search.correo.toLowerCase()) &&
    user.role.toLowerCase().includes(search.role.toLowerCase())
  );

  return (
    <Layout>
      <div className="admin-users">
      <h1>Usuarios</h1>
        <button onClick={() => navigate('/register')}>Crear Usuario</button>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>CC</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Celular</th>
              <th>Correo</th>
              <th>Role</th>
              <th>Acciones</th>
            </tr>
            <tr>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Username"
                  name="username"
                  value={search.username}
                  onChange={handleSearchChange}
                  style={{maxWidth: '8em'}}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar CC"
                  name="cc"
                  value={search.cc}
                  onChange={handleSearchChange}
                  style={{maxWidth: '8em'}}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Nombres"
                  name="nombres"
                  value={search.nombres}
                  onChange={handleSearchChange}
                  style={{maxWidth: '8em'}}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Apellidos"
                  name="apellidos"
                  value={search.apellidos}
                  onChange={handleSearchChange}
                  style={{maxWidth: '8em'}}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Celular"
                  name="celular"
                  value={search.celular}
                  onChange={handleSearchChange}
                  style={{maxWidth: '8em'}}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Correo"
                  name="correo"
                  value={search.correo}
                  onChange={handleSearchChange}
                  style={{maxWidth: '15em'}}
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Buscar Role"
                  name="role"
                  value={search.role}
                  onChange={handleSearchChange}
                  style={{maxWidth: '8em'}}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.cc}</td>
                <td>{user.nombres}</td>
                <td>{user.apellidos}</td>
                <td>{user.celular}</td>
                <td>{user.correo}</td>
                <td>{user.role}</td>
                <td>
                  <button title="Editar este Usuario" onClick={() => handleEdit(user.username)}>&#9998;</button>
                  <button title="Eliminar este Usuario" onClick={() => handleDelete(user.username)}>&#935;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminUsers;