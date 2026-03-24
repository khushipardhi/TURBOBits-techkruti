const cron = require('node-cron');
const db = require('../config/db');
const { updateTrustScore } = require('./trustService');

/**
 * Cron job: runs every 5 minutes
 * Expires food listings that are past their expires_at timestamp
 */
function startExpiryJob() {
  // Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Find listings that should be expired
      const [listings] = await db.execute(
        `SELECT food_id, donor_id FROM food_listings 
         WHERE status = 'AVAILABLE' AND expires_at < NOW()`
      );

      if (listings.length === 0) return;

      console.log(`⏰ Expiring ${listings.length} food listing(s)...`);

      for (const listing of listings) {
        // Mark as expired
        await db.execute(
          `UPDATE food_listings SET status = 'EXPIRED' WHERE food_id = ?`,
          [listing.food_id]
        );

        // Cancel any pending requests for this listing
        await db.execute(
          `UPDATE food_requests SET request_status = 'CANCELLED' 
           WHERE food_id = ? AND request_status = 'PENDING'`,
          [listing.food_id]
        );
      }

      console.log(`✅ Expired ${listings.length} listing(s) successfully`);
    } catch (err) {
      console.error('❌ Expiry cron error:', err.message);
    }
  });

  console.log('⏰ Food expiry cron job started (every 5 minutes)');
}

module.exports = { startExpiryJob };
