import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorPage from './ErrorPage';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-rose-800 space-y-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-rose-600 font-bold tracking-wider uppercase">Verifying Authorization...</p>
      </div>
    );
  }

  // If not authenticated, redirect to /login preserving the requested path in state
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is restricted and user's role is not allowed, show 403 Forbidden Error Code page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <ErrorPage
        code={403}
        title="Access Forbidden"
        message={`Your account role (${user.role}) is not authorized to access this administrative portal.`}
      />
    );
  }

  return children;
}
