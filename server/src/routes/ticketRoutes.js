const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ticketController');
const { authenticate, requireRole } = require('../middleware/auth');

// Author: Create ticket & view own tickets
router.post('/', authenticate, requireRole('author'), createTicket);
router.get('/my-tickets', authenticate, requireRole('author'), getAuthorTickets);

// Admin: View all tickets with filtering/sorting
router.get('/', authenticate, requireRole('admin'), getAllTickets);

// Both: View single ticket (Author restricted to own ticket)
router.get('/:id', authenticate, getTicketById);

// Both: Add response/reply
router.post('/:id/responses', authenticate, addResponse);

// Admin operations
router.patch('/:id/status', authenticate, requireRole('admin'), updateTicketStatus);
router.patch('/:id/override', authenticate, requireRole('admin'), overrideClassification);
router.post('/:id/internal-notes', authenticate, requireRole('admin'), addInternalNote);
router.patch('/:id/assign', authenticate, requireRole('admin'), assignTicket);
router.post('/:id/regenerate-draft', authenticate, requireRole('admin'), regenerateAiDraft);

module.exports = router;
