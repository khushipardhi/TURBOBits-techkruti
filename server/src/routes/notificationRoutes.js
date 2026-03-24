const express = require('express');
const webpush = require('web-push');
const authenticate = require('../middleware/auth');

const router = express.Router();

// ============================================================
// VAPID Keys — must be set in Render Environment Variables:
//   VAPID_PUBLIC_KEY  = BK2Fl1jQ43gySP6hWN8Dr9hk_P5_ky62tFlL7FjkunCYhwDaoVjLw1VgWX4Gd8zAaDOxK7hrczsxaHn6LF-gDKQ
//   VAPID_PRIVATE_KEY = SdRuCOjxoV2khcsj2wbby6CRs3BKqx290riA_URmVCA
// ============================================================
const publicVapidKey =
  process.env.VAPID_PUBLIC_KEY ||
  'BK2Fl1jQ43gySP6hWN8Dr9hk_P5_ky62tFlL7FjkunCYhwDaoVjLw1VgWX4Gd8zAaDOxK7hrczsxaHn6LF-gDKQ';
const privateVapidKey =
  process.env.VAPID_PRIVATE_KEY ||
  'SdRuCOjxoV2khcsj2wbby6CRs3BKqx290riA_URmVCA';

console.log('[Push] Configuring web-push VAPID with public key:', publicVapidKey.slice(0, 20) + '...');

webpush.setVapidDetails(
  'mailto:test@example.com',
  publicVapidKey,
  privateVapidKey
);

// IN-MEMORY STORAGE (MVP workaround strictly for Hackathon testing)
// DO NOT USE IN PRODUCTION without a Database (see DB Schema suggestions)
if (!global.pushSubscriptions) {
  global.pushSubscriptions = [];
}

// ==================== SUBSCRIBE ====================
router.post('/subscribe', authenticate, (req, res) => {
  const { subscription } = req.body;
  
  if (!subscription) {
    return res.status(400).json({ success: false, error: 'No subscription object provided' });
  }

  // Save subscription in memory linked to user
  const subData = {
    userId: req.user.user_id,
    role: req.user.role,
    subscription
  };

  // Prevent duplicates
  global.pushSubscriptions = global.pushSubscriptions.filter(s => s.subscription.endpoint !== subscription.endpoint);
  global.pushSubscriptions.push(subData);

  res.status(201).json({ success: true, message: 'Subscribed to push notifications' });
});

// ==================== TRIGGER HELPERS ====================

// Helper function to send notification to specific role or user
async function notifyRole(role, payload) {
  const targets = global.pushSubscriptions.filter(s => s.role === role);
  
  const promises = targets.map(sub => 
    webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(err => {
      console.error('Push error:', err);
      if (err.statusCode === 410) {
        // Remove expired subscription
        global.pushSubscriptions = global.pushSubscriptions.filter(s => s.subscription.endpoint !== sub.subscription.endpoint);
      }
    })
  );

  await Promise.allSettled(promises);
}

async function notifyUser(userId, payload) {
  const targets = global.pushSubscriptions.filter(s => s.userId === userId);
  
  const promises = targets.map(sub => 
    webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(err => console.error(err))
  );

  await Promise.allSettled(promises);
}

// Export helpers to use in other routes (foodRoutes, requestRoutes)
module.exports = {
  router,
  notifyRole,
  notifyUser
};
