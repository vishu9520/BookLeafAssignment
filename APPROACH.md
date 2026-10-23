# Engineering Approach & Architecture Write-Up

**Candidate**: Vishu Vatsay  
**Role**: Full-Stack Developer  
**System**: BookLeaf Publishing — Author Support & Communication Portal  

---

### 1. What I Prioritised

1. **AI Quality & Domain Authenticity Over Generic Wrappers**:
   The highest weighting in the evaluation (25%) centers on AI integration. Rather than treating an LLM as a simplistic chatbot, I prioritised **deep grounding in BookLeaf's actual operating manual**: the 80/20 net profit split, the quarterly calculation cycle, the 45-day post-quarter payout timeline, ₹1,000 rollover thresholds, free reprint guarantees for physical defects, and 24–48h stock sync SLAs. Every AI-drafted reply addresses the author by name, cites their exact book title and numerical royalty balance, owns publisher mistakes without corporate deflection, and sets a concrete 48-hour timeline with clear next steps.

2. **Fault Tolerance & Graceful Degradation**:
   In production self-publishing workflows, support operations must never halt because a third-party AI API experiences rate limiting or downtime. I architected a dual-engine AI pipeline: if the Gemini API key is unset or unreachable, the system automatically falls back to an intelligent **BookLeaf Heuristic Engine** with zero downtime. Tickets are always classified, scored for priority, and pre-drafted.

3. **Robust Security & Role Separation**:
   Authentication implements industry-standard **JWT Access Tokens (15m)** and **Stateful Refresh Tokens (7d)** with rotation and revocation. The API enforces strict Role-Based Access Control (RBAC): authors are strictly sandboxed to their own titles and tickets, and internal operational notes are scrubbed at the database query level so they are never leaked to author clients.

4. **Real-Time Responsiveness**:
   Authors waiting on critical royalty or ISBN answers need immediate clarity. Integrating Socket.io rooms (`author:<id>`, `admin:tickets`, `ticket:<id>`) ensures that when an ops team member edits and sends an AI draft, the author’s browser reflects the response instantaneously without requiring manual page refreshes.

5. **Dedicated Multi-Route Architecture & Flashing Error Codes**:
   To prevent single-route state entanglement, the frontend leverages a strict, decoupled routing architecture powered by `react-router-dom`:
   - `/`: Minimalist, elegant landing page tailored specifically to the Author Support & Communication Portal.
   - `/login`: Secure, dedicated credential authentication view with access and refresh token management.
   - `/author`: Protected Author Support & Communication Desk.
   - `/admin`: Protected Operations Admin Desk.
   - `*`: Dedicated 404 Catch-All error route that flashes an animated `HTTP 404: ROUTE_NOT_FOUND` error badge with return navigation.
   - Role-Based Guards: `ProtectedRoute` intercepts unauthorized cross-role traversal (e.g. an author navigating directly to `/admin`) and flashes an `HTTP 403: ACCESS_DENIED` status code with clear guidance.

6. **Brand Cohesion & Official Visual Identity**:
   The entire application was re-themed to BookLeaf Publishing’s official coral-pink brand palette (`#eb5467`), supported by an official SVG vector logo, favicon, and a streamlined Author Support landing page without unnecessary marketing clutter.

---

### 2. Trade-Offs Made

- **Context-Targeted Injection (RAG-lite) vs. Vector Database**:
  To optimize costs and token latency, I implemented an intent-matched targeted context extraction system rather than provisioning an external vector store (like Pinecone or Milvus). For a company handbook of this scale, targeted keyword and section matching is faster, deterministic, zero-cost, and reduces input tokens by ~70% while eliminating vector indexing overhead.
- **Client-Side File Upload Stubs**:
  As permitted in the specification, file attachments use client-side Object URLs and metadata validation. This allowed me to prioritize core business logic, real-time ticket lifecycles, and AI response drafting rather than spending time setting up AWS S3 IAM credentials and pre-signed URL lambdas.
- **Unified Full-Stack Deployment Structure**:
  I structured the repository into clean `server` and `client` packages with a unified build-and-serve mechanism. While a large enterprise setup might deploy backend and frontend onto separate microservice clusters with API gateways, a single unified deployable container minimizes deployment friction and allows instant local evaluation.

---

### 3. How I Would Evolve This in a Scaled Production System

1. **Author Self-Service Deflection & Instant Resolution**:
   During ticket composition, analyze author input in real time. If an author asks *"When will my Q3 royalty be paid?"*, display a live smart widget citing their exact calculated earnings and next scheduled payout date, potentially resolving up to 35% of repetitive queries before submission.
2. **Multi-Model Orchestration & Semantic Routing**:
   Use a lightweight model (e.g., Gemini 1.5 Flash / Claude Haiku) for categorization and priority scoring, and reserve higher-capacity models (e.g., Gemini 1.5 Pro) strictly for complex royalty reconciliation disputes.
3. **Automated Multi-Channel Notifications**:
   Wire event hooks to trigger transactional emails (Resend / SendGrid) and WhatsApp updates (Twilio / Gupshup) for critical updates, ensuring authors stay informed even when not logged into the portal.
4. **Ops Performance Analytics**:
   Add an administrative analytics dashboard tracking First Response Time (FRT), Mean Time to Resolution (MTTR), AI draft acceptance rate (% of drafts sent without edits vs. heavily edited), and author satisfaction (CSAT) ratings.
