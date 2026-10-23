import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthorDashboard from './components/AuthorDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginView from './components/LoginView';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorPage from './components/ErrorPage';

// Shared Layout with Navbar & Footer for authenticated views
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <footer className="bg-white border-t border-rose-100 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-slate-600 font-medium">
            © 2026 <strong className="text-rose-600">BookLeaf Publishing</strong>. All rights reserved.
          </span>
          <span className="flex items-center gap-1.5 text-rose-600/80 font-medium">
            <span>Powered by BookLeaf AI Assistant & Real-Time Sync</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

// Root route resolver based on auth state and role
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-rose-800 space-y-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-rose-600 font-bold tracking-wider uppercase">Loading BookLeaf Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/author" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main BookLeaf Homepage / Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Login Route */}
        <Route path="/login" element={<LoginView />} />

        {/* Dedicated Author Portal Route */}
        <Route
          path="/author"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AppLayout>
                <AuthorDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Dedicated Admin Portal Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route for missing/invalid routes with flashing HTTP 404 error code */}
        <Route
          path="*"
          element={
            <ErrorPage
              code={404}
              title="Page Not Found"
              message="The requested route does not exist on this server. Please check your URL or return to your portal."
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
