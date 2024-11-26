import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/AuthContext/Login';
import Register from './components/Users/Register';
import Recover from './components/Users/Recover';
import Dashboard from './components/Layout/Dashboard';
import AdminUsers from './components/Users/AdminUsers';
import AdminPrograms from './components/Programs/AdminPrograms';
import { AuthProvider } from './components/AuthContext/AuthContext';
import PrivateRoute from './components/AuthContext/PrivateRoute';
import EditUser from './components/Users/EditUser';
import EditProgram from './components/Programs/EditProgram';
import CreateProgram from './components/Programs/CreateProgram';
import ListRA from './components/RA/ListRA';
import CreateRA from './components/RA/CreateRA';
import EditRA from './components/RA/EditRA';
import Pruebas from './components/Pruebas/Pruebas';
import CrearPrueba from './components/Pruebas/CrearPrueba';
import EditarPrueba from './components/Pruebas/EditarPrueba';
import GroupStatus from './components/Pruebas/GroupStatus';
import GroupGraph from './components/Pruebas/GroupGraph';
import GradeStudents from './components/Pruebas/GradeStudents';
import ProgramGraphs from './components/Programs/ProgramGraphs';
import Unauthorized from './components/Layout/Unauthorized';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/recover" element={<Recover />} />
          <Route path="/401" element={<Unauthorized />} />

          {/* Rutas accesibles por Admin y Coordinador */}
          <Route path="/dashboard" element={<PrivateRoute component={Dashboard} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/users" element={<PrivateRoute component={AdminUsers} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/register" element={<PrivateRoute component={Register} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/edit-user/:username" element={<PrivateRoute component={EditUser} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/programas" element={<PrivateRoute component={AdminPrograms} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/crear-programa" element={<PrivateRoute component={CreateProgram} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/results/:programId" element={<PrivateRoute component={ProgramGraphs} allowedRoles={['admin', 'Coordinador']} />}/>
          <Route path="/edit-program/:programId" element={<PrivateRoute component={EditProgram} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/ra" element={<PrivateRoute component={ListRA} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/crear-ra" element={<PrivateRoute component={CreateRA} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/editar-ra/:raId" element={<PrivateRoute component={EditRA} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/pruebas" element={<PrivateRoute component={Pruebas} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/crear-prueba" element={<PrivateRoute component={CrearPrueba} allowedRoles={['admin', 'Coordinador']} />} />
          <Route path="/editar-prueba/:pruebaId" element={<PrivateRoute component={EditarPrueba} allowedRoles={['admin', 'Coordinador']} />} />

          {/* Rutas accesibles por Evaluador */}
          <Route path="/grupos" element={<PrivateRoute component={GroupStatus} allowedRoles={['admin', 'Coordinador', 'Evaluador']} />} />
          <Route path="/resultsGroup/:pruebaId/:groupId" element={<PrivateRoute component={GroupGraph} allowedRoles={['admin', 'Coordinador', 'Evaluador']} />} />
          <Route path="/calificar/:pruebaId/grupos/:grupoId" element={<PrivateRoute component={GradeStudents} allowedRoles={['admin', 'Coordinador', 'Evaluador']} />} />

          {/* Redirigir a login por defecto */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;