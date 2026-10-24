import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        # Top thin decorative line
        # Bottom footer
        footer_text = f"BookLeaf Publishing — Technical Assignment Submission | Vishu Vatsay"
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawString(54, 30, footer_text)
        self.drawRightString(612 - 54, 30, page_str)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 42, 612 - 54, 42)
        self.restoreState()

def build_pdf(filename="BookLeaf_Assignment_Setup_Instructions.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=46,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0F766E")   # Teal 700
    c_dark = colors.HexColor("#0F172A")      # Slate 900
    c_body = colors.HexColor("#334155")      # Slate 700
    c_muted = colors.HexColor("#64748B")     # Slate 500
    c_bg_code = colors.HexColor("#0F172A")   # Terminal Dark
    c_bg_light = colors.HexColor("#F8FAFC")  # Light gray
    c_border = colors.HexColor("#CBD5E1")    # Border slate

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_dark
    )
    
    sub_title_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_primary
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_dark,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_body
    )
    
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_muted,
        alignment=2 # Right aligned
    )
    
    code_inline_style = ParagraphStyle(
        'CodeInline',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0F766E")
    )
    
    code_block_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#F8FAFC")
    )

    story = []

    # 1. Header with Metadata
    header_data = [
        [
            Paragraph("<b>BookLeaf Publishing</b><br/><font color='#0F766E' size='11'>Author Support & Communication Portal</font><br/><font size='9' color='#64748B'>Technical Assignment Submission & Setup Guide</font>", title_style),
            Paragraph("<b>Candidate:</b> Vishu Vatsay<br/><b>Role:</b> Full Stack Developer<br/><b>Date:</b> October 2026<br/><b>Stack:</b> React 18 &bull; Node.js &bull; MongoDB", meta_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[330, 182])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=c_primary, spaceBefore=4, spaceAfter=10))

    # 2. Key Submission Links Table
    story.append(Paragraph("1. Project Submission & Live Endpoints", h1_style))
    links_data = [
        [Paragraph("<b>Resource</b>", body_bold), Paragraph("<b>Link / Access URL</b>", body_bold), Paragraph("<b>Description</b>", body_bold)],
        [Paragraph("<b>GitHub Repository</b>", body_style), Paragraph("<font name='Courier' color='#0F766E'>https://github.com/vishu9520/BookLeafAssignment</font>", body_style), Paragraph("Full source code (Client, Server, Seed, Docs)", body_style)],
        [Paragraph("<b>Live Backend API</b>", body_style), Paragraph("<font name='Courier' color='#0F766E'>https://bookleafassignment-0oxm.onrender.com</font>", body_style), Paragraph("Production REST API with CORS enabled", body_style)],
        [Paragraph("<b>Interactive Swagger Docs</b>", body_style), Paragraph("<font name='Courier' color='#0F766E'>https://bookleafassignment-0oxm.onrender.com/api-docs</font>", body_style), Paragraph("Full OpenAPI specification UI with live 'Try it out'", body_style)],
        [Paragraph("<b>API Health Check</b>", body_style), Paragraph("<font name='Courier' color='#0F766E'>https://bookleafassignment-0oxm.onrender.com/api/health</font>", body_style), Paragraph("Service health & active AI engine status probe", body_style)]
    ]
    t_links = Table(links_data, colWidths=[120, 240, 152])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_bg_light),
        ('TEXTCOLOR', (0, 0), (-1, 0), c_dark),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_links)
    story.append(Spacer(1, 10))

    # 3. Prerequisites
    story.append(Paragraph("2. Prerequisites", h1_style))
    prereq_text = (
        "&bull; <b>Node.js:</b> v18.0.0 or higher (v20+ recommended)<br/>"
        "&bull; <b>npm:</b> v9.0.0 or higher<br/>"
        "&bull; <b>MongoDB:</b> MongoDB Atlas connection string (or local MongoDB on port 27017)<br/>"
        "&bull; <b>Git</b> installed"
    )
    story.append(Paragraph(prereq_text, body_style))
    story.append(Spacer(1, 10))

    # 4. Step-by-Step Setup
    story.append(Paragraph("3. Step-by-Step Local Setup", h1_style))
    
    setup_p1 = "<b>Step 1: Clone the repository and navigate into the root directory</b>"
    story.append(Paragraph(setup_p1, body_style))
    cmd1 = "git clone https://github.com/vishu9520/BookLeafAssignment.git\ncd BookLeafAssignment"
    t_cmd1 = Table([[Paragraph(cmd1.replace("\n", "<br/>"), code_block_style)]], colWidths=[512])
    t_cmd1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_code),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_cmd1)
    story.append(Spacer(1, 6))

    setup_p2 = "<b>Step 2: Install dependencies for both Server and Client</b>"
    story.append(Paragraph(setup_p2, body_style))
    cmd2 = "npm run install:all"
    t_cmd2 = Table([[Paragraph(cmd2, code_block_style)]], colWidths=[512])
    t_cmd2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_code),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_cmd2)
    story.append(Spacer(1, 6))

    setup_p3 = "<b>Step 3: Configure Environment Variables</b>"
    story.append(Paragraph(setup_p3, body_style))
    cmd3 = "cp server/.env.example server/.env"
    t_cmd3 = Table([[Paragraph(cmd3, code_block_style)]], colWidths=[512])
    t_cmd3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_code),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_cmd3)
    story.append(Spacer(1, 4))
    
    env_content = (
        "PORT=5000\n"
        "MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bookleaf?retryWrites=true&w=majority\n"
        "JWT_ACCESS_SECRET=your_jwt_access_secret_super_secure_2026\n"
        "JWT_REFRESH_SECRET=your_jwt_refresh_secret_super_secure_2026\n"
        "JWT_ACCESS_EXPIRES_IN=15m\n"
        "JWT_REFRESH_EXPIRES_IN=7d\n"
        "# AI LLM Engine (Optional: built-in heuristic fallback automatically activates if omitted)\n"
        "GROQ_API_KEY=your_groq_api_key_here\n"
        "GROQ_MODEL=qwen/qwen3.8-27b\n"
        "LLM_PROVIDER=groq\n"
        "CLIENT_URL=http://localhost:5173\n"
        "NODE_ENV=development"
    )
    t_env = Table([[Paragraph(env_content.replace("\n", "<br/>"), code_block_style)]], colWidths=[512])
    t_env.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#1E293B")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_env)

    # Page Break to Page 2
    story.append(PageBreak())

    # 5. Database Seeding
    story.append(Paragraph("4. Database Seeding (Pre-populate Official Dataset)", h1_style))
    story.append(Paragraph(
        "Run the automated seed command to import all 10 authors, 18 books, and initial tickets into MongoDB:", body_style
    ))
    cmd_seed = "npm run seed"
    t_seed = Table([[Paragraph(cmd_seed, code_block_style)]], colWidths=[512])
    t_seed.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_code),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_seed)
    story.append(Spacer(1, 10))

    # 6. Running the Application
    story.append(Paragraph("5. Running the Application (Local Development)", h1_style))
    story.append(Paragraph("Launch backend and frontend in two separate terminal windows from the root directory:", body_style))
    
    run_text = [
        [
            Paragraph("<b>Terminal 1: Backend Express Server & WebSockets</b><br/>"
                      "<font name='Courier' color='#0F766E'>npm run server</font><br/>"
                      "&bull; Listening on: <b>http://localhost:5000</b><br/>"
                      "&bull; Swagger Docs: <b>http://localhost:5000/api-docs</b><br/>"
                      "&bull; Health Check: <b>http://localhost:5000/api/health</b>", body_style),
            Paragraph("<b>Terminal 2: Frontend React 18 SPA (Vite)</b><br/>"
                      "<font name='Courier' color='#0F766E'>npm run client</font><br/>"
                      "&bull; Portal UI: <b>http://localhost:5173</b><br/>"
                      "&bull; Direct WebSocket connect in dev<br/>"
                      "&bull; Hot Module Replacement enabled", body_style)
        ]
    ]
    t_run = Table(run_text, colWidths=[250, 252])
    t_run.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_light),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_run)
    story.append(Spacer(1, 10))

    # 7. Test Credentials
    story.append(Paragraph("6. Pre-Seeded Test Login Credentials", h1_style))
    creds_data = [
        [Paragraph("<b>Role</b>", body_bold), Paragraph("<b>Email</b>", body_bold), Paragraph("<b>Password</b>", body_bold), Paragraph("<b>Account Scope & Dataset Highlights</b>", body_bold)],
        [
            Paragraph("<b>Admin (Ops Desk)</b>", body_style),
            Paragraph("admin@bookleaf.com", code_inline_style),
            Paragraph("admin123", code_inline_style),
            Paragraph("Full ticket queue triage, AI classification override, AI response draft synthesis, internal ops notes.", body_style)
        ],
        [
            Paragraph("<b>Author (Sample 1)</b>", body_style),
            Paragraph("priya.sharma@email.com", code_inline_style),
            Paragraph("author123", code_inline_style),
            Paragraph("ID: <code>AUTH001</code> &bull; 2 live titles &bull; ₹11,970 earned &bull; ₹3,570 pending &bull; ticket conversation.", body_style)
        ],
        [
            Paragraph("<b>Author (Sample 2)</b>", body_style),
            Paragraph("rohit.kapoor@email.com", code_inline_style),
            Paragraph("author123", code_inline_style),
            Paragraph("ID: <code>AUTH002</code> &bull; 2 bestsellers &bull; 2,000+ sold &bull; global distribution channels.", body_style)
        ],
        [
            Paragraph("<b>Author (Sample 3)</b>", body_style),
            Paragraph("sneha.kulkarni@email.com", code_inline_style),
            Paragraph("author123", code_inline_style),
            Paragraph("ID: <code>AUTH007</code> &bull; 2 live books + 1 in production (<i>Midnight in Mysore</i> - Cover Design).", body_style)
        ],
        [
            Paragraph("<b>All Authors</b>", body_style),
            Paragraph("<font size='8'>&lt;firstname&gt;.&lt;lastname&gt;@email.com</font>", body_style),
            Paragraph("author123", code_inline_style),
            Paragraph("All 10 authors (<code>AUTH001</code> through <code>AUTH010</code>) are seeded with identical dataset attributes.", body_style)
        ]
    ]
    t_creds = Table(creds_data, colWidths=[100, 140, 68, 204])
    t_creds.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_bg_light),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_creds)
    story.append(Spacer(1, 10))

    # 8. Technical Notes & Architecture
    story.append(Paragraph("7. Technical Assumptions & Edge Cases Handled", h1_style))
    notes = (
        "&bull; <b>Royalty Computation Rules:</b> Follows BookLeaf 80/20 royalty split (80% Author / 20% Publisher), quarterly payout cycles, and clearly flags whether pending royalties meet the ₹1,000 disbursement threshold.<br/>"
        "&bull; <b>In-Production Titles:</b> Handled gracefully without zero-division or missing links (e.g., <i>Midnight in Mysore</i> and <i>Raising Roots</i> display dedicated production workflow milestone badges).<br/>"
        "&bull; <b>Real-Time Bi-Directional Chat:</b> Uses Socket.IO duplex communication. Author messages update admin queue immediately; staff replies reflect on author desks with zero page reloads.<br/>"
        "&bull; <b>Internal Note Security:</b> Private ops notes are strictly filtered out on author-facing endpoints using database-level Mongoose query projection (`.select('-internal_notes')`).<br/>"
        "&bull; <b>AI Fallback Resilience:</b> The AI classification and response generator incorporates an automated fallback to the internal BookLeaf Heuristic Engine so the app remains 100% functional without an external LLM key."
    )
    story.append(Paragraph(notes, body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully created: {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == '__main__':
    build_pdf()
