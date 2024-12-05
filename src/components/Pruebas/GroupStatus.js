import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import Layout from '../Layout/Layout';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../config';
import Spinner from '../Spinner';
import '../../styles/EditUser.css';

const GroupStatus = () => {
  const { auth } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluatorName, setEvaluatorName] = useState()

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/pruebas`, {
        headers: {
          Authorization: auth.token,
        },
      });

      let fetchedTests = response.data;
      setEvaluatorName(auth.nombres + " " + auth.apellidos);

      if (auth.role === 'Evaluador') {      
        // Filtrar las pruebas Y sus grupos
        fetchedTests = fetchedTests.map(test => ({
          ...test,
          grupos: test.grupos.filter(group => group.encargado._id === auth.id)
        })).filter(test => test.grupos.length > 0);
      }

      setTests(fetchedTests);  // Guardamos el resultado filtrado o no filtrado
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setLoading(false);
    }
  };

  const getProgressStatus = (group, test) => {
    const resultadosAprendizaje = test.resultadosAprendizaje;

    if (!group.estudiantes || group.estudiantes.length === 0 || !resultadosAprendizaje || resultadosAprendizaje.length === 0) {
      return { status: 'Pendiente', percentage: 0 };
    }

    const totalRAs = resultadosAprendizaje.length;
    const totalEstudiantes = group.estudiantes.length;
    const totalNotasRequeridas = totalRAs * totalEstudiantes;

    let totalNotasCompletadas = 0;

    // Iterar sobre cada estudiante
    for (const student of group.estudiantes) {
      // Verifica las notas del estudiante
      const notasCompletadasPorEstudiante = student.notas
        .filter(nota => nota.nota >= 1) // Filtra las notas con al menos 1
        .map(nota => nota.ra._id);

      // Cuenta cuántas RAs tiene completadas este estudiante
      const rAsCompletadasPorEstudiante = resultadosAprendizaje
        .filter(ra => notasCompletadasPorEstudiante.includes(ra._id)).length;

      // Incrementa el total de notas completadas por estudiante
      totalNotasCompletadas += rAsCompletadasPorEstudiante;
    }

    // Calcula el porcentaje de progreso
    const percentage = (totalNotasCompletadas / totalRAs) * 100 / totalEstudiantes;

    // Determina el estado
    const status = percentage === 100 ? '✔' : 'Pendiente';
    return { status, percentage: Math.max(0, Math.min(100, percentage)) }; // Asegura que el porcentaje esté entre 0 y 100
  };

  const pendingGroups = tests.flatMap(test =>
    test.grupos.filter(group => getProgressStatus(group, test).status === 'Pendiente')
  );
  
  const completedGroups = tests.flatMap(test =>
    test.grupos.filter(group => getProgressStatus(group, test).status === '✔')
  );

  if (loading) return <Spinner size={60} fullScreen={true}/>;

  return (
    <Layout>
      <h2>Estado de los Grupos de {evaluatorName}</h2>

      {pendingGroups.length === 0 && completedGroups.length === 0 ? (
        <p>No tienes ningún grupo asignado por el momento.</p>
      ) : (
        <>
          <h3>Pendientes</h3>
          {pendingGroups.length === 0 ? (
            <p>No tienes grupos pendientes por calificar.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre del Grupo</th>
                  <th>Nombre de la Prueba</th>
                  <th>Nombre del Programa</th>
                  <th>Semestre Evaluado</th>
                  <th>Facultad</th>
                  <th>Número de Estudiantes</th>
                  <th>Encargado</th>
                  <th>Progreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) =>
                  test.grupos.map((group) => {
                    const { status, percentage } = getProgressStatus(group, test);
                    return status === 'Pendiente' && (
                      <tr key={group._id}>
                        <td>{group.nombre}</td>
                        <td>{test.nombre}</td>
                        <td>{test.programa.nombre}</td>
                        <td>{test.semestre}</td>
                        <td>{test.programa.facultad}</td>
                        <td>{group.estudiantes.length}</td>
                        <td>{group.encargado.nombres} {group.encargado.apellidos}</td>
                        <td>{percentage.toFixed(0)}%</td>
                        <td>
                          <button className='button'>
                            <Link to={`/calificar/${test._id}/grupos/${group._id}`} className="button">Calificar</Link>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          <h3>Completos</h3>
          {completedGroups.length === 0 ? (
            <p>Aún no hay grupos con evaluación completa.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre del Grupo</th>
                  <th>Nombre de la Prueba</th>
                  <th>Nombre del Programa</th>
                  <th>Semestre Evaluado</th>
                  <th>Facultad</th>
                  <th>Número de Estudiantes</th>
                  <th>Encargado</th>
                  <th>Progreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) =>
                  test.grupos.map((group) => {
                    const { status, percentage } = getProgressStatus(group, test);
                    return status === '✔' && (
                      <tr key={group._id}>
                        <td>{group.nombre}</td>
                        <td>{test.nombre}</td>
                        <td>{test.programa.nombre}</td>
                        <td>{test.semestre}</td>
                        <td>{test.programa.facultad}</td>
                        <td>{group.estudiantes.length}</td>
                        <td>{group.encargado.nombres} {group.encargado.apellidos}</td>
                        <td style={{ textAlign: "center" }}>{status}</td>
                        <td>
                          <button className='button'>
                            <Link to={`/resultsGroup/${test._id}/${group._id}`} className="button">Ver resultados</Link>
                          </button>
                          <button className='button'>
                            <Link to={`/calificar/${test._id}/grupos/${group._id}`} className="button">Editar</Link>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </Layout>
  );
};

export default GroupStatus;