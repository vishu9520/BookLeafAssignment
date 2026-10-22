const Ticket = require('../models/Ticket');
const Book = require('../models/Book');
const { analyzeTicketAndDraftResponse } = require('../services/aiService');
const {
  emitTicketCreated,
  emitTicketUpdated,
  emitResponseAdded,
  emitInternalNoteAdded
} = require('../services/socketService');

// @desc    Submit a new support ticket (Author)
// @route   POST /api/tickets
// @access  Private (Author)
const createTicket = async (req, res) => {
  try {
    const { subject, description, book_id, attachments } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and detailed description are required.'
      });
    }

    // Resolve book details if attached
    let selectedBook = null;
    let bookTitle = 'General / Account Level';
    let resolvedBookId = 'GENERAL';

    if (book_id && book_id !== 'GENERAL') {
      selectedBook = await Book.findOne({
        book_id: book_id,
        $or: [{ author_id: req.user.author_id }, { author: req.user._id }]
      });
      if (selectedBook) {
        bookTitle = selectedBook.title;
        resolvedBookId = selectedBook.book_id;
      }
    }

    // Run AI Auto-Classification, Priority Scoring, and Draft Generation
    const aiResult = await analyzeTicketAndDraftResponse({
      subject,
      description,
      authorData: req.user,
      bookData: selectedBook
    });

    const ticket = new Ticket({
      author: req.user._id,
      author_id: req.user.author_id || 'AUTH000',
      author_name: req.user.name,
      author_email: req.user.email,
      book: selectedBook ? selectedBook._id : null,
      book_id: resolvedBookId,
      book_title: bookTitle,
      subject: subject.trim(),
      description: description.trim(),
      attachments: attachments || [],
      category: aiResult.category,
      category_confidence: aiResult.category_confidence,
      priority: aiResult.priority,
      priority_reason: aiResult.priority_reason,
      ai_draft: {
        response: aiResult.draftResponse,
        generated_at: new Date(),
        model_used: aiResult.model_used,
        confidence: aiResult.confidence,
        is_edited: false
      },
      status: 'Open'
    });

    await ticket.save();

    // Broadcast real-time socket events
    emitTicketCreated(ticket);

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      data: { ticket }
    });
  } catch (error) {
    console.error('[Create Ticket Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket: ' + error.message
    });
  }
};

// @desc    Get tickets for logged-in author
// @route   GET /api/tickets/my-tickets
// @access  Private (Author)
const getAuthorTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ author: req.user._id })
      .select('-internal_notes') // Never expose internal notes to authors
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: { tickets }
    });
  } catch (error) {
    console.error('[Get Author Tickets Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tickets.'
    });
  }
};

// @desc    Get all tickets with filtering, sorting and stats (Admin)
// @route   GET /api/tickets
// @access  Private (Admin)
const getAllTickets = async (req, res) => {
  try {
    const { status, category, priority, search, sortBy } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { ticket_number: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { author_name: { $regex: search, $options: 'i' } },
        { author_email: { $regex: search, $options: 'i' } },
        { book_title: { $regex: search, $options: 'i' } }
      ];
    }

    // Priority sorting weights
    // Critical (4), High (3), Medium (2), Low (1)
    let sortOptions = { created_at: -1 };

    if (sortBy === 'urgent') {
      // Custom aggregation or multi-field sort
      sortOptions = {
        // Will handle via mongoose aggregation below or in-memory
      };
    } else if (sortBy === 'oldest_unresolved') {
      sortOptions = { status: 1, created_at: 1 };
    } else if (sortBy === 'newest') {
      sortOptions = { created_at: -1 };
    }

    let tickets;
    if (sortBy === 'urgent') {
      tickets = await Ticket.aggregate([
        { $match: query },
        {
          $addFields: {
            priorityScore: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'Critical'] }, then: 4 },
                  { case: { $eq: ['$priority', 'High'] }, then: 3 },
                  { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'Low'] }, then: 1 }
                ],
                default: 0
              }
            },
            statusWeight: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'Open'] }, then: 1 },
                  { case: { $eq: ['$status', 'In Progress'] }, then: 2 },
                  { case: { $eq: ['$status', 'Resolved'] }, then: 3 },
                  { case: { $eq: ['$status', 'Closed'] }, then: 4 }
                ],
                default: 5
              }
            }
          }
        },
        { $sort: { statusWeight: 1, priorityScore: -1, created_at: 1 } }
      ]);
    } else {
      tickets = await Ticket.find(query).sort(sortOptions);
    }

    // High level queue metrics
    const allCounts = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $and: [{ $eq: ['$priority', 'Critical'] }, { $ne: ['$status', 'Resolved'] }, { $ne: ['$status', 'Closed'] }] }, 1, 0] } },
          high: { $sum: { $cond: [{ $and: [{ $eq: ['$priority', 'High'] }, { $ne: ['$status', 'Resolved'] }, { $ne: ['$status', 'Closed'] }] }, 1, 0] } }
        }
      }
    ]);

    const metrics = allCounts[0] || {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
      high: 0
    };

    res.json({
      success: true,
      data: {
        tickets,
        metrics
      }
    });
  } catch (error) {
    console.error('[Get All Tickets Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket queue.'
    });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private (Author or Admin)
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    // RBAC: Author can only access their own ticket
    if (req.user.role === 'author' && ticket.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view other authors\' tickets.'
      });
    }

    // Strip internal notes if requester is author
    const ticketData = ticket.toObject();
    if (req.user.role === 'author') {
      delete ticketData.internal_notes;
    }

    res.json({
      success: true,
      data: { ticket: ticketData }
    });
  } catch (error) {
    console.error('[Get Ticket By ID Error]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket.'
    });
  }
};

