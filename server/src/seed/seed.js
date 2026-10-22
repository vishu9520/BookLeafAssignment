require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Ticket = require('../models/Ticket');
const seedData = require('./seedData.json');
const { heuristicAnalysis } = require('../services/aiService');

const DEFAULT_AUTHOR_PASSWORD = 'author123';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Book.deleteMany({});
    await Ticket.deleteMany({});

    // 1. Create Admin Account
    console.log('[Seed] Creating Admin account...');
    const adminUser = new User({
      name: 'BookLeaf Ops Admin',
      email: 'admin@bookleaf.com',
      password: DEFAULT_ADMIN_PASSWORD,
      role: 'admin',
      city: 'Delhi',
      phone: '+91-11-4000-5000',
      joined_date: new Date('2022-01-01')
    });
    await adminUser.save();
    console.log(`[Seed] Admin created: ${adminUser.email} (Password: ${DEFAULT_ADMIN_PASSWORD})`);

    // 2. Create 10 Authors and their 18 Books
    const createdAuthors = [];
    const createdBooks = [];

    for (const authorData of seedData.authors) {
      const author = new User({
        author_id: authorData.author_id,
        name: authorData.name,
        email: authorData.email,
        password: DEFAULT_AUTHOR_PASSWORD,
        role: 'author',
        phone: authorData.phone,
        city: authorData.city,
        joined_date: new Date(authorData.joined_date)
      });
      await author.save();
      createdAuthors.push(author);

      for (const bookData of authorData.books) {
        const book = new Book({
          book_id: bookData.book_id,
          author: author._id,
          author_id: author.author_id,
          title: bookData.title,
          isbn: bookData.isbn,
          genre: bookData.genre,
          publication_date: bookData.publication_date ? new Date(bookData.publication_date) : null,
          status: bookData.status,
          mrp: bookData.mrp,
          author_royalty_per_copy: bookData.author_royalty_per_copy,
          total_copies_sold: bookData.total_copies_sold,
          total_royalty_earned: bookData.total_royalty_earned,
          royalty_paid: bookData.royalty_paid,
          royalty_pending: bookData.royalty_pending,
          last_royalty_payout_date: bookData.last_royalty_payout_date ? new Date(bookData.last_royalty_payout_date) : null,
          print_partner: bookData.print_partner,
          available_on: bookData.available_on
        });
        await book.save();
        createdBooks.push(book);
      }
    }

    console.log(`[Seed] Seeded ${createdAuthors.length} authors and ${createdBooks.length} books.`);

    // 3. Pre-seed a few realistic sample tickets to showcase the admin queue and author view immediately
    console.log('[Seed] Seeding realistic sample tickets...');

    const sampleQueries = [
      {
        authorEmail: 'priya.sharma@email.com',
        bookId: 'BK001',
        subject: 'Discrepancy in my Q3 royalty payout',
        description: 'I published Whispers of the Ganges last year. My dashboard indicates I sold 342 copies with ₹11,970 total royalty earned, but my bank account only shows ₹8,400 received with ₹3,570 still pending. Can you verify when the remaining balance will be disbursed?',
        status: 'Open'
      },
      {
        authorEmail: 'rohit.kapoor@email.com',
        bookId: 'BK003',
        subject: 'Different ISBN showing on Amazon India listing',
        description: 'My book "Code & Karma" is displaying ISBN 978-93-59999-99-9 on the Amazon India product details page instead of my official imprint ISBN 978-93-5XXXX-03-5 printed on the back cover. Readers are confused!',
        status: 'In Progress'
      },
      {
        authorEmail: 'ananya.reddy@email.com',
        bookId: 'BK005',
        subject: 'First book royalties not yet received',
        description: 'Between Two Temples went live in July 2024. I have earned ₹2,546 in royalties but have not seen any payout yet. Are my bank details connected properly?',
        status: 'Open'
      },
      {
        authorEmail: 'vikram.joshi@email.com',
        bookId: 'BK006',
        subject: 'Author copies have misaligned pages and blurry diagrams',
        description: 'I just received my author box of 20 copies for "Debugging Life". Pages 45-60 are visibly crooked and the technical diagrams in chapter 4 appear blurry and low resolution. We need a replacement reprint.',
        status: 'Resolved'
      }
    ];

    for (const q of sampleQueries) {
      const author = createdAuthors.find(a => a.email === q.authorEmail);
      const book = createdBooks.find(b => b.book_id === q.bookId);

      const ai = heuristicAnalysis(q.subject, q.description, book, author);

      const ticket = new Ticket({
        author: author._id,
        author_id: author.author_id,
        author_name: author.name,
        author_email: author.email,
        book: book ? book._id : null,
        book_id: book ? book.book_id : 'GENERAL',
        book_title: book ? book.title : 'General / Account Level',
        subject: q.subject,
        description: q.description,
        category: ai.category,
        category_confidence: ai.category_confidence,
        priority: ai.priority,
        priority_reason: ai.priority_reason,
        status: q.status,
        ai_draft: {
          response: ai.draftResponse,
          generated_at: new Date(),
          model_used: ai.model_used,
          confidence: ai.confidence,
          is_edited: false
        }
      });

      if (q.status === 'In Progress' || q.status === 'Resolved') {
        ticket.assigned_to = adminUser._id;
        ticket.assigned_to_name = adminUser.name;
        ticket.internal_notes.push({
          admin: adminUser._id,
          admin_name: adminUser.name,
          note: 'Metadata lead alerted. Escalated to production desk with 48h resolution SLA.',
          created_at: new Date()
        });
      }

      if (q.status === 'Resolved') {
        ticket.responses.push({
          sender_role: 'admin',
          sender: adminUser._id,
          sender_name: adminUser.name,
          message: ai.draftResponse,
          was_ai_draft: true,
          created_at: new Date()
        });
      }

      await ticket.save();
    }

    console.log('[Seed] Sample tickets created.');
    console.log('\n================ SEED COMPLETE ================');
    console.log('Admin Credentials:');
    console.log('  Email:    admin@bookleaf.com');
    console.log('  Password: ' + DEFAULT_ADMIN_PASSWORD);
    console.log('\nSample Author Credentials:');
    console.log('  1. Priya Sharma:    priya.sharma@email.com   / ' + DEFAULT_AUTHOR_PASSWORD);
    console.log('  2. Rohit Kapoor:    rohit.kapoor@email.com   / ' + DEFAULT_AUTHOR_PASSWORD);
    console.log('  3. Ananya Reddy:    ananya.reddy@email.com   / ' + DEFAULT_AUTHOR_PASSWORD);
    console.log('  4. Vikram Joshi:    vikram.joshi@email.com   / ' + DEFAULT_AUTHOR_PASSWORD);
    console.log('  (All 10 authors have password: ' + DEFAULT_AUTHOR_PASSWORD + ')');
    console.log('================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
}

seedDatabase();
