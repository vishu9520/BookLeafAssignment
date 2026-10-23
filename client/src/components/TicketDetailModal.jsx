import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  Lock,
  MessageSquare,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Edit3,
  Check,
  ChevronRight,
  ShieldCheck,
  Paperclip
} from 'lucide-react';

const CATEGORIES = [
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry'
];

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function TicketDetailModal({ ticketId, isOpen, onClose, onTicketUpdated }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin Response & AI Draft state
  const [activeTab, setActiveTab] = useState('conversation'); // 'conversation' | 'internal_notes' | 'ai_studio'
  const [replyMessage, setReplyMessage] = useState('');
  const [draftText, setDraftText] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [regeneratingDraft, setRegeneratingDraft] = useState(false);

  // Internal Notes state
  const [internalNoteText, setInternalNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Overrides
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overridePriority, setOverridePriority] = useState('');

  const isAdmin = user?.role === 'admin';

  // Fetch ticket details
  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tickets/${ticketId}`);
      const t = res.data.data.ticket;
      setTicket(t);
      setDraftText(t.ai_draft?.response || '');
      setOverrideCategory(t.category);
      setOverridePriority(t.priority);
    } catch (err) {
      console.error(err);
      setError('Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket();

      // Join ticket socket room
      if (socket) {
        socket.emit('join:ticket', ticketId);

        const handleTicketUpdated = (updated) => {
          if (updated._id === ticketId) {
            setTicket(prev => ({ ...prev, ...updated }));
            if (onTicketUpdated) onTicketUpdated(updated);
          }
        };

        const handleResponseAdded = ({ ticketId: tId, ticket: updatedTicket, response }) => {
          if (tId === ticketId) {
            setTicket(prev => {
              if (!prev) return updatedTicket;
              const exists = prev.responses?.some(r => r._id === response._id);
              if (exists) return prev;
              return {
                ...prev,
                ...updatedTicket,
                responses: [...(prev.responses || []), response]
              };
            });
            if (onTicketUpdated) onTicketUpdated(updatedTicket);
          }
        };

        const handleNoteAdded = ({ ticketId: tId, ticket: updatedTicket, note }) => {
          if (tId === ticketId && isAdmin) {
            setTicket(prev => {
              if (!prev) return updatedTicket;
              const exists = prev.internal_notes?.some(n => n._id === note._id);
              if (exists) return prev;
              return {
                ...prev,
                ...updatedTicket,
                internal_notes: [...(prev.internal_notes || []), note]
              };
            });
          }
        };

        socket.on('ticket:updated', handleTicketUpdated);
        socket.on('ticket:response_added', handleResponseAdded);
        socket.on('ticket:note_added', handleNoteAdded);

        return () => {
          socket.emit('leave:ticket', ticketId);
          socket.off('ticket:updated', handleTicketUpdated);
          socket.off('ticket:response_added', handleResponseAdded);
          socket.off('ticket:note_added', handleNoteAdded);
        };
      }
    }
  }, [isOpen, ticketId, socket]);

  if (!isOpen) return null;

  // Handle Send Reply (Author or Admin)
  const handleSendReply = async (messageToSend, wasAi = false, statusUpdate = null) => {
    if (!messageToSend || messageToSend.trim() === '') return;

    try {
      setSendingReply(true);
      const res = await api.post(`/tickets/${ticketId}/responses`, {
        message: messageToSend.trim(),
        was_ai_draft: wasAi,
        update_status_to: statusUpdate
      });

      setTicket(res.data.data.ticket);
      setReplyMessage('');
      if (onTicketUpdated) onTicketUpdated(res.data.data.ticket);
    } catch (err) {
      console.error(err);
      alert('Failed to send response: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingReply(false);
    }
  };

  // Handle Send AI Draft as Response (Admin)
  const handleSendAiDraft = async () => {
    await handleSendReply(draftText, true, 'In Progress');
    setActiveTab('conversation');
  };

  // Handle Add Internal Note (Admin)
  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;

    try {
      setSavingNote(true);
      const res = await api.post(`/tickets/${ticketId}/internal-notes`, {
        note: internalNoteText.trim()
      });
      setTicket(res.data.data.ticket);
      setInternalNoteText('');
      if (onTicketUpdated) onTicketUpdated(res.data.data.ticket);
    } catch (err) {
      console.error(err);
      alert('Failed to add internal note.');
    } finally {
      setSavingNote(false);
    }
  };

  // Handle Status Update
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      setTicket(res.data.data.ticket);
      if (onTicketUpdated) onTicketUpdated(res.data.data.ticket);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  // Handle Category / Priority Override
  const handleOverrideSave = async () => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/override`, {
        category: overrideCategory,
        priority: overridePriority
      });
      setTicket(res.data.data.ticket);
      if (onTicketUpdated) onTicketUpdated(res.data.data.ticket);
      alert('Classification updated.');
    } catch (err) {
      console.error(err);
      alert('Failed to override classification.');
    }
  };

  // Handle Assign to Me
  const handleAssignToMe = async () => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/assign`, {
        admin_id: user.id,
        admin_name: user.name
      });
      setTicket(res.data.data.ticket);
      if (onTicketUpdated) onTicketUpdated(res.data.data.ticket);
    } catch (err) {
      console.error(err);
      alert('Failed to assign ticket.');
    }
  };

  // Handle Regenerate AI Draft
  const handleRegenerateDraft = async () => {
    try {
      setRegeneratingDraft(true);
      const res = await api.post(`/tickets/${ticketId}/regenerate-draft`);
      setTicket(res.data.data.ticket);
      setDraftText(res.data.data.ticket.ai_draft?.response || '');
      if (onTicketUpdated) onTicketUpdated(res.data.data.ticket);
    } catch (err) {
      console.error(err);
      alert('Failed to regenerate AI draft.');
    } finally {
      setRegeneratingDraft(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-rose-100 animate-fade-in">
        {/* Header - White Background with BookLeaf Rose Accent */}
        <div className="px-6 py-4 bg-white text-slate-800 flex items-center justify-between border-b border-rose-100">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold bg-rose-50 px-3 py-1 rounded-xl text-rose-800 border border-rose-200">
              {ticket?.ticket_number || 'Loading...'}
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket?.status || 'Open'} />
              <PriorityBadge priority={ticket?.priority || 'Medium'} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-700 p-1.5 rounded-xl hover:bg-rose-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-rose-700">Loading ticket details...</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
            {/* Left Main Content: Query & Conversation Thread */}
            <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 border-r border-rose-100">
              {/* Subject & Author Context */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <CategoryBadge category={ticket.category} />
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    Book: <strong className="text-rose-800">{ticket.book_title}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{ticket.subject}</h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  <span>{ticket.author_name} ({ticket.author_email})</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(ticket.created_at).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Original Author Query Card */}
              <div className="bg-rose-50/20 rounded-2xl p-4 border border-rose-100 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                  Original Query
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </p>

                {/* Attachments if any */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="pt-2 border-t border-rose-100 mt-2">
                    <div className="text-[11px] font-semibold text-rose-700 mb-1 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> Attachments ({ticket.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ticket.attachments.map((att, i) => (
                        <div key={i} className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-xs text-slate-700 flex items-center gap-1.5">
                          <span className="truncate max-w-[150px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs for Admin / Conversation */}
              {isAdmin && (
                <div className="flex border-b border-rose-100 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('conversation')}
                    className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                      activeTab === 'conversation'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Conversation ({ticket.responses?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('ai_studio')}
                    className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                      activeTab === 'ai_studio'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    AI Response Studio
                  </button>
                  <button
                    onClick={() => setActiveTab('internal_notes')}
                    className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                      activeTab === 'internal_notes'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    Internal Notes ({ticket.internal_notes?.length || 0})
                  </button>
                </div>
              )}

              {/* TAB 1: Conversation Thread */}
              {(!isAdmin || activeTab === 'conversation') && (
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-800">
                    Response Thread
                  </div>

                  {ticket.responses?.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-rose-200 text-center text-xs text-rose-700/80 bg-rose-50/10">
                      No responses yet. An ops representative will reply shortly.
                    </div>
                  ) : (
                    ticket.responses.map((resp, i) => {
                      const isSenderAdmin = resp.sender_role === 'admin';
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl border text-sm leading-relaxed space-y-2 ${
                            isSenderAdmin
                              ? 'bg-rose-50/40 border-rose-200 text-slate-800 ml-4'
                              : 'bg-white border-slate-200 text-slate-800 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold flex items-center gap-1.5">
                              {resp.sender_name}
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  isSenderAdmin
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isSenderAdmin ? 'BookLeaf Ops' : 'Author'}
                              </span>
                              {resp.was_ai_draft && (
                                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                                  <Sparkles className="w-2.5 h-2.5 text-rose-600" /> AI Assisted
                                </span>
                              )}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(resp.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{resp.message}</p>
                        </div>
                      );
                    })
                  )}

                  {/* Reply Input Box */}
                  <div className="pt-2 space-y-2">
                    <textarea
                      rows={3}
                      placeholder={
                        isAdmin
                          ? 'Write a reply to the author (or switch to AI Response Studio to use the drafted reply)...'
                          : 'Write a follow-up response...'
                      }
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full p-3 bg-rose-50/15 border border-rose-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800 transition resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSendReply(replyMessage)}
                        disabled={sendingReply || !replyMessage.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingReply ? 'Sending...' : 'Send Message'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Response Studio (Admin Only) */}
              {isAdmin && activeTab === 'ai_studio' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-rose-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        AI Drafted Response (BookLeaf Knowledge Base Powered)
                      </div>
                      <p className="text-rose-700 mt-0.5">
                        Synthesized using publisher policy guidelines, calculated royalty metrics, and empathetic partner tone.
                      </p>
                    </div>
                    <button
                      onClick={handleRegenerateDraft}
                      disabled={regeneratingDraft}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 rounded-xl font-bold shrink-0 transition shadow-sm"
                      title="Re-run AI model with ticket context"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-rose-600 ${regeneratingDraft ? 'animate-spin' : ''}`} />
                      <span>{regeneratingDraft ? 'Regenerating...' : 'Regenerate Draft'}</span>
                    </button>
                  </div>

                  {/* Editable AI Draft Box */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
                      <span className="font-bold text-rose-800">Review & Edit Draft before sending:</span>
                      <span className="text-[11px] text-rose-600 font-medium">
                        Model: {ticket.ai_draft?.model_used || 'Gemini 1.5 Flash'}
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      className="w-full p-3.5 bg-rose-50/15 border border-rose-200 rounded-2xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800 transition leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Sending will automatically update ticket status to "In Progress" and broadcast to author.
                    </span>
                    <button
                      onClick={handleSendAiDraft}
                      disabled={sendingReply || !draftText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingReply ? 'Sending...' : 'Send AI Draft to Author'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Internal Notes (Admin Only) */}
              {isAdmin && activeTab === 'internal_notes' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Internal notes are private to BookLeaf staff and are never visible to authors.</span>
                  </div>

                  {/* Notes Feed */}
                  <div className="space-y-3">
                    {ticket.internal_notes?.length === 0 ? (
                      <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        No internal notes added yet.
                      </div>
                    ) : (
                      ticket.internal_notes.map((note, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-1">
                          <div className="flex justify-between items-center text-amber-900 font-bold">
                            <span>{note.admin_name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(note.created_at).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddInternalNote} className="space-y-2 pt-2">
                    <textarea
                      rows={2}
                      placeholder="Add an internal observation, ticket escalation note, or verification step..."
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                      className="w-full p-3 bg-rose-50/15 border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800 transition resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingNote || !internalNoteText.trim()}
                        className="px-4 py-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
                      >
                        {savingNote ? 'Saving...' : 'Add Internal Note'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Sidebar: Operations Controls */}
            {isAdmin && (
              <div className="w-full md:w-80 bg-rose-50/20 p-5 space-y-5 overflow-y-auto border-t md:border-t-0 border-rose-100">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-800 border-b border-rose-100 pb-2">
                  Ticket Management Desk
                </div>

                {/* Status Switcher */}
                <div>
                  <label className="block text-xs font-bold text-rose-900 mb-1.5">
                    Update Ticket Status
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-rose-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignment */}
                <div>
                  <label className="block text-xs font-bold text-rose-900 mb-1.5">
                    Assignee
                  </label>
                  <div className="flex items-center justify-between p-2.5 bg-white border border-rose-200 rounded-xl text-xs">
                    <span className="font-semibold text-slate-800">
                      {ticket.assigned_to_name || 'Unassigned'}
                    </span>
                    <button
                      onClick={handleAssignToMe}
                      className="text-rose-700 hover:text-rose-800 font-extrabold text-[11px] underline"
                    >
                      Assign to Me
                    </button>
                  </div>
                </div>

                {/* AI Classification & Override */}
                <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" /> AI Classification
                    </span>
                    {ticket.category_overridden && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                        Overridden
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                    <select
                      value={overrideCategory}
                      onChange={(e) => setOverrideCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-rose-50/30 border border-rose-200 rounded-lg text-xs font-medium text-slate-800"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Priority Score (AI Assessed)
                    </label>
                    <select
                      value={overridePriority}
                      onChange={(e) => setOverridePriority(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-rose-50/30 border border-rose-200 rounded-lg text-xs font-medium text-slate-800"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {ticket.priority_reason && (
                      <p className="text-[10px] text-rose-600 mt-1 italic font-medium">
                        Reason: {ticket.priority_reason}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleOverrideSave}
                    className="w-full py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Save Override
                  </button>
                </div>

                {/* Author Info Snapshot */}
                <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm space-y-1.5 text-xs">
                  <div className="font-bold text-rose-900">Author Snapshot</div>
                  <div className="text-slate-600">ID: {ticket.author_id}</div>
                  <div className="text-slate-600">Email: {ticket.author_email}</div>
                  <div className="text-slate-600 truncate">Book: {ticket.book_title}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
