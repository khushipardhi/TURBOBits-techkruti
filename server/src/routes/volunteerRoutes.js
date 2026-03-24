const express = require('express');
const db = require('../config/db');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { updateTrustScore } = require('../services/trustService');

const router = express.Router();

// ==================== GET AVAILABLE TASKS ====================
router.get('/available-tasks', authenticate, authorize('VOLUNTEER'), async (req, res, next) => {
  try {
    // Show approved requests that have no delivery assignment yet
    const [tasks] = await db.execute(
      `SELECT fr.request_id, fr.food_id, fr.receiver_id,
              f.description AS food_description, f.quantity, f.food_type, f.pickup_address, f.expires_at,
              donor.name AS donor_name, donor.phone AS donor_phone, donor.address AS donor_address,
              receiver.name AS receiver_name, receiver.phone AS receiver_phone, receiver.address AS receiver_address
       FROM food_requests fr
       JOIN food_listings f ON fr.food_id = f.food_id
       JOIN users donor ON f.donor_id = donor.user_id
       JOIN users receiver ON fr.receiver_id = receiver.user_id
       WHERE fr.request_status = 'APPROVED'
         AND NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.request_id = fr.request_id)
         AND f.expires_at > NOW()
       ORDER BY f.expires_at ASC`
    );
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

// ==================== ACCEPT TASK (VOLUNTEER) ====================
router.post('/accept-task', authenticate, authorize('VOLUNTEER'), async (req, res, next) => {
  try {
    const { request_id } = req.body;
    const volunteer_id = req.user.user_id;

    // Verify request is approved and has no delivery yet
    const [requests] = await db.execute(
      `SELECT fr.request_id FROM food_requests fr
       WHERE fr.request_id = ? AND fr.request_status = 'APPROVED'
         AND NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.request_id = fr.request_id)`,
      [request_id]
    );
    if (requests.length === 0) {
      return res.status(400).json({ success: false, error: 'Task is no longer available.' });
    }

    // Create delivery
    const [result] = await db.execute(
      'INSERT INTO deliveries (request_id, volunteer_id) VALUES (?, ?)',
      [request_id, volunteer_id]
    );

    // Update delivery partner availability
    await db.execute(
      'UPDATE delivery_partners SET is_available = FALSE WHERE partner_id = ?',
      [volunteer_id]
    );

    const [delivery] = await db.execute('SELECT * FROM deliveries WHERE delivery_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Task accepted! Please pick up the food.',
      data: delivery[0],
    });
  } catch (err) {
    next(err);
  }
});

// ==================== GET MY TASKS (VOLUNTEER) ====================
router.get('/my-tasks', authenticate, authorize('VOLUNTEER'), async (req, res, next) => {
  try {
    const [tasks] = await db.execute(
      `SELECT d.*, fr.food_id, fr.receiver_id,
              f.description AS food_description, f.quantity, f.food_type, f.pickup_address,
              donor.name AS donor_name, donor.phone AS donor_phone, donor.address AS donor_address,
              receiver.name AS receiver_name, receiver.phone AS receiver_phone, receiver.address AS receiver_address
       FROM deliveries d
       JOIN food_requests fr ON d.request_id = fr.request_id
       JOIN food_listings f ON fr.food_id = f.food_id
       JOIN users donor ON f.donor_id = donor.user_id
       JOIN users receiver ON fr.receiver_id = receiver.user_id
       WHERE d.volunteer_id = ?
       ORDER BY d.assigned_at DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

// ==================== CONFIRM PICKUP ====================
router.patch('/:id/pickup', authenticate, authorize('VOLUNTEER'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [delivery] = await db.execute(
      "SELECT * FROM deliveries WHERE delivery_id = ? AND volunteer_id = ? AND status = 'ASSIGNED'",
      [id, req.user.user_id]
    );
    if (delivery.length === 0) {
      return res.status(404).json({ success: false, error: 'Delivery not found or invalid status.' });
    }

    await db.execute(
      "UPDATE deliveries SET status = 'PICKED_UP', picked_up_at = NOW() WHERE delivery_id = ?",
      [id]
    );

    // Trust: pickup complete for volunteer
    await updateTrustScore(req.user.user_id, 'PICKUP_COMPLETE');

    res.json({ success: true, message: 'Pickup confirmed.' });
  } catch (err) {
    next(err);
  }
});

// ==================== CONFIRM DELIVERY ====================
router.patch('/:id/deliver', authenticate, authorize('VOLUNTEER'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [delivery] = await db.execute(
      "SELECT d.*, fr.food_id, fr.receiver_id, f.donor_id FROM deliveries d JOIN food_requests fr ON d.request_id = fr.request_id JOIN food_listings f ON fr.food_id = f.food_id WHERE d.delivery_id = ? AND d.volunteer_id = ? AND d.status = 'PICKED_UP'",
      [id, req.user.user_id]
    );
    if (delivery.length === 0) {
      return res.status(404).json({ success: false, error: 'Delivery not found or invalid status.' });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Mark delivery as complete
      await conn.execute(
        "UPDATE deliveries SET status = 'DELIVERED', delivered_at = NOW() WHERE delivery_id = ?",
        [id]
      );

      // Mark request as fulfilled
      await conn.execute(
        "UPDATE food_requests SET request_status = 'FULFILLED' WHERE request_id = ?",
        [delivery[0].request_id]
      );

      // Mark food as fulfilled
      await conn.execute(
        "UPDATE food_listings SET status = 'FULFILLED' WHERE food_id = ?",
        [delivery[0].food_id]
      );

      // Free volunteer
      await conn.execute(
        'UPDATE delivery_partners SET is_available = TRUE, total_deliveries = total_deliveries + 1 WHERE partner_id = ?',
        [req.user.user_id]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // Trust updates (outside transaction for resilience)
    try {
      await updateTrustScore(req.user.user_id, 'DELIVERY_COMPLETE');
      await updateTrustScore(delivery[0].donor_id, 'DONATION_COMPLETE');
    } catch (trustErr) {
      console.error('Trust score update failed:', trustErr.message);
    }

    res.json({ success: true, message: 'Delivery confirmed! Thank you for volunteering.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
