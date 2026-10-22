/**
 * BookLeaf Publishing - Support Knowledge Base & AI Context
 * Provided directly by BookLeaf Publishing Guidelines
 */

const BOOKLEAF_KB = {
  company: {
    name: "BookLeaf Publishing",
    description: "Self-publishing company operating in India and the US, processing 1,200+ books monthly across a catalog of 22,000+ titles.",
    packages: [
      { name: "Standard Free", details: "No upfront cost" },
      { name: "Bestseller Breakthrough", details: "Premium paid package with marketing and distribution add-ons" }
    ],
    facilities: "In-house printing facility and warehouse located in Delhi. Print partners include Repro India and Epitome Books.",
    services: ["Cover design", "Typesetting", "ISBN assignment", "Printing", "Distribution", "Royalty management"]
  },
  royalty_policy: {
    split: "80/20 royalty split (80% of net profit goes to author, 20% to BookLeaf).",
    net_profit_formula: "Net profit = MRP - Printing Cost - Platform Commission (Amazon/Flipkart) - Shipping Charges.",
    calculation_cycle: "Calculated quarterly and paid within 45 days of the quarter ending.",
    minimum_payout: "₹1,000 threshold. If accumulated royalties are below ₹1,000, they roll over to the next quarter.",
    payout_method: "Direct bank transfer to the account linked in author dashboard.",
    transparency: "Authors can view detailed royalty breakdown and sales figures per platform in their dashboard."
  },
  isbn_policy: {
    assignment: "Every book published through BookLeaf receives a unique ISBN assigned by BookLeaf under BookLeaf's publisher imprint.",
    author_imprint: "If an author wants an ISBN under their own imprint, they must obtain it independently.",
    error_handling: "If an author reports an ISBN error (duplicate or wrong book linked), it is treated as High Priority and escalated to production immediately with a 48-hour resolution timeline."
  },
  printing_and_quality: {
    facilities: "In-house printing handles most orders; overflow or format specifications go to Repro India or Epitome Books.",
    turnaround: "5 to 7 business days from order confirmation.",
    defects_policy: "For misprints, binding defects, or color inconsistency, BookLeaf arranges a 100% free reprint after verification. The author needs to share photos of the defective copy. Reprint turnaround is 5-7 business days."
  },
  distribution_and_availability: {
    channels: ["Amazon India", "Flipkart", "Amazon US", "Amazon UK", "BookLeaf Store"],
    live_timeline: "New listings typically go live within 7-10 business days after publication is complete.",
    out_of_stock_sync: "If a book shows 'Currently Unavailable' on a platform, it is usually a stock sync issue. BookLeaf ops can trigger a re-sync within 24-48 hours to restore availability."
  },
  production_stages: [
    "Manuscript Received",
    "Editing (if opted)",
    "Cover Design",
    "Typesetting",
    "Proofreading",
    "ISBN Assignment",
    "Printing",
    "Distribution Setup",
    "Published & Live"
  ],
  production_notes: "Delays typically happen at Cover Design (waiting for author approval) and Proofreading (revision rounds). Authors are updated via email at each stage.",
  communication_tone: {
    principles: [
      "Empathetic and professional. Authors are partners, not customers to be managed.",
      "Acknowledge the author's concern genuinely before jumping to solutions.",
      "Be specific: cite actual numbers, dates, book titles, and statuses rather than vague reassurances.",
      "If something is BookLeaf's fault (delayed royalties, ISBN mismatch), own it directly without corporate deflection.",
      "If investigation is needed, provide a concrete timeline ('Our team will look into this and get back to you within 48 hours').",
      "Always end with a clear, actionable next step for the author and/or the BookLeaf team."
    ]
  },
  categories: [
    "Royalty & Payments",
    "ISBN & Metadata Issues",
    "Printing & Quality",
    "Distribution & Availability",
    "Book Status & Production Updates",
    "General Inquiry"
  ]
};

module.exports = BOOKLEAF_KB;
