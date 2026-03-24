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
const { router: notificationRoutes } = require('./src/routes/notificationRoutes');

// Services
const { startExpiryJob } = require('./src/services/cronJobs');

// Database (import to trigger connection test)
require('./src/config/db');

const app = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS - dynamically allow any origin (Hackathon friendly)
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
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

// Public impact stats (no auth, for landing page)
app.get('/api/stats', async (req, res) => {
  try {
    const db = require('./src/config/db');
    const [[{ totalMeals }]] = await db.execute("SELECT COALESCE(SUM(quantity), 0) AS totalMeals FROM food_listings WHERE status = 'FULFILLED'");
    const [[{ totalDonations }]] = await db.execute("SELECT COUNT(*) AS totalDonations FROM food_listings WHERE status = 'FULFILLED'");
    const [[{ totalDonors }]] = await db.execute("SELECT COUNT(*) AS totalDonors FROM users WHERE role = 'DONOR' AND is_active = TRUE");
    const [[{ totalNGOs }]] = await db.execute("SELECT COUNT(*) AS totalNGOs FROM users WHERE role = 'RECEIVER' AND is_active = TRUE");
    const [[{ totalVolunteers }]] = await db.execute("SELECT COUNT(*) AS totalVolunteers FROM users WHERE role = 'VOLUNTEER' AND is_active = TRUE");
    res.json({
      success: true,
      data: {
        meals_saved: parseInt(totalMeals),
        total_donations: parseInt(totalDonations),
        co2_prevented_kg: (parseFloat(totalMeals) * 2.5).toFixed(0),
        active_donors: parseInt(totalDonors),
        active_ngos: parseInt(totalNGOs),
        active_volunteers: parseInt(totalVolunteers),
      }
    });
  } catch (err) {
    res.json({ success: true, data: { meals_saved: 0, total_donations: 0, co2_prevented_kg: '0', active_donors: 0, active_ngos: 0, active_volunteers: 0 } });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

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
