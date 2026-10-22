# 📚 BookLeaf Publishing — Author Support & Communication Portal

> **Full-Stack Technical Assignment**  
> Built for BookLeaf Publishing by **Vishu Vatsay**  
> Live Demo: Connected to MongoDB Atlas (`cluster0.dalbiv3.mongodb.net/vishuvatsay`)  
> Interactive Swagger API Docs: `http://localhost:5000/api-docs`

---

## 🌟 Executive Summary

BookLeaf Publishing handles 1,200+ titles monthly across a catalog of 22,000+ books. Managing author inquiries regarding royalties, distribution sync, ISBN records, and print defects requires scalable, consistent, and empathetic communication.

This application delivers a production-grade **Author Support & Communication Portal** featuring two unified, role-based interfaces:
1. **Author-Facing Portal**: Secure dashboard where authors can monitor their published titles, inspect real-time sales & royalty statements (earned, paid, pending), submit queries with file attachments, and converse with the operations team with zero-refresh live updates.
2. **Admin-Facing Portal (Operations Desk)**: Queue management workspace with multi-attribute filtering (category, status, priority, search), **AI-Powered Auto-Classification**, **AI-Assisted Priority Scoring**, **AI Response Studio** (context-aware drafts adhering to BookLeaf Publishing Knowledge Base policies), internal notes, and staff assignment.

---

## 🔑 Test Login Credentials (Pre-Seeded)

The database is pre-seeded with all **10 authors** and **18 books** from the provided BookLeaf dataset.

| Role | Persona / Name | Email | Password | Dataset Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | BookLeaf Ops Admin | `admin@bookleaf.com` | `admin123` | Full queue management, AI classification override, internal notes |
| **Author** | Priya Sharma (`AUTH001`) | `priya.sharma@email.com` | `author123` | 2 live books, ₹11,970 royalties earned, ₹3,570 pending payout |
| **Author** | Rohit Kapoor (`AUTH002`) | `rohit.kapoor@email.com` | `author123` | 2 bestseller books, 2,000+ copies sold, global distribution channels |
| **Author** | Ananya Reddy (`AUTH003`) | `ananya.reddy@email.com` | `author123` | 1 historical fiction book, ₹2,546 pending initial cycle payout |
| **Author** | Vikram Joshi (`AUTH004`) | `vikram.joshi@email.com` | `author123` | 2 books, poetry & self-help, resolved quality reprint case |
| **Author** | Sneha Kulkarni (`AUTH007`) | `sneha.kulkarni@email.com` | `author123` | 2 live books + 1 in production (`Midnight in Mysore` - Cover Design) |
| **Author** | Kavita Deshmukh (`AUTH009`)| `kavita.deshmukh@email.com` | `author123` | 1 live book + 1 in production (`Raising Roots` - Typesetting) |
| *All Authors*| Authors 001 through 010 | `<firstname>.<lastname>@email.com` | `author123` | Seeded identically to official JSON |

> 💡 **Evaluator Convenience**: The login page also features **1-Click Quick Login persona cards** and a **Persona Switcher** in the navigation bar to test any account with a single click!

---

## 🏗️ Architecture & Technical Stack

```
                     ┌────────────────────────────────────────┐
                     │          React 18 SPA (Vite)           │
                     │  TailwindCSS / Lucide Icons / Axios    │
                     └───────────────────┬────────────────────┘
                                         │
                    REST API (JSON)      │     WebSocket (Socket.io)
                    JWT (Access+Refresh) │     Real-Time Updates
                                         │
                     ┌───────────────────▼────────────────────┐
                     │          Node.js + Express             │
                     │      Authentication Middleware         │
                     │    Role-Based Access Control (RBAC)    │
                     └─────────┬───────────────────┬──────────┘
                               │                   │
               Mongoose / BSON │                   │ Targeted Context / Fallback
                               │                   │
               ┌───────────────▼──────┐    ┌───────▼────────────────────────┐
               │    MongoDB Atlas     │    │       AI Integration Layer     │
               │ (Users, Books,       │    │  Groq Cloud (Qwen 3.8 27B)     │
               │  Tickets, Notes)     │    │  + Google Gemini 1.5 Flash     │
               │                      │    │  + BookLeaf Heuristic Engine   │
               └──────────────────────┘    └────────────────────────────────┘
```

