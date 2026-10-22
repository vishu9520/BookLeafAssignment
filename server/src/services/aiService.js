const BOOKLEAF_KB = require('../constants/knowledgeBase');

/**
 * Intelligent Keyword & Intent Matcher for Token-Efficient Knowledge Base Retrieval
 * (RAG / Context Minimization for Cost Awareness)
 */
function getTargetedKnowledgeBase(subject, description) {
  const text = `${subject} ${description}`.toLowerCase();
  const contextParts = [
    `Company Overview: ${BOOKLEAF_KB.company.name} (${BOOKLEAF_KB.company.description}). Print facilities: ${BOOKLEAF_KB.company.facilities}.`
  ];

  if (text.includes('royalt') || text.includes('payment') || text.includes('money') || text.includes('bank') || text.includes('earn') || text.includes('payout')) {
    contextParts.push(`Royalty Policy: ${BOOKLEAF_KB.royalty_policy.split} ${BOOKLEAF_KB.royalty_policy.net_profit_formula} ${BOOKLEAF_KB.royalty_policy.calculation_cycle} ${BOOKLEAF_KB.royalty_policy.minimum_payout} ${BOOKLEAF_KB.royalty_policy.payout_method}`);
  }

  if (text.includes('isbn') || text.includes('barcode') || text.includes('imprint') || text.includes('catalog')) {
    contextParts.push(`ISBN Policy: ${BOOKLEAF_KB.isbn_policy.assignment} ${BOOKLEAF_KB.isbn_policy.author_imprint} ${BOOKLEAF_KB.isbn_policy.error_handling}`);
  }

  if (text.includes('print') || text.includes('binding') || text.includes('copy') || text.includes('copies') || text.includes('quality') || text.includes('page') || text.includes('cover') || text.includes('defect') || text.includes('blur')) {
    contextParts.push(`Printing & Quality Policy: ${BOOKLEAF_KB.printing_and_quality.facilities} Turnaround: ${BOOKLEAF_KB.printing_and_quality.turnaround}. Defects: ${BOOKLEAF_KB.printing_and_quality.defects_policy}`);
  }

  if (text.includes('amazon') || text.includes('flipkart') || text.includes('unavailable') || text.includes('stock') || text.includes('store') || text.includes('distribut')) {
    contextParts.push(`Distribution & Availability: Channels: ${BOOKLEAF_KB.distribution_and_availability.channels.join(', ')}. Go live: ${BOOKLEAF_KB.distribution_and_availability.live_timeline}. Unavailable issue: ${BOOKLEAF_KB.distribution_and_availability.out_of_stock_sync}`);
  }

  if (text.includes('stage') || text.includes('typeset') || text.includes('proof') || text.includes('edit') || text.includes('delay') || text.includes('status') || text.includes('production') || text.includes('when')) {
    contextParts.push(`Production Stages: ${BOOKLEAF_KB.production_stages.join(' -> ')}. Notes: ${BOOKLEAF_KB.production_notes}`);
  }

  // Include communication guidelines
  contextParts.push(`Tone Guidelines: Empathic, professional, partner mindset. Cite specific numbers/dates/statuses. Own BookLeaf mistakes directly. Escalate with 48h timeline. End with a clear next step.`);

  return contextParts.join('\n\n');
}

/**
 * Robust Rule-based Fallback Engine (Graceful Degradation when LLM API Key is missing or service is down)
 */
