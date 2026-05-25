import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
export const RequireAuth = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user, isAdmin } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Загрузка...</div>
      </div>
    );
  }


  if (!isAuthenticated) {
    if (currentPath === '/login') {
      return null;
    }

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }
  if (requiredRole) {
    if (requiredRole === 'admin' && !isAdmin) {
      if (currentPath === '/') {
        return null;
      }
      return <Navigate to="/" replace />;
    }
    if (requiredRole !== 'admin' && user?.role !== requiredRole) {
      if (currentPath === '/') {
        return null;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