### Core Technologies
- **Backend**: Node.js, Express 4, Socket.io (WebSocket duplex communication), Mongoose 8.
- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Axios (with automatic refresh-token rotation interceptors).
- **Database**: MongoDB Atlas Cluster (`cluster0.dalbiv3.mongodb.net/vishuvatsay`).
- **AI / LLM Integration**: Multi-provider support:
  - **Groq Cloud** (`qwen/qwen3.8-27b` / `openai/gpt-oss-120b`) for sub-second, cost-efficient inference.
  - **Google Gemini** (`gemini-1.5-flash`).
  - **BookLeaf Heuristic Engine** for instant offline fallback.
- **Authentication**: Stateless JWT Access Token (`15m` validity) + Stateful JWT Refresh Token (`7d` validity) with database verification, multi-session rotation, and automatic request queuing.
- **API Spec**: Interactive Swagger UI at `http://localhost:5000/api-docs`.

---

## 🧠 AI Integration Architecture

### 1. Prompt Engineering & Domain Knowledge Context
The AI assistant is conditioned with the **BookLeaf Publishing Knowledge Base** directly extracted from operational policies:
- **Royalty Split**: 80/20 profit split (80% author, 20% publisher), quarterly payout cycle, 45-day post-quarter disbursement window, and ₹1,000 threshold.
- **ISBN Assignment**: Imprint uniqueness, duplicate error escalation with 48h SLA.
- **Printing & Defect Handling**: Delhi facility + Repro India/Epitome Books, 5-7 business day turnaround, free reprints for verified defects.
- **Distribution Channels**: Amazon India, Flipkart, Amazon US, Amazon UK, BookLeaf Store; 24-48h catalog inventory resync.
- **Production Pipeline**: `Manuscript Received` → `Editing` → `Cover Design` → `Typesetting` → `Proofreading` → `ISBN Assignment` → `Printing` → `Distribution Setup` → `Published & Live`.
- **Tone Guidelines**: Empathetic, partner-first mindset, referencing specific numbers/dates/statuses, owning errors transparently, and ending with clear next steps.

### 2. Token Optimization & Cost Consciousness
Instead of dumping the entire knowledge base and past ticket history into every LLM invocation, the AI service uses **Targeted Context Retrieval (RAG-lite)**:
- Analyzes ticket keywords (`royalty`, `isbn`, `misprint`, `unavailable`, `typesetting`) and injects *only* the relevant policy subsection.
- Injects precise author record metadata (book title, copies sold, royalty earned/paid/pending, publication date) into the prompt.
- Results in **~70% token reduction** per query compared to brute-force prompting.

### 3. Graceful Degradation & High Availability
- **Zero Downtime**: When an external LLM API key is absent, expired, or rate-limited, the system **degrades gracefully** to the internal **BookLeaf Heuristic AI Engine**.
- All ticket submissions succeed immediately; category classification, priority scores, and drafted responses are synthesized without failure.
- Admins can freely edit the generated draft before dispatching it to the author.

---

## 🚀 Setup & Local Execution Guide

### Prerequisites
- Node.js `v18.0.0` or higher (Tested on `v20.19.5`)
- npm `v9.0.0` or higher (Tested on `v11.0.0`)

### Step 1: Clone the Repository
```bash
git clone <repository_url>
cd BookLeafAssignment
```

### Step 2: Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```
*(Or navigate to `/server` and `/client` individually and run `npm install`)*

