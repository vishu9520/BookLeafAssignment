import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookLeafLogo from './BookLeafLogo';
import {
  Headphones,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Bot
} from 'lucide-react';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePortalRedirect = (role) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'admin' && user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'author') {
      navigate('/author');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <BookLeafLogo className="w-10 h-10" withText={true} />
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Author Support Portal
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => handlePortalRedirect(user?.role)}
                className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-100 transition flex items-center gap-2"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{user?.role === 'admin' ? 'Admin Desk' : user?.name || 'Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition active:scale-95 flex items-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col justify-center py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Official Author Support & Communication Desk</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Author Support & <br />
              <span className="text-rose-600">Communication Portal</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              A unified workspace for BookLeaf authors to track book royalties, monitor production stages, verify ISBN metadata, and converse directly with our operations team.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handlePortalRedirect('author')}
              className="px-7 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/25 transition active:scale-95 flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Enter Author Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePortalRedirect('admin')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-300 transition shadow-sm flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-rose-600" />
              <span>Operations Desk</span>
            </button>
          </div>

          {/* 3 Simple Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Royalty & Sales</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full transparency into your 80/20 net profit split, quarterly earnings, and bank disbursements.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct Support Tickets</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit queries with file attachments. Real-time updates and fast resolution by our ops team.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Production & ISBN</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Monitor book stages from editing to printing and verify global distribution on Amazon and Flipkart.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="bg-white border-t border-rose-100 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>
            © 2026 <strong className="text-slate-800">BookLeaf Publishing</strong> — Author Support & Communication Portal
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/login" className="text-rose-600 hover:underline">
              Portal Sign In
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">support@bookleaf.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