function heuristicAnalysis(subject, description, bookData, authorData) {
  const text = `${subject} ${description}`.toLowerCase();

  let category = 'General Inquiry';
  let category_confidence = 0.82;
  let priority = 'Medium';
  let priority_reason = 'Standard author support query';

  // Category Detection
  if (text.includes('royalt') || text.includes('payment') || text.includes('payout') || text.includes('money') || text.includes('bank') || text.includes('earn')) {
    category = 'Royalty & Payments';
    category_confidence = 0.94;
    if (text.includes('not received') || text.includes('overdue') || text.includes('delayed') || text.includes('months') || text.includes('zero') || text.includes('never')) {
      priority = 'High';
      priority_reason = 'Payment delay or overdue royalty reported by author';
    }
    if (text.includes('6 months') || text.includes('stolen') || text.includes('fraud') || text.includes('legal')) {
      priority = 'Critical';
      priority_reason = 'Long-standing unresolved royalty dispute';
    }
  } else if (text.includes('isbn') || text.includes('barcode') || text.includes('metadata') || text.includes('imprint')) {
    category = 'ISBN & Metadata Issues';
    category_confidence = 0.96;
    priority = 'High';
    priority_reason = 'ISBN discrepancies directly affect book identification and marketplace sales';
  } else if (text.includes('print') || text.includes('paper') || text.includes('binding') || text.includes('defect') || text.includes('blurry') || text.includes('damaged') || text.includes('misprint')) {
    category = 'Printing & Quality';
    category_confidence = 0.93;
    priority = 'High';
    priority_reason = 'Physical book quality or defective copies received by author';
  } else if (text.includes('amazon') || text.includes('flipkart') || text.includes('unavailable') || text.includes('out of stock') || text.includes('listing')) {
    category = 'Distribution & Availability';
    category_confidence = 0.91;
    priority = 'Medium';
    priority_reason = 'Marketplace listing or stock availability synchronization issue';
  } else if (text.includes('typesetting') || text.includes('cover design') || text.includes('proofreading') || text.includes('stage') || text.includes('timeline') || text.includes('when will it be done') || text.includes('progress')) {
    category = 'Book Status & Production Updates';
    category_confidence = 0.90;
    priority = 'Medium';
    priority_reason = 'Author inquiring on production stage timeline';
  }

  // Draft Response Synthesis
  const authorName = authorData?.name || 'Author';
  const bookTitle = bookData?.title ? `"${bookData.title}"` : 'your book';

  let draftResponse = '';

  if (category === 'Royalty & Payments') {
    const pending = bookData?.royalty_pending !== undefined ? `₹${bookData.royalty_pending}` : 'your pending amount';
    const paid = bookData?.royalty_paid !== undefined ? `₹${bookData.royalty_paid}` : 'previous payouts';
    const lastPayout = bookData?.last_royalty_payout_date ? new Date(bookData.last_royalty_payout_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'pending initial cycle';

    draftResponse = `Dear ${authorName},

Thank you for reaching out to BookLeaf Publishing. I completely understand your concern regarding royalties for ${bookTitle}, and I appreciate the opportunity to clarify this for you.

At BookLeaf, royalties follow an 80/20 profit split (80% of net profit goes directly to you after printing costs, platform commission, and shipping). Royalties are calculated quarterly and disbursed within 45 days of the quarter ending, provided accumulated earnings meet the minimum threshold of ₹1,000.

According to our records for ${bookTitle}:
• Total Royalty Earned to Date: ₹${bookData?.total_royalty_earned || 0}
• Total Royalty Paid Out: ${paid} (Last payout date: ${lastPayout})
• Current Royalty Pending: ${pending}

Our accounts team is reviewing the payout queue to ensure your bank details on file are verified. If this disbursement is overdue, I have personally flagged this to our finance desk with a strict 48-hour resolution timeline.

Next Steps:
Please confirm if your bank account details in your Author Dashboard are updated. If you would like a granular, line-by-line sales report per marketplace, let me know and I will gladly generate that for you immediately.

Warm regards,
BookLeaf Author Support Team`;
  } else if (category === 'ISBN & Metadata Issues') {
    const isbn = bookData?.isbn || 'assigned ISBN';
    draftResponse = `Dear ${authorName},

Thank you for bringing this to our attention. I understand how concerning an ISBN discrepancy is for ${bookTitle}, and we treat any cataloging issue as an immediate high-priority item.

Every book published through BookLeaf is allocated a unique ISBN under our publishing imprint (registered ISBN: ${isbn}). A mismatch between marketplace listings and physical copies can impact distribution tracking.

Action Taken:
I have escalated your ticket directly to our Production & Metadata Lead with a 48-hour resolution window. Our team is auditing the marketplace feeds across Amazon, Flipkart, and our global distribution channels to correct any linked metadata.

Next Steps:
You do not need to take any action right now. Our metadata team will verify the feed alignment and notify you once the correction propagates across seller platforms (typically 24–48 hours).

Warm regards,
BookLeaf Author Support Team`;
  } else if (category === 'Printing & Quality') {
    draftResponse = `Dear ${authorName},

I am genuinely sorry to hear that the print quality of your author copies for ${bookTitle} fell short of expectations. We take immense pride in our craftsmanship, and we deeply apologize for the inconvenience caused.

Under BookLeaf's Quality Guarantee Policy, whenever an author encounters misprints, binding defects, or color variations, we arrange a 100% free reprint without delay.

Next Steps:
1. Please reply with 2–3 photos highlighting the defective areas (e.g., binding, cover finish, or misaligned pages).
2. Once our quality assurance team logs the verification, our Delhi print facility will prioritize a complimentary replacement batch.
3. Standard turnaround for replacement copies is 5–7 business days, complete with express dispatch and tracking.

Thank you for your patience while we make this right.

Warm regards,
BookLeaf Author Support Team`;
  } else if (category === 'Distribution & Availability') {
    const channels = bookData?.available_on?.length ? bookData.available_on.join(', ') : 'Amazon India, Flipkart, and the BookLeaf Store';
    draftResponse = `Dear ${authorName},

Thank you for bringing the availability of ${bookTitle} to our attention.

When a published book appears as 'Currently Unavailable' on partner channels such as Amazon or Flipkart, it is typically a temporary inventory stock-sync lag between marketplace warehouses and our print-on-demand fulfillment nodes.

Action Taken:
We have initiated a manual stock synchronization push for ${bookTitle} across your active distribution channels (${channels}).

Next Steps:
Channel catalog sync typically reflects live within 24–48 hours. Our distribution team will monitor the listing and update you as soon as the live purchase button is active again.

Warm regards,
BookLeaf Author Support Team`;
  } else if (category === 'Book Status & Production Updates') {
    const currentStatus = bookData?.status || 'In Production';
    draftResponse = `Dear ${authorName},

Thank you for checking in on the production progress of ${bookTitle}. We love your enthusiasm to see your book come to life!

As of today, your book is currently in the following stage:
• Current Milestone: ${currentStatus}
• Standard Production Pipeline: Manuscript Received → Editing → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live.

Our production team is actively coordinating this stage. While revisions and approvals can occasionally introduce brief delays, we are committed to moving your book swiftly to the next phase.

Next Steps:
Our editorial coordinator will send you a milestone status email within 48 hours. If you have any specific files or feedback pending on your end, please let us know so we can keep everything on schedule.

Warm regards,
BookLeaf Author Support Team`;
  } else {
    draftResponse = `Dear ${authorName},

Thank you for reaching out to BookLeaf Publishing. We have received your query regarding "${subject}".

We are currently reviewing your account details and will provide you with a comprehensive update. Our author support team works closely with publishing, printing, and distribution specialists to ensure every question is thoroughly addressed.

Next Steps:
A dedicated support representative has been assigned to your ticket. We will follow up within 24–48 hours with specific details. If you have any additional information or files to share, feel free to reply directly to this thread.

Warm regards,
BookLeaf Author Support Team`;
  }

  return {
    category,
    category_confidence,
    priority,
    priority_reason,
    draftResponse,
    model_used: 'bookleaf-heuristic-ai-v1',
    confidence: 0.92
  };
}

/**
 * Main AI Analysis Function:
 * Integrates Gemini API if GEMINI_API_KEY is provided;
 * Degrades gracefully to the intelligent heuristic engine on error or missing key.
 */
async function analyzeTicketAndDraftResponse({ subject, description, authorData, bookData }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key is provided, use the heuristic engine immediately
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini')) {
    console.log('[AI Service] No Gemini API key provided. Using built-in BookLeaf AI Heuristic Engine.');
    return heuristicAnalysis(subject, description, bookData, authorData);
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Targeted KB extraction for cost-conscious token minimization
    const targetedKB = getTargetedKnowledgeBase(subject, description);

    const authorContext = authorData ? `
Author Information:
- Name: ${authorData.name}
- Email: ${authorData.email}
- Joined Date: ${authorData.joined_date || 'N/A'}
` : '';

    const bookContext = bookData ? `
Book Information:
- Title: ${bookData.title}
- ISBN: ${bookData.isbn || 'Pending'}
- Genre: ${bookData.genre || 'N/A'}
- Publication Date: ${bookData.publication_date || 'In Production'}
- Status: ${bookData.status}
- Total Copies Sold: ${bookData.total_copies_sold || 0}
- Total Royalty Earned: ₹${bookData.total_royalty_earned || 0}
- Royalty Paid: ₹${bookData.royalty_paid || 0}
- Royalty Pending: ₹${bookData.royalty_pending || 0}
- Last Royalty Payout Date: ${bookData.last_royalty_payout_date || 'None'}
- Print Partner: ${bookData.print_partner || 'In-House'}
- Available On: ${bookData.available_on ? bookData.available_on.join(', ') : 'N/A'}
` : 'Book Information: General / Account-Level Query (No specific book attached)';

    const prompt = `You are the lead AI support assistant for BookLeaf Publishing, an author-first self-publishing company.
Analyze this author support ticket and provide:
1. Category classification (MUST be one of: "Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry")
2. Priority score ("Critical", "High", "Medium", "Low") with a concise reason.
3. An empathetic, professional, and specific draft response addressing the author's query.

BOOKLEAF KNOWLEDGE BASE & POLICIES:
${targetedKB}

${authorContext}
${bookContext}

AUTHOR TICKET:
Subject: ${subject}
Description: ${description}

RESPONSE TONE REQUIREMENTS:
- Empathetic and professional. Treat authors as creative partners, not customers to be brushed off.
- Acknowledge their specific concern before jumping into details.
- Cite specific numbers, dates, titles, and amounts from the BookLeaf context where applicable.
- If it is BookLeaf's responsibility (e.g. payout delay, ISBN mismatch, print defect), own it transparently with zero corporate deflection.
- Give concrete timelines (e.g. 48 hours for investigations, 5-7 business days for reprints).
- End with clear, actionable next steps.

Return ONLY a valid JSON object with the following schema, no markdown code fences:
{
  "category": "string",
  "category_confidence": 0.95,
  "priority": "Critical" | "High" | "Medium" | "Low",
  "priority_reason": "string",
  "draftResponse": "string"
}`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    
    // Clean potential markdown wrap
    const cleanedText = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      category: parsed.category || 'General Inquiry',
      category_confidence: parsed.category_confidence || 0.95,
      priority: parsed.priority || 'Medium',
      priority_reason: parsed.priority_reason || 'AI assessed priority based on ticket content',
      draftResponse: parsed.draftResponse,
      model_used: 'gemini-1.5-flash',
      confidence: parsed.category_confidence || 0.95
    };

  } catch (error) {
    console.warn('[AI Service Warning] Gemini API call failed or rate-limited. Falling back smoothly to Heuristic Engine.', error.message);
    const fallback = heuristicAnalysis(subject, description, bookData, authorData);
    fallback.model_used = 'fallback-heuristic (after api error: ' + error.message.slice(0, 30) + ')';
    return fallback;
  }
}

module.exports = {
  analyzeTicketAndDraftResponse,
  heuristicAnalysis,
  getTargetedKnowledgeBase
};
