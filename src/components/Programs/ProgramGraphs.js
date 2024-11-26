import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import Layout from '../Layout/Layout';
import Select from 'react-select';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BASE_URL } from '../config';
import '../../styles/AdminUsers.css';
import '../../styles/Graph.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Results = () => {
  const { auth } = useAuth();
  const { programId } = useParams();
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [programName, setProgramName] = useState('');

  const config = {
    headers: {
        Authorization: `${auth.token}`,
    }
};


  useEffect(() => {
    fetch(`${BASE_URL}/api/pruebas`, config)
      .then(response => response.json())
      .then(data => {
        const filteredData = data
          .filter(test => test.programa?._id === programId)
          .map(test => {
            if (!programName) {
              setProgramName(test.programa.nombre);
            }
            return {
              ...test,
              formattedDate: `${test.fecha.split(' - ')[0]} - ${test.fecha.split(' - ')[1]}`,
            };
          });

        filteredData.sort((a, b) => {
          const [dayA, monthA, yearA] = a.fecha.split(' - ')[0].split('/');
          const [dayB, monthB, yearB] = b.fecha.split(' - ')[0].split('/');
          const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
          const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
          const semesterA = parseInt(a.fecha.split(' - ')[1], 10);
          const semesterB = parseInt(b.fecha.split(' - ')[1], 10);
          return dateA - dateB || semesterA - semesterB;
        });

        setTests(filteredData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [programId, programName, selectedSemester]);

  (tests);

  const handleSemesterChange = event => {
    setSelectedSemester(event.target.value);
  };

  const testOptions = tests
    .filter(test => selectedSemester === '' || test.semestre === selectedSemester)
    .map(test => ({ value: test._id, label: `${test.formattedDate} - ${test.nombre}` }));

  const handleTestChange = selectedOptions => {
    const selectedTestIds = selectedOptions.map(option => option.value);
    setSelectedTests(selectedTestIds);
  };

  const filteredTests = tests.filter(test => {
    const testMatch = selectedTests.length === 0 || selectedTests.includes(test._id);
    const semesterMatch = selectedSemester === '' || test.semestre === selectedSemester;
    return testMatch && semesterMatch;
  });

  const getRANameById = (test, raId) => {
    const ra = test.resultadosAprendizaje.find(ra => ra._id === raId);
    return ra ? ra.nombre : 'Nombre no encontrado';
  };

  const calculateRAAverages = (testsToAverage) => {
    const avgRA = testsToAverage.reduce((acc, test) => {
      test.grupos.forEach(group => {
        if (group.promediosRA) {
          group.promediosRA.forEach(ra => {
            const raName = getRANameById(test, ra.ra);
            if (!acc[raName]) {
              acc[raName] = { total: 0, count: 0 };
            }
            acc[raName].total += ra.promedio;
            acc[raName].count += 1;
          });
        }
      });
      return acc;
    }, {});

    return Object.keys(avgRA).map(raName => {
      const { total, count } = avgRA[raName];
      return { ra: raName, promedio: total / count };
    });
  };

  const data = filteredTests.map(test => {
    const avgRA = calculateRAAverages([test]);

    return {
      name: test.nombre,
      date: test.formattedDate,
      totalStudents: test.grupos.reduce((acc, group) => acc + (group.estudiantes ? group.estudiantes.length : 0), 0),
      avgRA,
      avgTest: test.promedioPrueba,
    };
  });

  const calculateGeneralRAAverages = (data) => {
    const avgRA = {};
    
    data.forEach(test => {
      test.avgRA.forEach(ra => {
        if (!avgRA[ra.ra]) {
          avgRA[ra.ra] = { total: 0, count: 0 };
        }
        avgRA[ra.ra].total += ra.promedio;
        avgRA[ra.ra].count += 1;
      });
    });

    return Object.keys(avgRA).map(raName => {
      const { total, count } = avgRA[raName];
      return { ra: raName, promedio: total / count };
    });
  };

  const generalRAData = calculateGeneralRAAverages(data);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        
      },
      y: {
        min: 0,
        max: 5,
      }
    }
  };

  const chartData = {
    labels: data.map(test => test.name),
    datasets: [
      {
        label: 'Promedio de Pruebas',
        data: data.map(test => test.avgTest),
        backgroundColor: 'rgba(34, 139, 34, 0.5)',
        borderColor: 'rgba(34, 139, 34, 1)',
        borderWidth: 1,
        barThickness: 50,
        maxBarThickness: 80
      }
    ]
  };

  const generalRAChartData = {
    labels: generalRAData.map(ra => ra.ra),
    datasets: [
      {
        label: 'Promedio General por RA',
        data: generalRAData.map(ra => ra.promedio),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barThickness: 50,
        maxBarThickness: 80
      }
    ]
  };

  return (
    <Layout>
      <div>
        <p className='title'>Pruebas realizadas a {programName}</p>
        <div className='select-container'>
          <h3>Filtrar por semestre evaluado:</h3>
          <select onChange={handleSemesterChange} value={selectedSemester}>
            <option value="">Todos</option>
            {[...Array(10).keys()].map(num => (
              <option key={num + 1} value={num + 1}>{num + 1}</option>
            ))}
          </select>
        </div>
        <div className='select-container'>
          <h3>Filtrar por Pruebas:</h3>
          <Select
            isMulti
            options={testOptions}
            onChange={handleTestChange}
          />
        </div>
        
        <div className='graph-container'>
          {filteredTests.length === 0 && <p>No hay pruebas disponibles con los filtros seleccionados.</p>}
          {filteredTests.length > 0 && (
            <>
              <h2>Promedios Generales</h2>
              <div className='general-average-chart'>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </>
          )}
        </div>
        <div className='graph-container'>
          {generalRAData.length > 0 && (
            <>
              <h2>Promedio General de RA</h2>
              <div className='ra-chart'>
                <Bar data={generalRAChartData} options={chartOptions} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Results;