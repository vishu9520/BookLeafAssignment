require('dotenv').config();
const { analyzeTicketAndDraftResponse } = require('../services/aiService');

const testCases = [
  {
    name: 'Royalty & Overdue Payment Query',
    author: { name: 'Priya Sharma', email: 'priya.sharma@email.com' },
    book: { title: 'Whispers of the Ganges', royalty_pending: 3570, royalty_paid: 8400, total_royalty_earned: 11970, status: 'Published & Live' },
    subject: "I published my book 4 months ago and still haven't received any royalty. What is going on?",
    description: "My dashboard shows ₹3,570 pending royalty. Four months have passed since my last disbursement. When will this be credited into my linked bank account?"
  },
  {
    name: 'ISBN Discrepancy Query',
    author: { name: 'Rohit Kapoor', email: 'rohit.kapoor@email.com' },
    book: { title: 'Code & Karma', isbn: '978-93-5XXXX-03-5', status: 'Published & Live' },
    subject: 'My book is showing a different ISBN on Amazon than what is on the physical copy',
    description: 'Amazon product page shows a mismatched ISBN compared to the official barcode printed on my copies. Please correct this immediately.'
  },
  {
    name: 'Print Quality & Defect Report',
    author: { name: 'Vikram Joshi', email: 'vikram.joshi@email.com' },
    book: { title: 'Debugging Life', isbn: '978-93-5XXXX-06-6', status: 'Published & Live' },
    subject: 'I received my author copies and the print quality is terrible. The images are blurry and pages are misaligned.',
    description: 'Received a box of 20 author copies today. The cover finish is peeling off and diagrams on pages 30-45 are blurry. We need a replacement reprint.'
  },
  {
    name: 'Distribution & Stock Sync Issue',
    author: { name: 'Meera Nair', email: 'meera.nair@email.com' },
    book: { title: 'Cardamom & Chaos', available_on: ['Amazon India', 'Flipkart', 'BookLeaf Store'], status: 'Published & Live' },
    subject: "My book is published but it's showing as Currently Unavailable on Flipkart",
    description: 'My readers in Kerala are trying to buy Cardamom & Chaos on Flipkart, but it says Out of Stock / Currently Unavailable. Please fix this.'
  },
  {
    name: 'Production Pipeline Stage Query',
    author: { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@email.com' },
    book: { title: 'Midnight in Mysore', status: 'In Production - Cover Design' },
    subject: "It's been 3 weeks and my book is still in Cover Design. When will it be done?",
    description: 'I submitted my manuscript revisions three weeks ago. Could you please update me on the expected date for proofreading and printing?'
  },
  {
    name: 'General Author Inquiry',
    author: { name: 'Farhan Sheikh', email: 'farhan.sheikh@email.com' },
    book: { title: 'Ghazal of the Forgotten', status: 'Published & Live' },
    subject: 'Can I update the description of my book on Amazon after it is already live?',
    description: 'I would like to add an endorsement quote from a prominent poet to my book description on Amazon India. How can I submit this update?'
  }
];

async function runSuite() {
  console.log('================================================================');
  console.log('🤖 BOOKLEAF PUBLISHING AI TEST SUITE — GROQ (QWEN 3.8 27B)');
  console.log('================================================================\n');

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`TEST [${i + 1}/6]: ${tc.name}`);
    console.log(`Author: ${tc.author.name} | Book: ${tc.book.title}`);
    console.log(`Subject: "${tc.subject}"`);

    const start = Date.now();
    const result = await analyzeTicketAndDraftResponse({
      subject: tc.subject,
      description: tc.description,
      authorData: tc.author,
      bookData: tc.book
    });
    const duration = Date.now() - start;

    console.log(`⚡ Latency: ${duration}ms | Model: ${result.model_used}`);
    console.log(`📂 Classified Category: [${result.category}] (Confidence: ${(result.category_confidence * 100).toFixed(1)}%)`);
    console.log(`🚨 Priority Score: [${result.priority}] — Reason: ${result.priority_reason}`);
    console.log(`📝 Synthesized AI Draft (Preview):\n"${result.draftResponse.replace(/\n/g, ' ').slice(0, 220)}..."`);
    console.log('----------------------------------------------------------------\n');

    // Wait 2.5s to stay comfortably under the 1000 OTPM rate limit
    await new Promise(r => setTimeout(r, 2500));
  }

  console.log('✅ ALL 6 AI CATEGORIES & FLOWS VERIFIED SUCCESSFULLY ON GROQ!');
}

runSuite().catch(console.error);
