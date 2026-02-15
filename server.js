import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './backend/database/db.js';
import authRoutes from './backend/routes/authRoutes.js';
import userRoutes from './backend/routes/userRoutes.js';
import residentRoutes from './backend/routes/residentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from:
    // 1. Development: localhost and 127.0.0.1 on any port
    // 2. Electron file:// protocol (origin is 'null' string or undefined)
    // 3. No origin (mobile, Electron, curl requests): allow
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:5173',
      'http://localhost:3000',  // Express server itself
      'http://127.0.0.1:3000',
      'http://localhost:5174', // Alternative Vite port
      'http://127.0.0.1:5174',
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/, // Dynamic localhost ports
    ];

    // If in development mode, be more permissive
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Allow null origin (file:// protocol in Electron sends 'null' string)
    // Also allow undefined/empty origin (curl, mobile apps, etc)
    if (!origin || origin === 'null' || allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/residents', residentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ulevha API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  
  const statusCode = err.status || 500;
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║     🚀 Ulevha API Server Started              ║
╠═══════════════════════════════════════════════╣
║ URL:         http://localhost:${PORT}${PORT.toString().length === 4 ? '  ' : ' '}║
║ Environment: ${(process.env.NODE_ENV || 'development').padEnd(29)}║
║ CORS:        ✓ Enabled                        ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.close((err) => {
      if (err) console.error('Database close error:', err);
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});
