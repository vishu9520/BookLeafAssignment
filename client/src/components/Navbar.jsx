import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { BookOpen, LogOut, Radio, User, ChevronDown, Check } from 'lucide-react';

const TEST_PERSONAS = [
  { name: 'Priya Sharma (Author)', email: 'priya.sharma@email.com', role: 'author' },
  { name: 'Rohit Kapoor (Author)', email: 'rohit.kapoor@email.com', role: 'author' },
  { name: 'Ananya Reddy (Author)', email: 'ananya.reddy@email.com', role: 'author' },
  { name: 'Vikram Joshi (Author)', email: 'vikram.joshi@email.com', role: 'author' },
  { name: 'BookLeaf Ops Admin', email: 'admin@bookleaf.com', role: 'admin' },
];

export default function Navbar() {
  const { user, logout, login } = useAuth();
  const { isConnected } = useSocket();
  const [personaOpen, setPersonaOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (email, role) => {
    try {
      setSwitching(true);
      const password = role === 'admin' ? 'admin123' : 'author123';
      await login(email, password);
      setPersonaOpen(false);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-sm shadow-emerald-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-emerald-800 tracking-tight">BookLeaf</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {user?.role === 'admin' ? 'Ops Admin Portal' : 'Author Portal'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600/80 font-medium hidden sm:block">Author Support & Communication Platform</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Socket Real-time Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/70 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{isConnected ? 'Real-Time Sync Active' : 'Connecting...'}</span>
          </div>

          {/* Quick Switch Persona (Evaluation helper) */}
          <div className="relative">
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-xs font-semibold text-emerald-800 transition"
              title="Quickly switch between Author and Admin test accounts"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Switch Persona</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {personaOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-emerald-100 p-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-50 mb-1">
                  Test Credentials Quick Switch
                </div>
                {TEST_PERSONAS.map((p) => {
                  const isActive = user?.email === p.email;
                  return (
                    <button
                      key={p.email}
                      disabled={switching}
                      onClick={() => handleSwitch(p.email, p.role)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        isActive ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div>
                        <div className={isActive ? 'text-emerald-800' : 'text-slate-800'}>{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.email}</div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-emerald-100">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user?.name}</div>
              <div className="text-[11px] text-emerald-600 font-medium">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
