const express = require('express');
const db = require('../config/db');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createRequestSchema, validate } = require('../middleware/validator');
const { updateTrustScore } = require('../services/trustService');

const router = express.Router();

// ==================== CLAIM FOOD (RECEIVER) ====================
router.post('/claim', authenticate, authorize('RECEIVER'), createRequestSchema, validate, async (req, res, next) => {
  try {
    const { food_id } = req.body;
    const receiver_id = req.user.user_id;

    // Verify food is available
    const [food] = await db.execute(
      "SELECT * FROM food_listings WHERE food_id = ? AND status = 'AVAILABLE' AND expires_at > NOW()",
      [food_id]
    );
    if (food.length === 0) {
      return res.status(400).json({ success: false, error: 'Food is no longer available or has expired.' });
    }

    // Check if receiver already has a pending request for this food
    const [existing] = await db.execute(
      "SELECT request_id FROM food_requests WHERE food_id = ? AND receiver_id = ? AND request_status = 'PENDING'",
      [food_id, receiver_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'You have already claimed this food.' });
    }

    // Create request
    const [result] = await db.execute(
      'INSERT INTO food_requests (food_id, receiver_id) VALUES (?, ?)',
      [food_id, receiver_id]
    );

    // Update food status to REQUESTED
    await db.execute("UPDATE food_listings SET status = 'REQUESTED' WHERE food_id = ?", [food_id]);

    const [created] = await db.execute('SELECT * FROM food_requests WHERE request_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Food claimed. Waiting for donor approval.',
      data: created[0],
    });
  } catch (err) {
    next(err);
  }
});

// ==================== GET RECEIVER'S REQUESTS ====================
router.get('/my-requests', authenticate, authorize('RECEIVER'), async (req, res, next) => {
  try {
    const [requests] = await db.execute(
      `SELECT fr.*, 
              f.description AS food_description, f.food_type, f.quantity, f.unit, f.expires_at,
              f.pickup_address,
              u.name AS donor_name,
              d.status AS delivery_status, d.delivery_id,
              d.picked_up_at, d.delivered_at,
              v.name AS volunteer_name
       FROM food_requests fr
       JOIN food_listings f ON fr.food_id = f.food_id
       JOIN users u ON f.donor_id = u.user_id
       LEFT JOIN deliveries d ON d.request_id = fr.request_id
       LEFT JOIN users v ON d.volunteer_id = v.user_id
       WHERE fr.receiver_id = ?
       ORDER BY fr.requested_at DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// ==================== GET DONOR'S INCOMING REQUESTS ====================
router.get('/incoming', authenticate, authorize('DONOR'), async (req, res, next) => {
  try {
    const [requests] = await db.execute(
      `SELECT fr.*, 
              f.description AS food_description, f.food_type, f.quantity, f.unit, f.expires_at,
              u.name AS receiver_name, u.phone AS receiver_phone, u.trust_score AS receiver_trust,
              d.status AS delivery_status, d.delivery_id,
              v.name AS volunteer_name
       FROM food_requests fr
       JOIN food_listings f ON fr.food_id = f.food_id
       JOIN users u ON fr.receiver_id = u.user_id
       LEFT JOIN deliveries d ON d.request_id = fr.request_id
       LEFT JOIN users v ON d.volunteer_id = v.user_id
       WHERE f.donor_id = ?
       ORDER BY fr.requested_at DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// ==================== ACCEPT REQUEST (DONOR) ====================
router.patch('/:id/accept', authenticate, authorize('DONOR'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify this request belongs to donor's food
    const [requests] = await db.execute(
      `SELECT fr.*, f.donor_id FROM food_requests fr
       JOIN food_listings f ON fr.food_id = f.food_id
       WHERE fr.request_id = ? AND f.donor_id = ? AND fr.request_status = 'PENDING'`,
      [id, req.user.user_id]
    );
    if (requests.length === 0) {
      return res.status(404).json({ success: false, error: 'Request not found or already processed.' });
    }

    // Accept request
    await db.execute(
      "UPDATE food_requests SET request_status = 'APPROVED', responded_at = NOW() WHERE request_id = ?",
      [id]
    );

    // Update food status to ACCEPTED
    await db.execute(
      "UPDATE food_listings SET status = 'ACCEPTED' WHERE food_id = ?",
      [requests[0].food_id]
    );

    // Reject other pending requests for same food
    await db.execute(
      "UPDATE food_requests SET request_status = 'REJECTED', responded_at = NOW() WHERE food_id = ? AND request_id != ? AND request_status = 'PENDING'",
      [requests[0].food_id, id]
    );

    res.json({ success: true, message: 'Request accepted. Volunteer will be assigned.' });
  } catch (err) {
    next(err);
  }
});

// ==================== REJECT REQUEST (DONOR) ====================
router.patch('/:id/reject', authenticate, authorize('DONOR'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [requests] = await db.execute(
      `SELECT fr.*, f.donor_id FROM food_requests fr
       JOIN food_listings f ON fr.food_id = f.food_id
       WHERE fr.request_id = ? AND f.donor_id = ? AND fr.request_status = 'PENDING'`,
      [id, req.user.user_id]
    );
    if (requests.length === 0) {
      return res.status(404).json({ success: false, error: 'Request not found or already processed.' });
    }

    await db.execute(
      "UPDATE food_requests SET request_status = 'REJECTED', responded_at = NOW() WHERE request_id = ?",
      [id]
    );

    // Check if any other pending requests exist for this food
    const [otherPending] = await db.execute(
      "SELECT request_id FROM food_requests WHERE food_id = ? AND request_status = 'PENDING'",
      [requests[0].food_id]
    );

    // If no other pending requests, set food back to AVAILABLE
    if (otherPending.length === 0) {
      await db.execute(
        "UPDATE food_listings SET status = 'AVAILABLE' WHERE food_id = ?",
        [requests[0].food_id]
      );
    }

    res.json({ success: true, message: 'Request rejected.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
