import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import axios from 'axios';
import Layout from '../Layout/Layout';
import '../../styles/EditUser.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { BASE_URL } from '../config';

const GradeStudents = () => {
  const { auth } = useAuth();
  const { pruebaId, grupoId } = useParams();
  const [test, setTest] = useState(null);
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [newStudentDocumento, setNewStudentDocumento] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedRA, setSelectedRA] = useState(null);
  const [updatedStudents, setUpdatedStudents] = useState([]);
  const [selectedNotaId, setSelectedNotaId] = useState(null);

  useEffect(() => {
    fetchTestAndGroup();
  }, [pruebaId, grupoId]);
  
  const exportToExcel = () => {
    if (!test || !group) {
      console.error("No hay datos disponibles para exportar.");
      return;
    }
  
    const wb = XLSX.utils.book_new();
  
    const studentHeaders = [
      'Documento', 'Nombre',
      ...test.resultadosAprendizaje.map(ra => ra.nombre),
      '', '', '',
    ];
  
    const studentRows = group.estudiantes.map(student => {
      const raNotas = test.resultadosAprendizaje.map(ra => {
        const raNota = student.notas.find(n => n.ra._id === ra._id);
        return raNota ? raNota.nota : '';
      });
  
      return [
        student.documento,
        student.nombre,
        ...raNotas,
        '', '', '',
      ];
    });
  
    // Cálculo del promedio de cada RA
    const promedioRA = test.resultadosAprendizaje.map(ra => {
      return group.estudiantes.length
        ? group.estudiantes.reduce((acc, student) => {
            const raNota = student.notas.find(n => n.ra._id === ra._id);
            return acc + (raNota ? parseFloat(raNota.nota || '0') : 0);
          }, 0) / group.estudiantes.length
        : '';
    });
  
    // Cálculo del promedio del grupo
    const promedioGrupo = group.estudiantes.length
      ? group.estudiantes.reduce((acc, student) => {
          const raNotas = test.resultadosAprendizaje.map(ra => {
            const raNota = student.notas.find(n => n.ra._id === ra._id);
            return raNota ? parseFloat(raNota.nota || '0') : 0;
          });
          return acc + (raNotas.length
            ? raNotas.reduce((acc, nota) => acc + nota, 0) / raNotas.length
            : 0);
        }, 0) / group.estudiantes.length
      : '';
  
    const summaryRows = [
      ...test.resultadosAprendizaje.map((ra, index) => [
        `Prom ${ra.nombre}`,
        promedioRA[index] ? promedioRA[index].toFixed(2) : '',
      ]),
      [
        'Prom Grupo',
        promedioGrupo.toFixed(2),
      ]
    ];
  
    const wsData = [
      studentHeaders,
      ...studentRows,
      [],
      ['Promedios', 'Valor'],
      ...summaryRows
    ];
  
    // Crear la hoja de Excel con los datos
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, `Reporte`);
  
    // Generar el archivo de Excel y guardarlo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${test.programa.nombre}_${test.nombre}_${group.nombre}.xlsx`);
  };
  
  const fetchTestAndGroup = async () => {
    try {
      const testResponse = await axios.get(`${BASE_URL}/api/pruebas/${pruebaId}`, {
        headers: { Authorization: auth.token },
      });
      const prueba = testResponse.data.prueba;
      setTest(prueba);

      const grupo = prueba.grupos.find(g => g._id === grupoId);
      if (grupo) {
        grupo.estudiantes.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setGroup(grupo);
        setStudents(grupo.estudiantes || []);
      } else {
        console.error('Grupo no encontrado');
      }
    } catch (error) {
      console.error('Error fetching test and group:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${BASE_URL}/api/pruebas/${pruebaId}/grupos/${grupoId}/importar-estudiantes`, formData, {
        headers: {
          Authorization: auth.token,
          'Content-Type': 'multipart/form-data',
        },
      });
      window.alert('Estudiantes importados correctamente');
      fetchTestAndGroup();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleAddStudent = async () => {
    if (newStudentDocumento === '' || newStudentName === '') {
        window.alert('Por favor especifique un documento y nombre válido');
        return;
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/pruebas/${pruebaId}/grupos/${grupoId}/estudiantes`, {
            documento: newStudentDocumento,
            nombre: newStudentName,
            notas: [] // Inicializamos con una lista vacía de notas
        }, {
            headers: {
                Authorization: auth.token,
                'Content-Type': 'application/json',
            }
        });

        window.alert('Estudiante agregado exitosamente');
        fetchTestAndGroup(); // Actualiza la lista de estudiantes
        setNewStudentDocumento('');
        setNewStudentName('');
    } catch (error) {
        console.error('Error al agregar estudiante:', error);
    }
};

  const handleDeleteStudent = async (studentId) => {
    try {
      await axios.delete(`${BASE_URL}/api/pruebas/${pruebaId}/grupos/${grupoId}/estudiantes/${studentId}`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setStudents(students.filter(student => student._id !== studentId));
      setUpdatedStudents(updatedStudents.filter(id => id !== studentId));
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
    }
  };

  const handleNameChange = (studentId, value) => {
    setStudents(prevStudents => prevStudents.map(student => {
      if (student._id === studentId) {
        return { ...student, nombre: value };
      }
      return student;
    }));
  };

  const handleGradeChange = (studentId, raId, value) => {
    const sanitizedValue = value.replace(',', '.');
  
    // Validar el valor numérico
    if (sanitizedValue !== '' && (isNaN(sanitizedValue) || parseFloat(sanitizedValue) > 5)) return;
  
    setStudents(prevStudents => prevStudents.map(student => {
      if (student._id === studentId) {
        const existingNota = student.notas.find(nota => nota.ra._id === raId);
        const updatedNotas = student.notas.map(nota => {
          if (nota.ra._id === raId) {
            // Actualizar la nota existente
            return { ...nota, nota: sanitizedValue };
          }
          return nota;
        });

        // Si la nota no existía, agregarla
        if (!existingNota) {
          updatedNotas.push({ ra: { _id: raId }, nota: sanitizedValue });
        }

        return { ...student, notas: updatedNotas };
      }
      return student;
    }));

    // Marcar al estudiante como actualizado
    setUpdatedStudents(prev => [...prev, studentId]);
};

const handleBlur = async (studentId) => {
  try {
      const studentToUpdate = students.find(student => student._id === studentId);
      if (!studentToUpdate) return;

      const { documento, nombre, notas } = studentToUpdate;

      // Encontrar la nota específica que debe actualizarse
      const notasToUpdate = notas.map(nota => ({
          ...nota,
          _id: nota._id // Asegúrate de incluir el _id aquí para actualizar la nota específica
      }));

      await axios.put(
          `${BASE_URL}/api/pruebas/${pruebaId}/grupos/${grupoId}/estudiantes/${studentId}/notas/${selectedNotaId}`,
          { documento, nombre, notas: notasToUpdate },
          { headers: { Authorization: auth.token, 'Content-Type': 'application/json' } }
      );

      if (!updatedStudents.includes(studentId)) {
          setUpdatedStudents(prev => [...prev, studentId]);
      }

  } catch (error) {
      console.error('Error al actualizar el estudiante:', error);
  }
};

const handleSelectRA = (ra) => {
  setSelectedRA(ra);
  setSelectedNotaId(null);
  setUpdatedStudents([]);
};

  if (!test || !group) return <p>Loading...</p>;

  return (
    <Layout>
      <p className='title'>{test.nombre} - {test.programa.nombre} - {group.nombre}</p>

      <h3>Importar Estudiantes - Excel</h3>
      <div className="file-upload">
        <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
      </div>

      <h3>Agregar Nuevo Estudiante</h3>
      <input
        style={{ marginRight: '1em' }}
        type="text"
        placeholder="Documento"
        value={newStudentDocumento}
        onChange={(e) => setNewStudentDocumento(e.target.value)}
      />
      <input
        type="text"
        placeholder="Nombre del Estudiante"
        value={newStudentName}
        onChange={(e) => setNewStudentName(e.target.value)}
      />
      <button style={{ marginLeft: '1em' }} onClick={handleAddStudent}>Agregar Estudiante</button>

      <h3>Resultados de Aprendizaje</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre del RA</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {test.resultadosAprendizaje.map((ra) => (
            <tr key={ra._id}>
              <td>{ra.nombre}</td>
              <td>{ra.descripcion}</td>
              <td>
                <button onClick={() => handleSelectRA(ra)}>Calificar este RA</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRA && (
        <div>
          <p className='title'>Calificando: {selectedRA.nombre}</p>
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre del Estudiante</th>
                <th>Nota</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>
                    <input
                      type="text"
                      value={student.documento}
                      disabled // Hacer que el campo de documento no sea editable
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={student.nombre}
                      onChange={(e) => handleNameChange(student._id, e.target.value)}
                      onBlur={() => handleBlur(student._id)}
                    />
                  </td>
                  <td>
                    <input
                    type="text"
                    value={student.notas.find(nota => nota.ra._id === selectedRA._id)?.nota || ''}
                    onChange={(e) => handleGradeChange(student._id, selectedRA._id, e.target.value)}
                    onBlur={() => handleBlur(student._id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {updatedStudents.includes(student._id) && <span style={{ color: 'green' }}>✔</span>}
                      <button style={{ marginLeft: '1em' }} onClick={() => handleDeleteStudent(student._id)}>Eliminar Estudiante</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       <h3>Exportar Datos a Excel</h3>
       <button onClick={() => exportToExcel(group, test)}>Exportar</button>
    </Layout>
  );
};

export default GradeStudents;