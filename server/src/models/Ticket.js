const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  sender_role: {
    type: String,
    enum: ['author', 'admin', 'system'],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sender_name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  was_ai_draft: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const internalNoteSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admin_name: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  ticket_number: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  author_id: {
    type: String,
    required: true,
    index: true
  },
  author_name: {
    type: String,
    required: true
  },
  author_email: {
    type: String,
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  book_id: {
    type: String,
    default: 'GENERAL'
  },
  book_title: {
    type: String,
    default: 'General / Account Level'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  attachments: [
    {
      name: String,
      size: Number,
      url: String,
      mimeType: String
    }
  ],
  category: {
    type: String,
    enum: [
      'Royalty & Payments',
      'ISBN & Metadata Issues',
      'Printing & Quality',
      'Distribution & Availability',
      'Book Status & Production Updates',
      'General Inquiry'
    ],
    default: 'General Inquiry',
    index: true
  },
  category_confidence: {
    type: Number,
    default: 0.85
  },
  category_overridden: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
    index: true
  },
  priority_reason: {
    type: String,
    default: ''
  },
  priority_overridden: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
    index: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assigned_to_name: {
    type: String,
    default: 'Unassigned'
  },
  ai_draft: {
    response: { type: String, default: '' },
    generated_at: { type: Date, default: null },
    model_used: { type: String, default: 'heuristic-engine' },
    confidence: { type: Number, default: 0.9 },
    is_edited: { type: Boolean, default: false }
  },
  responses: [responseSchema],
  internal_notes: [internalNoteSchema]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Pre-validate hook to generate ticket_number if missing
ticketSchema.pre('validate', async function (next) {
  if (!this.ticket_number) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    this.ticket_number = `BL-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