// @desc    Update ticket status (Admin)
// @route   PATCH /api/tickets/:id/status
// @access  Private (Admin)
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    ticket.status = status;
    await ticket.save();

    emitTicketUpdated(ticket);

    res.json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      data: { ticket }
    });
  } catch (error) {
    console.error('[Update Ticket Status Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status.'
    });
  }
};

// @desc    Override AI classification or priority (Admin)
// @route   PATCH /api/tickets/:id/override
// @access  Private (Admin)
const overrideClassification = async (req, res) => {
  try {
    const { category, priority } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    if (category) {
      ticket.category = category;
      ticket.category_overridden = true;
    }

    if (priority) {
      ticket.priority = priority;
      ticket.priority_overridden = true;
    }

    await ticket.save();
    emitTicketUpdated(ticket);

    res.json({
      success: true,
      message: 'Ticket classification overridden successfully.',
      data: { ticket }
    });
  } catch (error) {
    console.error('[Override Classification Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to override classification.'
    });
  }
};

// @desc    Add a response / reply to ticket (Author or Admin)
// @route   POST /api/tickets/:id/responses
// @access  Private (Author or Admin)
const addResponse = async (req, res) => {
  try {
    const { message, was_ai_draft, update_status_to } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Response message cannot be empty.'
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    // Role check
    if (req.user.role === 'author' && ticket.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot respond to this ticket.'
      });
    }

    const newResponse = {
      sender_role: req.user.role,
      sender: req.user._id,
      sender_name: req.user.name,
      message: message.trim(),
      was_ai_draft: !!was_ai_draft,
      created_at: new Date()
    };

    ticket.responses.push(newResponse);

    // If admin replies and author had an open ticket, transition to In Progress or specified status
    if (req.user.role === 'admin') {
      if (update_status_to) {
        ticket.status = update_status_to;
      } else if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }
    } else if (req.user.role === 'author' && ticket.status === 'Resolved') {
      // Re-open if author replies to resolved ticket
      ticket.status = 'In Progress';
    }

    await ticket.save();

    emitResponseAdded(ticket, newResponse);

    res.status(201).json({
      success: true,
      message: 'Response posted successfully.',
      data: {
        response: newResponse,
        ticket
      }
    });
  } catch (error) {
    console.error('[Add Response Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post response.'
    });
  }
};

// @desc    Add internal note to ticket (Admin only, hidden from Author)
// @route   POST /api/tickets/:id/internal-notes
// @access  Private (Admin)
const addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Internal note text cannot be empty.'
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    const internalNote = {
      admin: req.user._id,
      admin_name: req.user.name,
      note: note.trim(),
      created_at: new Date()
    };

    ticket.internal_notes.push(internalNote);
    await ticket.save();

    emitInternalNoteAdded(ticket, internalNote);

    res.status(201).json({
      success: true,
      message: 'Internal note saved.',
      data: {
        internal_note: internalNote,
        ticket
      }
    });
  } catch (error) {
    console.error('[Add Internal Note Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add internal note.'
    });
  }
};

// @desc    Assign ticket to admin (Admin only)
// @route   PATCH /api/tickets/:id/assign
// @access  Private (Admin)
const assignTicket = async (req, res) => {
  try {
    const { admin_id, admin_name } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    ticket.assigned_to = admin_id || req.user._id;
    ticket.assigned_to_name = admin_name || req.user.name;

    await ticket.save();
    emitTicketUpdated(ticket);

    res.json({
      success: true,
      message: `Ticket assigned to ${ticket.assigned_to_name}.`,
      data: { ticket }
    });
  } catch (error) {
    console.error('[Assign Ticket Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket.'
    });
  }
};

// @desc    Regenerate AI Draft Response on demand (Admin)
// @route   POST /api/tickets/:id/regenerate-draft
// @access  Private (Admin)
const regenerateAiDraft = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('book author');
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    const aiResult = await analyzeTicketAndDraftResponse({
      subject: ticket.subject,
      description: ticket.description,
      authorData: ticket.author,
      bookData: ticket.book
    });

    ticket.ai_draft = {
      response: aiResult.draftResponse,
      generated_at: new Date(),
      model_used: aiResult.model_used,
      confidence: aiResult.confidence,
      is_edited: false
    };

    await ticket.save();
    emitTicketUpdated(ticket);

    res.json({
      success: true,
      message: 'AI draft response regenerated.',
      data: {
        ai_draft: ticket.ai_draft,
        ticket
      }
    });
  } catch (error) {
    console.error('[Regenerate AI Draft Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate AI draft.'
    });
  }
};

module.exports = {
  createTicket,
  getAuthorTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  overrideClassification,
  addResponse,
  addInternalNote,
  assignTicket,
  regenerateAiDraft
};
