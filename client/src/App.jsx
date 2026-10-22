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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-emerald-800 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-emerald-600 font-bold tracking-wider uppercase">Loading BookLeaf Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 bg-white">
        {user.role === 'admin' ? <AdminDashboard /> : <AuthorDashboard />}
      </main>
      <footer className="bg-white border-t border-emerald-100 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-slate-600 font-medium">© 2026 <strong className="text-emerald-700">BookLeaf Publishing</strong>. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-emerald-600/80 font-medium">
            <span>Powered by BookLeaf AI Assistant & Real-Time Sync</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