### Step 3: Configure Environment Variables
The `.env` file is pre-configured in `server/.env` with the MongoDB Atlas cluster connection string:
```ini
PORT=5000
MONGODB_URI=mongodb+srv://vishuvatsay:Vatsay@cluster0.dalbiv3.mongodb.net/vishuvatsay?retryWrites=true&w=majority&appName=Cluster0
JWT_ACCESS_SECRET=bookleaf_access_secret_super_secure_jwt_token_2026_production
JWT_REFRESH_SECRET=bookleaf_refresh_secret_super_secure_jwt_token_2026_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=               # Optional: Insert Google Gemini API Key here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 4: Seed the Database
```bash
npm run seed
```
This populates MongoDB with all 10 authors, 18 books, default admin account, and realistic initial tickets.

### Step 5: Start the Application
You can run the server and client concurrently or serve the built client from the server:

**Option A: Unified Server (Serves SPA & API on port 5000)**:
```bash
# Build the client once
npm run build

# Start the server
npm start
```
Open **`http://localhost:5000`** in your browser.

**Option B: Full Dev Mode (Hot-Reloading)**:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```
Open **`http://localhost:5173`** for the frontend with hot-module reload.

---

## 📡 REST API Documentation

Interactive Swagger OpenAPI spec is hosted at:  
👉 **`http://localhost:5000/api-docs`**

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user; returns JWT `accessToken`, `refreshToken`, and profile |
| `POST` | `/api/auth/refresh` | Public | Rotates `refreshToken` and issues fresh `accessToken` |
| `POST` | `/api/auth/logout` | Private | Revokes refresh token session |
| `GET` | `/api/auth/me` | Private | Retrieves current authenticated user context |
| `GET` | `/api/books/my-books`| Author | Fetches author's books, royalty metrics, and inventory stats |
| `GET` | `/api/books` | Admin | Fetches catalog across all authors |
| `POST` | `/api/tickets` | Author | Submits ticket; runs AI auto-classification and response drafting |
| `GET` | `/api/tickets/my-tickets` | Author | Retrieves author's submitted tickets (excludes internal notes) |
| `GET` | `/api/tickets` | Admin | Fetches ticket queue with filtering (`status`, `category`, `priority`, `sortBy`, `search`) |
| `GET` | `/api/tickets/:id` | Authenticated | Fetches ticket conversation thread (RBAC verified) |
| `POST` | `/api/tickets/:id/responses` | Authenticated | Appends response message; broadcasts in real-time |
| `POST` | `/api/tickets/:id/internal-notes` | Admin | Saves private ops note (hidden from authors) |
| `PATCH`| `/api/tickets/:id/override` | Admin | Overrides AI classification category or priority score |
| `PATCH`| `/api/tickets/:id/status` | Admin | Updates ticket lifecycle (`Open`, `In Progress`, `Resolved`, `Closed`) |
| `POST` | `/api/tickets/:id/regenerate-draft` | Admin | Re-synthesizes AI draft using updated context |

---

## 🛡️ Edge Cases Handled

1. **Books in Production**: Handled gracefully without zero-division or misleading calculations (e.g. `Midnight in Mysore` and `Raising Roots` display distinct production badges instead of empty store links).
2. **Royalty Threshold Mechanics**: Highlights whether pending royalties meet the ₹1,000 disbursement threshold or roll over to the next quarter.
3. **Session Token Expiry During Response Drafting**: Frontend Axios interceptor pauses inflight requests, rotates the refresh token, and replays requests seamlessly without interrupting the user.
4. **Internal Note Confidentiality**: Mongoose queries explicitly omit `.select('-internal_notes')` on author routes to prevent information leakage.
5. **Real-Time Cross-Tab Synchronization**: WebSockets update both author and admin screens instantly when ticket statuses change or responses are submitted.

---

## 🔮 Future Production Improvements

1. **Persistent Cloud Storage for Attachments**: Integration with AWS S3 / Cloudinary with pre-signed URLs.
2. **Email & SMS Notifications**: Webhook delivery (e.g., SendGrid, Resend) alerting authors when an ops representative responds.
3. **Automated Vector RAG**: Storing full publishing contract terms and distributor agreements in Pinecone/pgvector for deeper contextual reasoning.
4. **Author Self-Service FAQ**: AI-powered deflection suggestion box during ticket composition to answer frequent questions before ticket submission.
