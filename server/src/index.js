require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');
const { swaggerUi, swaggerDocument } = require('./config/swagger');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for development & deployment
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

initSocket(io);

// Core Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    // console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });
}

const getAiStatus = () => {
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq')) {
    return `groq-active (${process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'})`;
  }
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini')) {
    return 'gemini-active';
  }
  return 'heuristic-fallback-active';
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BookLeaf Publishing Support Portal API',
    ai_status: getAiStatus()
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/tickets', ticketRoutes);

// Serve static frontend in production or if client/dist exists
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // If client/dist is not present (backend-only deployment on Render), return API service info
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'BookLeaf Publishing - Author Support & Communication Portal API',
      status: 'online',
      ai_status: getAiStatus(),
      documentation: '/api-docs',
      health: '/api/health'
    });
  });
}

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    errorCode: 'ROUTE_NOT_FOUND',
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 BookLeaf Server listening on http://localhost:${PORT}`);
    console.log(`📖 Interactive API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`⚡ Real-Time WebSockets: Active`);
    console.log(`🤖 AI Engine: ${getAiStatus()}`);
    console.log(`======================================================\n`);
  });
});
