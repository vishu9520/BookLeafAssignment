const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  book_id: {
    type: String,
    required: true,
    unique: true,
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    default: null
  },
  genre: {
    type: String,
    default: 'General'
  },
  publication_date: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    required: true,
    default: 'Published & Live'
  },
  mrp: {
    type: Number,
    default: null
  },
  author_royalty_per_copy: {
    type: Number,
    default: null
  },
  total_copies_sold: {
    type: Number,
    default: 0
  },
  total_royalty_earned: {
    type: Number,
    default: 0
  },
  royalty_paid: {
    type: Number,
    default: 0
  },
  royalty_pending: {
    type: Number,
    default: 0
  },
  last_royalty_payout_date: {
    type: Date,
    default: null
  },
  print_partner: {
    type: String,
    default: null
  },
  available_on: [
    {
      type: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
