const express = require('express');
const db = require('../config/db');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createFoodSchema, validate } = require('../middleware/validator');
const { updateTrustScore } = require('../services/trustService');

const router = express.Router();

// ==================== GET ALL AVAILABLE FOOD ====================
// Public — NGOs browse this feed
router.get('/available', authenticate, async (req, res, next) => {
  try {
    const [listings] = await db.execute(
      `SELECT f.*, u.name AS donor_name, u.phone AS donor_phone, u.trust_score AS donor_trust
       FROM food_listings f
       JOIN users u ON f.donor_id = u.user_id
       WHERE f.status = 'AVAILABLE' AND f.expires_at > NOW()
       ORDER BY f.created_at DESC`
    );
    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
});

// ==================== GET DONOR'S OWN LISTINGS ====================
router.get('/my-listings', authenticate, authorize('DONOR'), async (req, res, next) => {
  try {
    const [listings] = await db.execute(
      `SELECT * FROM food_listings WHERE donor_id = ? ORDER BY created_at DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
});

// ==================== CREATE FOOD LISTING ====================
router.post('/', authenticate, authorize('DONOR'), createFoodSchema, validate, async (req, res, next) => {
  try {
    const { food_type, description, quantity, unit = 'servings', hygiene_confirmed, pickup_address } = req.body;
    const donor_id = req.user.user_id;

    // Get donor's address as fallback
    const [donor] = await db.execute('SELECT address FROM users WHERE user_id = ?', [donor_id]);
    const address = pickup_address || (donor[0] && donor[0].address) || null;

    // Expires in 2 hours
    const [result] = await db.execute(
      `INSERT INTO food_listings 
       (donor_id, food_type, description, quantity, unit, hygiene_confirmed, pickup_address, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))`,
      [donor_id, food_type, description, quantity, unit, hygiene_confirmed, address]
    );

    // Fetch the created listing with donor info
    const [created] = await db.execute(
      `SELECT f.*, u.name AS donor_name FROM food_listings f JOIN users u ON f.donor_id = u.user_id WHERE f.food_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Food listing created. Expires in 2 hours.',
      data: created[0],
    });
  } catch (err) {
    next(err);
  }
});

// ==================== GET SINGLE LISTING ====================
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const [listings] = await db.execute(
      `SELECT f.*, u.name AS donor_name, u.phone AS donor_phone
       FROM food_listings f
       JOIN users u ON f.donor_id = u.user_id
       WHERE f.food_id = ?`,
      [req.params.id]
    );
    if (listings.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    res.json({ success: true, data: listings[0] });
  } catch (err) {
    next(err);
  }
});

// ==================== CANCEL LISTING (DONOR) ====================
router.patch('/:id/cancel', authenticate, authorize('DONOR'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [listing] = await db.execute(
      'SELECT * FROM food_listings WHERE food_id = ? AND donor_id = ?',
      [id, req.user.user_id]
    );
    if (listing.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found or unauthorized.' });
    }
    if (!['AVAILABLE', 'REQUESTED'].includes(listing[0].status)) {
      return res.status(400).json({ success: false, error: 'Cannot cancel listing in current status.' });
    }

    await db.execute("UPDATE food_listings SET status = 'CANCELLED' WHERE food_id = ?", [id]);

    // Cancel pending requests
    await db.execute(
      "UPDATE food_requests SET request_status = 'CANCELLED' WHERE food_id = ? AND request_status IN ('PENDING', 'APPROVED')",
      [id]
    );

    res.json({ success: true, message: 'Listing cancelled.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
