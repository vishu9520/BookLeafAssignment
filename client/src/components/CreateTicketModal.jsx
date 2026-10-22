import React, { useState } from 'react';
import api from '../services/api';
import { X, UploadCloud, FileText, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export default function CreateTicketModal({ books = [], isOpen, onClose, onTicketCreated }) {
  const [selectedBook, setSelectedBook] = useState('GENERAL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer ? e.dataTransfer.files : e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: URL.createObjectURL(file) // preview URL
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both a subject line and a detailed description.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        book_id: selectedBook,
        subject: subject.trim(),
        description: description.trim(),
        attachments: attachments.map(a => ({ name: a.name, size: a.size, mimeType: a.mimeType }))
      };

      const res = await api.post('/tickets', payload);
      setSuccessTicket(res.data.data.ticket);
      if (onTicketCreated) {
        onTicketCreated(res.data.data.ticket);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubject('');
    setDescription('');
    setSelectedBook('GENERAL');
    setAttachments([]);
    setError('');
    setSuccessTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Submit a Support Query</h3>
            <p className="text-xs text-slate-300">BookLeaf Author Support Team typically responds within 24–48 hours</p>
          </div>
          <button
            onClick={resetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {successTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Ticket #{successTicket.ticket_number} Submitted!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Our AI support coordinator has processed your query and dispatched it to the BookLeaf operations desk.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Auto-Classified Category:</span>
                <span className="font-semibold text-slate-900">{successTicket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Priority:</span>
                <span className="font-semibold text-slate-900">{successTicket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Related Book:</span>
                <span className="font-semibold text-slate-900">{successTicket.book_title}</span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="mt-4 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-brand-500/20"
            >
              View in My Tickets
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {/* Select Book */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Which book is this query about?
              </label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              >
                <option value="GENERAL">General / Account Level Query</option>
                {books.map((b) => (
                  <option key={b.book_id} value={b.book_id}>
                    {b.title} ({b.book_id} — {b.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                placeholder="e.g., Question regarding Q3 royalty disbursement calculation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Detailed Description
              </label>
              <textarea
                rows={4}
                placeholder="Please describe your query in detail. Include relevant numbers, marketplace links, or dates if applicable..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition resize-none"
              />
            </div>

            {/* File Attachment Support (UI Drag & Drop) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Attach Supporting Documents or Defect Photos (Optional)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 text-center cursor-pointer transition group"
              >
                <input
                  type="file"
                  multiple
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileDrop}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-500 mx-auto mb-1.5 transition" />
                  <p className="text-xs text-slate-600 font-medium">
                    <span className="text-brand-600 font-semibold">Click to upload</span> or drag and drop files here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 10MB</p>
                </label>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{file.name}</span>
                        <span className="text-slate-400 text-[10px]">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Assistant Banner */}
            <div className="p-3 bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 rounded-xl flex items-center gap-2 text-xs text-brand-900">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                BookLeaf AI will automatically prioritize and classify your ticket according to publisher policy.
              </span>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-brand-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Submitting...</span>
                  </>
                ) : (
                  <span>Submit Ticket</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
