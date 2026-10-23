import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import TicketDetailModal from './TicketDetailModal';
import {
  Inbox,
  Filter,
  Search,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  User,
  ArrowUpDown,
  BookOpen,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  'all',
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry'
];

const PRIORITIES = ['all', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['all', 'Open', 'In Progress', 'Resolved', 'Closed'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    high: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgent'); // 'urgent' | 'oldest_unresolved' | 'newest'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected ticket for modal
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Fetch queue
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        sortBy: sortBy,
        search: searchQuery
      };
      const res = await api.get('/tickets', { params });
      setTickets(res.data.data.tickets);
      setMetrics(res.data.data.metrics);
    } catch (err) {
      console.error('Failed to load tickets queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter, sortBy]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  // Real-time socket event handling
  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (newTicket) => {
      setTickets((prev) => [newTicket, ...prev.filter(t => t._id !== newTicket._id)]);
      setMetrics((prev) => ({
        ...prev,
        total: prev.total + 1,
        open: prev.open + 1,
        critical: newTicket.priority === 'Critical' ? prev.critical + 1 : prev.critical,
        high: newTicket.priority === 'High' ? prev.high + 1 : prev.high
      }));
    };

    const handleTicketUpdated = (updated) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
      );
    };

    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:updated', handleTicketUpdated);

    return () => {
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:updated', handleTicketUpdated);
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in bg-white min-h-[calc(100vh-4rem)]">
      {/* Top Banner & Queue Metrics - White & BookLeaf Coral */}
      <div className="bg-gradient-to-r from-rose-50/70 via-white to-pink-50/50 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm border border-rose-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 text-rose-800 text-xs font-bold border border-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>BookLeaf Publishing Operations Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
              Author Support & <span className="text-rose-600">Ticket Queue</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Automated AI Classification, Priority Assessment & Knowledge Base Response Drafting.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold rounded-xl border border-rose-200 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* High-level Queue Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-rose-100">
          <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Tickets</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.total}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm">
            <div className="text-[11px] text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Open Tickets
            </div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{metrics.open}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm">
            <div className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">In Progress</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.inProgress}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm">
            <div className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">Resolved</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{metrics.resolved}</div>
          </div>
          <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200/80 col-span-2 sm:col-span-1 shadow-sm">
            <div className="text-[11px] text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Critical / High
            </div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {(metrics.critical || 0) + (metrics.high || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #, subject, author name, or book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-rose-50/20 border border-rose-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Statuses</option>
              {STATUSES.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 max-w-[180px] truncate"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.filter(p => p !== 'all').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-rose-100">
              <ArrowUpDown className="w-3.5 h-3.5 text-rose-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-rose-100/70 border border-rose-300 text-rose-900 rounded-xl text-xs font-extrabold focus:ring-2 focus:ring-rose-500"
              >
                <option value="urgent">🚨 Urgent First</option>
                <option value="oldest_unresolved">⏳ Oldest Unresolved</option>
                <option value="newest">🕒 Newest First</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Ticket Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-rose-800 px-1">
          <span>Displaying {tickets.length} tickets in queue</span>
          <span>Click any ticket to review AI draft, override tags, or respond</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-rose-700">Loading queue...</div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-rose-100 space-y-2">
            <Inbox className="w-12 h-12 text-rose-200 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No tickets found</h3>
            <p className="text-xs text-slate-500">No author queries match your selected filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-rose-100 divide-y divide-rose-50 overflow-hidden shadow-sm">
            {tickets.map((t) => {
              const isUrgent = (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved' && t.status !== 'Closed';

              return (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicketId(t._id)}
                  className={`p-5 hover:bg-rose-50/30 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    isUrgent ? 'border-l-4 border-l-rose-500 bg-rose-50/15' : ''
                  }`}
                >
                  {/* Left Column: Metadata, Subject, Author */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {t.ticket_number}
                      </span>
                      <PriorityBadge priority={t.priority} />
                      <CategoryBadge category={t.category} />
                      <StatusBadge status={t.status} size="sm" />
                      {t.category_overridden && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          Admin Overridden
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-rose-700 transition truncate">
                      {t.subject}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-rose-500" /> {t.author_name}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">
                        Book: <strong className="text-slate-800">{t.book_title}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(t.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: AI Draft status & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-3 text-xs border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700">
                        <Sparkles className="w-3 h-3 text-rose-500" />
                        <span>AI Draft Ready</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t.assigned_to_name ? `Assigned to ${t.assigned_to_name}` : 'Unassigned'}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicketId(t._id);
                      }}
                      className="px-3.5 py-2 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white text-rose-800 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-rose-100"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Detail & Management Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={!!selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={(updated) => {
            setTickets((prev) => prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}
