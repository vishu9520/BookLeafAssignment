const express = require('express');
const router = express.Router();
const { getMyBooks, getBookById, getAllBooks } = require('../controllers/bookController');
const { authenticate, requireRole } = require('../middleware/auth');

// Author: Get own books
router.get('/my-books', authenticate, requireRole('author'), getMyBooks);

// Admin: Get all books
router.get('/', authenticate, requireRole('admin'), getAllBooks);

// Get single book (Role checked inside controller)
router.get('/:id', authenticate, getBookById);

module.exports = router;
