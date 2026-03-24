const db = require('../config/db');

const TRUST_DELTAS = {
  DONATION_COMPLETE: 0.25,
  PICKUP_COMPLETE: 0.25,
  DELIVERY_COMPLETE: 0.25,
  NO_SHOW: -0.50,
  CANCELLED: -0.25,
  REPORTED: -1.00,
};

/**
 * Update a user's trust score and log the change
 * @param {number} userId
 * @param {string} action - one of TRUST_DELTAS keys
 */
async function updateTrustScore(userId, action) {
  const delta = TRUST_DELTAS[action];
  if (delta === undefined) throw new Error(`Invalid trust action: ${action}`);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get current score
    const [rows] = await conn.execute(
      'SELECT trust_score FROM users WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) throw new Error('User not found');

    // Clamp between 0.00 and 10.00
    const currentScore = parseFloat(rows[0].trust_score);
    const newScore = Math.min(10.00, Math.max(0.00, currentScore + delta));

    // Update user
    await conn.execute(
      'UPDATE users SET trust_score = ? WHERE user_id = ?',
      [newScore, userId]
    );

    // Log
    await conn.execute(
      'INSERT INTO trust_logs (user_id, action, delta, new_score) VALUES (?, ?, ?, ?)',
      [userId, action, delta, newScore]
    );

    await conn.commit();
    return { userId, action, delta, newScore };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { updateTrustScore, TRUST_DELTAS };
