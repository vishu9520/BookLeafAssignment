import React from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthorDashboard from './components/AuthorDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginView from './components/LoginView';

export default function App() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Loading BookLeaf Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {user.role === 'admin' ? <AdminDashboard /> : <AuthorDashboard />}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 BookLeaf Publishing. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span>Powered by BookLeaf AI Assistant & Real-Time Sync</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
