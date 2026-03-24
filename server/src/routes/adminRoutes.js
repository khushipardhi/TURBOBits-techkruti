const express = require('express');
const db = require('../config/db');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// ==================== DASHBOARD STATS ====================
router.get('/stats', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ activeDonors }]] = await db.execute("SELECT COUNT(*) AS activeDonors FROM users WHERE role = 'DONOR' AND is_active = TRUE");
    const [[{ activeReceivers }]] = await db.execute("SELECT COUNT(*) AS activeReceivers FROM users WHERE role = 'RECEIVER' AND is_active = TRUE");
    const [[{ activeVolunteers }]] = await db.execute("SELECT COUNT(*) AS activeVolunteers FROM users WHERE role = 'VOLUNTEER' AND is_active = TRUE");
    const [[{ totalListings }]] = await db.execute('SELECT COUNT(*) AS totalListings FROM food_listings');
    const [[{ availableNow }]] = await db.execute("SELECT COUNT(*) AS availableNow FROM food_listings WHERE status = 'AVAILABLE' AND expires_at > NOW()");
    const [[{ fulfilledTotal }]] = await db.execute("SELECT COUNT(*) AS fulfilledTotal FROM food_listings WHERE status = 'FULFILLED'");
    const [[{ totalMealsSaved }]] = await db.execute("SELECT COALESCE(SUM(quantity), 0) AS totalMealsSaved FROM food_listings WHERE status = 'FULFILLED'");
    const [[{ totalDeliveries }]] = await db.execute("SELECT COUNT(*) AS totalDeliveries FROM deliveries WHERE status = 'DELIVERED'");
    const [[{ trustIssues }]] = await db.execute('SELECT COUNT(*) AS trustIssues FROM users WHERE trust_score < 4.0 AND is_active = TRUE');

    // Approximate CO2 saved: ~2.5 kg per meal (industry average for food waste prevention)
    const co2Saved = (parseFloat(totalMealsSaved) * 2.5).toFixed(1);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsers),
        activeDonors: parseInt(activeDonors),
        activeReceivers: parseInt(activeReceivers),
        activeVolunteers: parseInt(activeVolunteers),
        totalListings: parseInt(totalListings),
        availableNow: parseInt(availableNow),
        fulfilledTotal: parseInt(fulfilledTotal),
        totalMealsSaved: parseInt(totalMealsSaved),
        totalDeliveries: parseInt(totalDeliveries),
        co2Saved: parseFloat(co2Saved),
        trustIssues: parseInt(trustIssues),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ==================== ALL USERS ====================
router.get('/users', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT user_id, role, name, phone, email, trust_score, is_active, is_verified, created_at FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) AS total FROM users';
    const countParams = [];
    if (role) {
      countQuery += ' WHERE role = ?';
      countParams.push(role);
    }
    const [[{ total }]] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(total) },
    });
  } catch (err) {
    next(err);
  }
});

// ==================== BAN/UNBAN USER ====================
router.patch('/users/:id/toggle-status', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [user] = await db.execute('SELECT user_id, is_active, role FROM users WHERE user_id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    if (user[0].role === 'ADMIN') {
      return res.status(400).json({ success: false, error: 'Cannot modify admin accounts.' });
    }

    const newStatus = !user[0].is_active;
    await db.execute('UPDATE users SET is_active = ? WHERE user_id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully.`,
    });
  } catch (err) {
    next(err);
  }
});

// ==================== TRUST LOGS ====================
router.get('/trust-logs', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const [logs] = await db.execute(
      `SELECT tl.*, u.name AS user_name, u.role AS user_role
       FROM trust_logs tl
       JOIN users u ON tl.user_id = u.user_id
       ORDER BY tl.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

// ==================== ALL FOOD LISTINGS (ADMIN VIEW) ====================
router.get('/food-listings', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT f.*, u.name AS donor_name FROM food_listings f JOIN users u ON f.donor_id = u.user_id`;
    const params = [];

    if (status) {
      query += ' WHERE f.status = ?';
      params.push(status);
    }

    query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [listings] = await db.execute(query, params);
    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
