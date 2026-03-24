require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Config
const { PORT, CORS_ORIGIN, NODE_ENV } = require('./src/config/env');

// Middleware
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const foodRoutes = require('./src/routes/foodRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const volunteerRoutes = require('./src/routes/volunteerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Services
const { startExpiryJob } = require('./src/services/cronJobs');

// Database (import to trigger connection test)
require('./src/config/db');

const app = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FoodLink API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Database debug route
app.get('/api/test-db', async (req, res) => {
  const db = require('./src/config/db');
  try {
    const [ping] = await db.execute('SELECT 1 AS connected');
    const [tables] = await db.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    const tableCounts = {};
    for (const table of tableNames) {
      const [rows] = await db.execute(`SELECT COUNT(*) AS count FROM \`${table}\``);
      tableCounts[table] = rows[0].count;
    }

    res.json({
      success: true,
      message: 'Database connected',
      database: process.env.DB_NAME,
      tables: tableCounts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler (Express 5 requires named wildcard)
app.use('{*any}', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║       🍽️  FoodLink API Server           ║
  ║                                          ║
  ║   Environment : ${NODE_ENV.padEnd(22)}║
  ║   Port        : ${String(PORT).padEnd(22)}║
  ║   CORS Origin : ${CORS_ORIGIN.padEnd(22)}║
  ║                                          ║
  ║   API Base    : http://localhost:${PORT}/api ║
  ╚══════════════════════════════════════════╝
  `);

  // Start cron jobs
  startExpiryJob();
});

module.exports = app;
