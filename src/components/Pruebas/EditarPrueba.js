import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { useAuth } from '../AuthContext/AuthContext';
import { BASE_URL } from '../config';

const EditarPrueba = () => {
  const { pruebaId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [prueba, setPrueba] = useState(null);
  const [nombre, setNombre] = useState('');
  const [semestre, setSemestre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [programas, setProgramas] = useState([]);
  const [ras, setRas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedRas, setSelectedRas] = useState([]);
  const [searchPrograma, setSearchPrograma] = useState('');
  const [searchRa, setSearchRa] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [grupoEncargados, setGrupoEncargados] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [showProgramaSearch, setShowProgramaSearch] = useState(false);

  useEffect(() => {
    const fetchPrueba = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/pruebas/${pruebaId}`, {
          headers: {
            Authorization: auth.token,
          },
        });
        const pruebaData = response.data.prueba;
        ('Prueba data:', pruebaData);

        if (!pruebaData.programa || !pruebaData.programa._id) {
          console.error('Programa no definido en la prueba:', pruebaData);
          return;
        }
        if (!pruebaData.grupos) {
          console.error('Grupos no definidos en la prueba:', pruebaData);
          return;
        }

        setPrueba(pruebaData);
        setNombre(pruebaData.nombre);
        setSemestre(pruebaData.semestre);
        setDescripcion(pruebaData.descripcion);
        setSelectedPrograma(pruebaData.programa._id);
        setSelectedRas(pruebaData.resultadosAprendizaje.map(ra => ra._id));
        setGrupoEncargados(pruebaData.grupos.map(grupo => ({
          grupoId: grupo._id,
          encargadoId: grupo.encargado._id,
          encargadoNombre: `${grupo.encargado.nombres} ${grupo.encargado.apellidos}`,
          grupoNombre: grupo.nombre
        })));
      } catch (error) {
        console.error('Error fetching prueba:', error);
      }
    };

    const fetchData = async () => {
      try {
        const programasResponse = await axios.get(`${BASE_URL}/api/programs`, {
          headers: {
            Authorization: auth.token,
          },
        });
        setProgramas(programasResponse.data);

        const usuariosResponse = await axios.get(`${BASE_URL}/api/users`, {
          headers: {
            Authorization: auth.token,
          },
        });
        setUsuarios(usuariosResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchPrueba();
    fetchData();
  }, [pruebaId, auth.token]);

  useEffect(() => {
    if (selectedPrograma) {
      const fetchRas = async () => {
        try {
          const raResponse = await axios.get(`${BASE_URL}/api/ra/program/${selectedPrograma}`, {
            headers: {
              Authorization: auth.token,
            },
          });
          setRas(raResponse.data);
        } catch (error) {
          console.error('Error fetching RAs:', error);
        }
      };

      fetchRas();
    }
  }, [selectedPrograma, auth.token]);

  const handleProgramaChange = async (programaId) => {
    const selectedProgramaData = programas.find(programa => programa._id === programaId);
    setSelectedPrograma(programaId);
    setPrueba(prevPrueba => ({
      ...prevPrueba,
      programa: selectedProgramaData
    }));

    // Limpiar los RAs seleccionados
    setSelectedRas([]);

    setShowProgramaSearch(false);
  };

  const handleRaChange = (raId) => {
    setSelectedRas(prevSelectedRas => {
      if (prevSelectedRas.includes(raId)) {
        return prevSelectedRas.filter(id => id !== raId);
      } else {
        return [...prevSelectedRas, raId];
      }
    });
  };

  const handleEncargadoChange = (grupoId, encargadoId, encargadoNombre) => {
    setGrupoEncargados(prevGrupoEncargados =>
      prevGrupoEncargados.map(grupo =>
        grupo.grupoId === grupoId ? { ...grupo, encargadoId, encargadoNombre } : grupo
      )
    );
    setSelectedGrupo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPrograma) {
      console.error('Programa no seleccionado');
      return;
    }

    const updatedPrueba = {
      nombre,
      programaId: selectedPrograma,
      raIds: selectedRas,
      semestre,
      descripcion,
      cantidadGrupos: grupoEncargados.length,
      usuarios: grupoEncargados.map(grupo => grupo.encargadoId)
    };

    try {
      await axios.put(`${BASE_URL}/api/pruebas/${pruebaId}`, updatedPrueba, {
        headers: {
          Authorization: auth.token,
        },
      });
      navigate('/pruebas');
    } catch (error) {
      console.error('Error updating prueba:', error);
    }
  };

  if (!prueba) {
    return <Layout>No se puede mostrar la prueba...</Layout>;
  }

  return (
    <Layout>
      <div className="edit-user">
        <form onSubmit={handleSubmit}>
          <p className="title">Editar Prueba</p>
          <div>
            <span>Nombre de la prueba</span>
            <input className='input' type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
          </div>
          <div>
            <span>Semestre a evaluar</span>
            <input className='input' type="text" value={semestre} onChange={(e) => setSemestre(e.target.value)} />
          </div>
          <div>
            <span>Descripción</span>
            <textarea className='input' value={descripcion} onChange={(e) => setDescripcion(e.target.value)}></textarea>
          </div>
          <div>
            <h2 className='h2'>Programa asociado a la prueba</h2>
            {!showProgramaSearch ? (
              <table>
                <thead>
                  <tr>
                    <th>Nombre del programa</th>
                    <th>Facultad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{prueba.programa?.nombre}</td>
                    <td>{prueba.programa?.facultad}</td>
                    <td>
                      <button className='button' type="button" onClick={() => setShowProgramaSearch(true)}>Cambiar el programa</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div>
                <input
                  className='input'
                  type="text"
                  placeholder="Buscar programa"
                  value={searchPrograma}
                  onChange={(e) => setSearchPrograma(e.target.value)}
                />
                <table>
                  <thead>
                    <tr>
                      <th>Nombre del programa</th>
                      <th>Facultad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programas
                      .filter(programa =>
                        programa.nombre.toLowerCase().includes(searchPrograma.toLowerCase()) ||
                        programa.facultad.toLowerCase().includes(searchPrograma.toLowerCase())
                      )
                      .map(programa => (
                        <tr key={programa._id}>
                          <td>{programa.nombre}</td>
                          <td>{programa.facultad}</td>
                          <td>
                            <button className='button' type="button" onClick={() => handleProgramaChange(programa._id)}>Seleccionar</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div>
            <h2 className='h2'>Resultados de Aprendizaje</h2>
            <input
              className='input'
              type="text"
              placeholder="Buscar RA"
              value={searchRa}
              onChange={(e) => setSearchRa(e.target.value)}
            />
            <table>
              <thead>
                <tr>
                  <th>Nombre del RA</th>
                  <th>Descripción</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {ras
                  .filter(ra =>
                    ra.nombre.toLowerCase().includes(searchRa.toLowerCase()) ||
                    ra.descripcion.toLowerCase().includes(searchRa.toLowerCase())
                  )
                  .map(ra => (
                    <tr key={ra._id}>
                      <td>{ra.nombre}</td>
                      <td>{ra.descripcion}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRas.includes(ra._id)}
                          onChange={() => handleRaChange(ra._id)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2 className='h2'>Encargados de los grupos</h2>
            {grupoEncargados.map(grupo => (
              <div key={grupo.grupoId}>
                <h3>{grupo.grupoNombre}</h3>
                <input
                  className='input'
                  type="text"
                  value={grupo.encargadoNombre}
                  readOnly
                  onClick={() => setSelectedGrupo(grupo.grupoId)}
                />
                {selectedGrupo === grupo.grupoId && (
                  <div>
                    <input
                      type="text"
                      placeholder="Buscar usuario"
                      value={searchUsuarios}
                      onChange={(e) => setSearchUsuarios(e.target.value)}
                    />
                    <table>
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios
                          .filter(user =>
                            user.nombres.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
                            user.apellidos.toLowerCase().includes(searchUsuarios.toLowerCase())
                          )
                          .map(user => (
                            <tr key={user._id}>
                              <td>{user.nombres} {user.apellidos}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleEncargadoChange(grupo.grupoId, user._id, `${user.nombres} ${user.apellidos}`)}
                                >
                                  Seleccionar
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
          <h2 className='h2'></h2>
          <button type="submit">Actualizar Prueba</button>
        </form>
      </div>
    </Layout>
  );
};

export default EditarPrueba;