import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { auth } = useAuth();

  // Si el usuario no está autenticado, redirige a /login
  if (!auth || !auth.token) {
    return <Navigate to="/login" />;
  }

  // Si el usuario no tiene el rol adecuado, redirige al dashboard o a una página de acceso denegado
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/401" />;
  }

  // Si el usuario está autenticado y tiene el rol adecuado, renderiza el componente
  return <Component {...rest} />;
};

export default PrivateRoute;