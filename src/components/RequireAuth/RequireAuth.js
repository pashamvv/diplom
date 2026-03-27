import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
export const RequireAuth = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Загрузка...</div>
      </div>
    );
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (requiredRole) {
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    if (requiredRole !== 'admin' && user?.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
