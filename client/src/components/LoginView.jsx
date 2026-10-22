import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, ArrowRight, ShieldCheck, UserCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';

const QUICK_TEST_ACCOUNTS = [
  {
    role: 'author',
    name: 'Priya Sharma',
    badge: 'Author (Multi-Book)',
    email: 'priya.sharma@email.com',
    password: 'author123',
    description: 'Literary fiction author, ₹11,970 royalties earned, ₹3,570 pending.'
  },
  {
    role: 'author',
    name: 'Rohit Kapoor',
    badge: 'Author (Bestseller)',
    email: 'rohit.kapoor@email.com',
    password: 'author123',
    description: 'Tech & business author, 2,000+ copies sold, global distribution.'
  },
  {
    role: 'author',
    name: 'Ananya Reddy',
    badge: 'Author (New Release)',
    email: 'ananya.reddy@email.com',
    password: 'author123',
    description: 'First historical fiction novel, ₹2,546 pending initial cycle payout.'
  },
  {
    role: 'admin',
    name: 'BookLeaf Ops Admin',
    badge: 'BookLeaf Operations Desk',
    email: 'admin@bookleaf.com',
    password: 'admin123',
    description: 'Full admin rights: AI Classification, Response Studio, Queue Management.'
  }
];

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    try {
      setLoading(true);
      setError('');
      await login(acc.email, acc.password);
    } catch (err) {
      console.error(err);
      setError('Quick login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Light green ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-50/60 rounded-full blur-2xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-3">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-1">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-emerald-800 tracking-tight">
          BookLeaf <span className="text-emerald-500 font-bold">Publishing</span>
        </h1>
        <p className="text-sm font-medium text-emerald-600">Author Support & Communication Portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-emerald-950/5 rounded-3xl border border-emerald-100 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-3.5 py-2.5 bg-emerald-50/20 border border-emerald-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 transition placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-emerald-50/20 border border-emerald-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 transition placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-600/20 mt-2 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                1-Click Evaluator Quick Login
              </span>
            </div>
            <div className="space-y-2">
              {QUICK_TEST_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl border border-emerald-100 hover:border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/70 transition group flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition">
                        {acc.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          acc.role === 'admin'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {acc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{acc.description}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-600 shrink-0 mt-1 transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-emerald-700/80 font-medium">
          Pre-seeded with BookLeaf 10-Author & 18-Book Production Dataset
        </p>
      </div>
    </div>
  );
}
