const Book = require('../models/Book');

// @desc    Get published books for logged in author
// @route   GET /api/books/my-books
// @access  Private (Author)
const getMyBooks = async (req, res) => {
  try {
    const authorId = req.user.author_id;
    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: 'No author profile linked to this account.'
      });
    }

    const books = await Book.find({
      $or: [
        { author_id: authorId },
        { author: req.user._id }
      ]
    }).sort({ publication_date: -1, createdAt: -1 });

    // Calculate aggregated author statistics
    const stats = books.reduce((acc, book) => {
      acc.totalCopiesSold += book.total_copies_sold || 0;
      acc.totalRoyaltyEarned += book.total_royalty_earned || 0;
      acc.totalRoyaltyPaid += book.royalty_paid || 0;
      acc.totalRoyaltyPending += book.royalty_pending || 0;
      if (book.status === 'Published & Live') {
        acc.publishedCount += 1;
      } else {
        acc.inProductionCount += 1;
      }
      return acc;
    }, {
      totalCopiesSold: 0,
      totalRoyaltyEarned: 0,
      totalRoyaltyPaid: 0,
      totalRoyaltyPending: 0,
      publishedCount: 0,
      inProductionCount: 0
    });

    res.json({
      success: true,
      data: {
        books,
        stats
      }
    });
  } catch (error) {
    console.error('[Get My Books Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve author books: ' + error.message
    });
  }
};

// @desc    Get single book details
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    // Role-based access verification
    if (req.user.role === 'author' && book.author_id !== req.user.author_id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this book record.'
      });
    }

    res.json({
      success: true,
      data: { book }
    });
  } catch (error) {
    console.error('[Get Book By Id Error]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book.'
    });
  }
};

// @desc    Get all books in catalog (Admin view)
// @route   GET /api/books
// @access  Private (Admin)
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('author', 'name email author_id city');
    res.json({
      success: true,
      data: { books }
    });
  } catch (error) {
    console.error('[Get All Books Error]', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving catalog.'
    });
  }
};

module.exports = {
  getMyBooks,
  getBookById,
  getAllBooks
};
