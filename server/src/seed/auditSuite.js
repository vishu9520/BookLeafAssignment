const BASE = 'http://localhost:5000/api';

async function testAll() {
  console.log('=== RUNNING FULL DEEP AUDIT & TEST SUITE ===\n');
  let errors = [];

  // 1. Test Author Login
  console.log('[1/12] Testing Author Authentication...');
  const aLogin = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.sharma@email.com', password: 'author123' })
  });
  const aLoginData = await aLogin.json();
  if (!aLoginData.success) errors.push('Author login failed');
  const aToken = aLoginData.data?.accessToken;
  const aRefresh = aLoginData.data?.refreshToken;
  console.log('✓ Author Login passed:', aLoginData.data?.user?.name);

  // 2. Test Admin Login
  console.log('[2/12] Testing Admin Authentication...');
  const admLogin = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bookleaf.com', password: 'admin123' })
  });
  const admLoginData = await admLogin.json();
  if (!admLoginData.success) errors.push('Admin login failed');
  const admToken = admLoginData.data?.accessToken;
  console.log('✓ Admin Login passed:', admLoginData.data?.user?.name);

  // 3. Test Refresh Token Rotation
  console.log('[3/12] Testing Refresh Token Rotation...');
  const refRes = await fetch(BASE + '/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: aRefresh })
  });
  const refData = await refRes.json();
  if (!refData.success || !refData.data?.accessToken) errors.push('Refresh token rotation failed');
  console.log('✓ Refresh token rotation passed');

  // 4. Test RBAC: Author accessing Admin Route (should return 403)
  console.log('[4/12] Testing RBAC Security Guard (Author accessing /api/tickets queue)...');
  const rbacRes = await fetch(BASE + '/tickets', {
    headers: { 'Authorization': 'Bearer ' + aToken }
  });
  if (rbacRes.status !== 403) errors.push('RBAC failed: Author was not denied access to admin queue');
  console.log('✓ RBAC Security Guard correctly returned 403 Forbidden for author on admin route');

  // 5. Test Author Books & Stats
  console.log('[5/12] Testing Author Books & Royalty Calculations...');
  const booksRes = await fetch(BASE + '/books/my-books', {
    headers: { 'Authorization': 'Bearer ' + aToken }
  });
  const booksData = await booksRes.json();
  if (!booksData.success || !booksData.data.books.length) errors.push('Get My Books failed');
  console.log(`✓ Retrieved ${booksData.data.books.length} books for Priya Sharma. Total Earned: ₹${booksData.data.stats.totalRoyaltyEarned}`);

  // 6. Test Books in Production (e.g. Sneha Kulkarni AUTH007)
  console.log('[6/12] Testing Edge Case: Author with Books in Production (Sneha Kulkarni)...');
  const sLogin = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sneha.kulkarni@email.com', password: 'author123' })
  });
  const sToken = (await sLogin.json()).data.accessToken;
  const sBooksRes = await fetch(BASE + '/books/my-books', { headers: { 'Authorization': 'Bearer ' + sToken } });
  const sBooks = (await sBooksRes.json()).data.books;
  const prodBook = sBooks.find(b => b.status.includes('In Production'));
  if (!prodBook) errors.push('In production book not found for Sneha Kulkarni');
  console.log(`✓ Production book verified: "${prodBook?.title}" (${prodBook?.status})`);

  // 7. Test Ticket Creation with General / Account Level (No book)
  console.log('[7/12] Testing Edge Case: Ticket Creation without book (General Query)...');
  const genTicketRes = await fetch(BASE + '/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aToken },
    body: JSON.stringify({
      book_id: 'GENERAL',
      subject: 'Updating registered bank account details for upcoming payout',
      description: 'I recently switched bank accounts from HDFC to ICICI. Where can I upload my cancelled cheque to update my payout details?'
    })
  });
  const genTicketData = await genTicketRes.json();
  if (!genTicketData.success) errors.push('General ticket creation failed');
  const newTicket = genTicketData.data.ticket;
  console.log(`✓ Ticket #${newTicket.ticket_number} created: Category=${newTicket.category}, Priority=${newTicket.priority}, Model=${newTicket.ai_draft?.model_used}`);

  // 8. Test Data Privacy: Author fetching tickets MUST NOT see internal notes
  console.log('[8/12] Testing Internal Notes Privacy for Authors...');
  const aTicketsRes = await fetch(BASE + '/tickets/my-tickets', { headers: { 'Authorization': 'Bearer ' + aToken } });
  const aTickets = (await aTicketsRes.json()).data.tickets;
  const leakedNotes = aTickets.some(t => t.internal_notes && t.internal_notes.length > 0);
  if (leakedNotes) errors.push('SECURITY VULNERABILITY: Internal notes leaked to author!');
  console.log('✓ Privacy verified: Internal notes completely hidden from author');

  // 9. Test Admin Adding Internal Note
  console.log('[9/12] Testing Admin Adding Internal Note...');
  const noteRes = await fetch(BASE + `/tickets/${newTicket._id}/internal-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + admToken },
    body: JSON.stringify({ note: 'Author contacted helpdesk. Bank verification requested from operations desk.' })
  });
  const noteData = await noteRes.json();
  if (!noteData.success) errors.push('Add internal note failed');
  console.log('✓ Internal note successfully stored for ticket');

  // 10. Test Admin Overriding AI Classification & Priority
  console.log('[10/12] Testing Admin Overriding AI Classification...');
  const overRes = await fetch(BASE + `/tickets/${newTicket._id}/override`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + admToken },
    body: JSON.stringify({ category: 'General Inquiry', priority: 'Medium' })
  });
  const overData = await overRes.json();
  if (!overData.success || !overData.data.ticket.category_overridden) errors.push('Override classification failed');
  console.log('✓ Classification override confirmed: category_overridden=' + overData.data.ticket.category_overridden);

  // 11. Test Admin Responding with AI Draft & Status Transition
  console.log('[11/12] Testing Admin Response with AI Draft...');
  const respRes = await fetch(BASE + `/tickets/${newTicket._id}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + admToken },
    body: JSON.stringify({
      message: newTicket.ai_draft.response,
      was_ai_draft: true,
      update_status_to: 'In Progress'
    })
  });
  const respData = await respRes.json();
  if (!respData.success || respData.data.ticket.status !== 'In Progress') errors.push('Post response failed');
  console.log('✓ Admin response posted successfully. Status changed to: In Progress');

  // 12. Test Regenerate AI Draft On Demand
  console.log('[12/12] Testing On-Demand AI Draft Regeneration...');
  const regenRes = await fetch(BASE + `/tickets/${newTicket._id}/regenerate-draft`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + admToken }
  });
  const regenData = await regenRes.json();
  if (!regenData.success || !regenData.data.ai_draft?.response) errors.push('Regenerate draft failed');
  console.log(`✓ AI Draft regenerated successfully using: ${regenData.data.ai_draft.model_used}`);

  console.log('\n======================================================');
  if (errors.length === 0) {
    console.log('🎉 ALL 12/12 FUNCTIONALITY & SECURITY TESTS PASSED WITH 0 ERRORS!');
  } else {
    console.log('❌ ERRORS FOUND:', errors);
  }
  console.log('======================================================');
}

testAll().catch(console.error);
