import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ShieldAlert, ArrowLeft, Home, Compass } from 'lucide-react';
import BookLeafLogo from './BookLeafLogo';

export default function ErrorPage({ code = 404, title, message }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const is403 = code === 403;
  const is404 = code === 404;

  const defaultTitle = is403 ? 'Access Forbidden' : 'Route Not Found';
  const defaultMessage = is403
    ? 'You do not have permission or administrative clearance to view this route.'
    : 'The route or page you are trying to reach does not exist or has moved.';

  const handleReturn = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/author');
    }
  };

  return (
    <div className="min-h-screen bg-[#fffbfc] flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 max-w-lg w-full text-center space-y-6">
        {/* BookLeaf Logo */}
        <div className="flex justify-center mb-2">
          <BookLeafLogo className="w-14 h-14" />
        </div>

        {/* Large Error Code Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 shadow-sm">
          {is403 ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
          )}
          <span className="font-mono text-sm font-extrabold tracking-wider text-rose-700">
            HTTP {code} ERROR CODE: {is403 ? 'ACCESS_DENIED' : 'ROUTE_NOT_FOUND'}
          </span>
        </div>

        {/* Big Code Text */}
        <div className="relative">
          <h1 className="text-8xl sm:text-9xl font-black text-rose-100 tracking-tight select-none">
            {code}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || defaultTitle}
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {message || defaultMessage}
        </p>

        {/* Requested route indicator */}
        <div className="bg-white p-3 rounded-2xl border border-rose-100 shadow-sm max-w-sm mx-auto text-xs text-slate-500">
          <div className="flex items-center justify-between font-mono">
            <span>Requested Path:</span>
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              {location.pathname}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-rose-50 text-slate-700 font-bold text-xs rounded-xl border border-rose-200 transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={handleReturn}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20 active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isAuthenticated ? 'Return to Dashboard' : 'Go to Login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
