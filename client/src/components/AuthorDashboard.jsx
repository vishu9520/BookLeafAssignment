import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import CreateTicketModal from './CreateTicketModal';
import TicketDetailModal from './TicketDetailModal';
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export default function AuthorDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'tickets'
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Fetch author books and stats
  const fetchBooks = async () => {
    try {
      const res = await api.get('/books/my-books');
      setBooks(res.data.data.books);
      setStats(res.data.data.stats);
    } catch (err) {
      console.error('Failed to load books:', err);
    }
  };

  // Fetch author tickets
  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      setTickets(res.data.data.tickets);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBooks(), fetchTickets()]).finally(() => setLoading(false));
  }, []);

  // Listen for real-time ticket updates for this author
  useEffect(() => {
    if (!socket || !user?.author_id) return;

    const handleTicketCreated = (newTicket) => {
      setTickets((prev) => [newTicket, ...prev.filter(t => t._id !== newTicket._id)]);
    };

    const handleTicketUpdated = (updated) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
      );
    };

    const handleResponseAdded = ({ ticketId, ticket: updatedTicket }) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...updatedTicket } : t))
      );
    };

    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:updated', handleTicketUpdated);
    socket.on('ticket:response_added', handleResponseAdded);

    return () => {
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:updated', handleTicketUpdated);
      socket.off('ticket:response_added', handleResponseAdded);
    };
  }, [socket, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-brand-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BookLeaf Author Community</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track your book distribution across global channels, review your quarterly royalty statements, and receive fast support from our publishing desk.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-brand-500/25 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise Support Ticket</span>
            </button>
          </div>
        </div>

        {/* Quick Author Financial KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Copies Sold</span>
                <TrendingUp className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats.totalCopiesSold.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across all storefronts</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Royalty Earned</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                ₹{stats.totalRoyaltyEarned.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">80% net author profit</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Disbursed Royalty</span>
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                ₹{stats.totalRoyaltyPaid.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Paid via direct bank transfer</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Pending Payout</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                ₹{stats.totalRoyaltyPending.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.totalRoyaltyPending >= 1000
                  ? 'Eligible for next quarterly cycle'
                  : 'Threshold ₹1,000 (rolls over)'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-3.5 px-3 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === 'books'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Published Books ({books.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3.5 px-3 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === 'tickets'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Support Tickets ({tickets.length})</span>
            {tickets.some((t) => t.status === 'Open' || t.status === 'In Progress') && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        <button
          onClick={() => {
            fetchBooks();
            fetchTickets();
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 pb-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* TAB 1: MY BOOKS */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-16 text-center text-slate-400">Loading catalog...</div>
          ) : books.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No books found</h3>
              <p className="text-xs text-slate-500 mt-1">You do not have any titles associated with this profile yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.map((book) => {
                const isLive = book.status === 'Published & Live';
                return (
                  <div
                    key={book.book_id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {book.book_id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                            }`}
                          />
                          {book.status}
                        </span>
                      </div>

                      {/* Title & Genre */}
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">{book.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Genre: <span className="font-medium text-slate-700">{book.genre}</span>
                        {book.publication_date && (
                          <span>
                            {' '}• Published:{' '}
                            {new Date(book.publication_date).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </p>

                      {/* ISBN & Print Partner */}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          ISBN: <strong className="font-mono text-slate-800">{book.isbn || 'Pending Assignment'}</strong>
                        </div>
                        {book.print_partner && (
                          <div>
                            • Print Partner: <strong className="text-slate-800">{book.print_partner}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial Metrics Grid */}
                    {isLive ? (
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-center">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">MRP / Royalty</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            ₹{book.mrp} / <span className="text-brand-600">₹{book.author_royalty_per_copy}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Copies Sold</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {book.total_copies_sold.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Pending Payout</div>
                          <div className="text-sm font-bold text-amber-600 mt-0.5">
                            ₹{book.royalty_pending.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">In Production Pipeline</span>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Editorial and design teams are working on this manuscript. Royalty figures and retail listings will activate upon publication.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Distribution Channels & Query Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {book.available_on && book.available_on.length > 0 ? (
                          book.available_on.map((store, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200"
                            >
                              {store}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not yet distributed</span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setIsCreateModalOpen(true);
                        }}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
                      >
                        <span>Query about this book</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Your Communication & Ticket History</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              + New Query
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No support tickets</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Have a question about your royalties, ISBN catalog, or print quality? Submit a query and our team will assist you.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
              {tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicketId(t._id)}
                  className="p-5 hover:bg-slate-50/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-600">{t.ticket_number}</span>
                      <CategoryBadge category={t.category} />
                      <StatusBadge status={t.status} size="sm" />
                      <span className="text-xs text-slate-400 font-normal">
                        Book: <strong>{t.book_title}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition truncate">
                      {t.subject}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end text-xs text-slate-400">
                    <span>
                      {new Date(t.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                      {t.responses?.length || 0} response{t.responses?.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Create Modal */}
      <CreateTicketModal
        books={books}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={(newTicket) => {
          setTickets((prev) => [newTicket, ...prev]);
          setActiveTab('tickets');
        }}
      />

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={!!selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={(updated) => {
            setTickets((prev) => prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
          }}
        />
      )}
    </div>
  );
}
