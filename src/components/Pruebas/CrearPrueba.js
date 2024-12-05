import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../Layout/Layout';
import { useAuth } from '../AuthContext/AuthContext';
import '../../styles/EditUser.css';
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { MdAdd } from 'react-icons/md';
import { BASE_URL } from '../config';
import Spinner from '../Spinner';

const CrearPrueba = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [semestre, setSemestre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidadGrupos, setCantidadGrupos] = useState(1);
  const [ras, setRas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedRas, setSelectedRas] = useState([]);
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [searchPrograma, setSearchPrograma] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [searchRa, setSearchRa] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0]; // Formato yyyy-MM-dd
    setFecha(currentDate);
    updateSemestre(currentDate);
  }, []);

  const updateSemestre = (date) => {
    const month = new Date(date).getMonth() + 1;
    const semester = month <= 6 ? 1 : 2;
    setSemestre(semester);
  };

  const formatFecha = (date) => {
    const [year, month, day] = date.split('-'); // yyyy-MM-dd
    return `${day}/${month}/${year} - ${semestre}`; // Formato DD-MM-YYYY / X
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const raResponse = await axios.get(`${BASE_URL}/api/ra/`, {
          headers: {
            Authorization: auth.token,
          },
        });
        setRas(raResponse.data);

        const usuariosResponse = await axios.get(`${BASE_URL}/api/users`, {
          headers: {
            Authorization: auth.token,
          },
        });
        setUsuarios(usuariosResponse.data);

        const programasResponse = await axios.get(`${BASE_URL}/api/programs`, {
          headers: {
            Authorization: auth.token,
          },
        });
        setProgramas(programasResponse.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.alert("La sesión caducó, debes iniciar sesión nuevamente");
          navigate('/login');
        } else {
          window.alert("Vaya, ha ocurrido un error al obtener los datos para crear pruebas");
          console.error('Error al obtener datos para crear PRUEBAS:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.token, navigate]);

  const handleCrearPrueba = async () => {
    const formattedFecha = formatFecha(fecha); // Formato de fecha con semestre
    const pruebaData = {
      programaId: selectedPrograma,
      raIds: selectedRas,
      usuarios: selectedUsuarios,
      nombre,
      semestre,
      descripcion,
      cantidadGrupos,
      fecha: formattedFecha
    };
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/pruebas/create-prueba`, pruebaData, {
        headers: { 
          Authorization: auth.token 
        },
      });
      alert('Prueba creada con éxito');
      navigate('/pruebas');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');
      } else {
        window.alert("Faltan campos para poder crear la prueba, intenta nuevamente");
        console.error('Error al crear PRUEBAS:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPrograma = (e) => {
    setSearchPrograma(e.target.value);
  };

  const handleSearchUsuarios = (e) => {
    setSearchUsuarios(e.target.value);
  };

  const handleSearchRa = (e) => {
    setSearchRa(e.target.value);
  };

  const handleFechaChange = (e) => {
    const newDate = e.target.value;
    setFecha(newDate);
    updateSemestre(newDate);
  };

  const handleCantidadGruposChange = (e) => {
    setCantidadGrupos(parseInt(e.target.value, 10));
  };

  const handleProgramaSelection = (programaId, programaNombre) => {
    if (selectedPrograma === programaId) {
      setSelectedPrograma(null);
      setSelectedRas([]);
      setSearchPrograma('');
    } else {
      setSelectedPrograma(programaId);
      setSelectedRas([]);
      setSearchPrograma(programaNombre);
    }
  };

  return (
    <Layout>
      <div className="admin-users">
        <form className="form">
          <p className="title">Crear prueba</p>
          {loading && <Spinner size={60} fullScreen={true}/>}
          <div>
            <label>Nombre de la prueba</label>
            <input
              required
              type="text"
              className="input"
              placeholder='Nombre'
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label>Semestre a evaluar</label>
            <input
              required
              type="number"
              className="input"
              placeholder='Semestre'
              value={semestre}
              readOnly
            />
          </div>
          <div>
            <label>Descripción</label>
            <textarea
              required
              className="input"
              placeholder='Descripción'
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div>
            <label>Cantidad de Grupos</label>
            <input 
              required
              type="number"
              min="1"
              className="input"
              placeholder='Cantidad de Grupos'
              value={cantidadGrupos}
              onChange={handleCantidadGruposChange}
              onKeyDown={(e) => e.preventDefault()}
            />
          </div>
        </form>

        <h2>Programas</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar Programa"
            value={searchPrograma}
            onChange={handleSearchPrograma}
          />
          <AiOutlineSearch className="search-icon" style={{ marginLeft: '5px' }}/>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre del Programa</th>
              <th>Facultad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {programas.filter((programa) =>
              programa.nombre.toLowerCase().includes(searchPrograma.toLowerCase()) ||
              programa.facultad.toLowerCase().includes(searchPrograma.toLowerCase())
            ).map((programa) => (
              <tr key={programa._id}>
                <td>{programa.nombre}</td>
                <td>{programa.facultad}</td>
                <td>
                  <button onClick={() => handleProgramaSelection(programa._id, programa.nombre)}>
                    {selectedPrograma === programa._id ? 'Cambiar el programa' : 'Seleccionar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedPrograma && (
          <>
            <h2>Seleccionar Resultados de Aprendizaje (RA)</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar RA"
                value={searchRa}
                onChange={handleSearchRa}
              />
              <AiOutlineSearch className="search-icon" style={{ marginLeft: '5px' }}/>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nombre del RA</th>
                  <th>Descripción</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {ras.filter((ra) =>
                  ra.programas.includes(selectedPrograma) &&
                  (ra.nombre.toLowerCase().includes(searchRa.toLowerCase()) ||
                  ra.descripcion.toLowerCase().includes(searchRa.toLowerCase()))
                ).map((ra) => (
                  <tr key={ra._id}>
                    <td>{ra.nombre}</td>
                    <td>{ra.descripcion}</td>
                    <td>
                      <input
                        required
                        type="checkbox"
                        checked={selectedRas.includes(ra._id)}
                        onChange={() => {
                          const selected = selectedRas.includes(ra._id);
                          setSelectedRas((prev) =>
                            selected
                              ? prev.filter((id) => id !== ra._id)
                              : [...prev, ra._id]
                          );
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Seleccione el usuario encargado por grupo</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar Usuario"
                value={searchUsuarios}
                onChange={handleSearchUsuarios}
              />
              <AiOutlineSearch className="search-icon" style={{ marginLeft: '5px' }}/>
            </div>
            {[...Array(cantidadGrupos)].map((_, index) => (
              <div key={index}>
                <h2>Grupo {index + 1}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombres</th>
                      <th>Apellidos</th>
                      <th>Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.filter((usuario) =>
                      usuario.username.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
                      usuario.nombres.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
                      usuario.apellidos.toLowerCase().includes(searchUsuarios.toLowerCase())
                    ).map((usuario) => (
                      <tr key={usuario._id}>
                        <td>{usuario.username}</td>
                        <td>{usuario.nombres}</td>
                        <td>{usuario.apellidos}</td>
                        <td>
                          <input
                            required
                            type="checkbox"
                            checked={selectedUsuarios[index] === usuario._id}
                            onChange={() => {
                              const newSelectedUsuarios = [...selectedUsuarios];
                              newSelectedUsuarios[index] = usuario._id;
                              setSelectedUsuarios(newSelectedUsuarios);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <h2>Fecha de creación de la prueba</h2>
            <input
              required
              type="date"
              className="input"
              value={fecha}
              onChange={handleFechaChange}
            />
            <div style={{ textAlign: 'center' }}>
              <button className='button' onClick={handleCrearPrueba}>
                 CREAR PRUEBA <MdAdd style={{ marginRight: '5px' }} />
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CrearPrueba;