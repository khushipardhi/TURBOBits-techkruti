/**
 * PROTOTYPE MODE: Authentication is DISABLED.
 * The middleware injects a default demo user so routes don't break.
 * To re-enable JWT auth, restore the original jwt.verify() logic here.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const authenticate = (req, res, next) => {
  // Try to read a real JWT token if provided (so login still works)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Token invalid — fallback to demo user in prototype mode
    }
  }

  // Prototype fallback: inject a default user so all routes function
  req.user = {
    user_id: 1,
    role: 'DONOR',
    name: 'Demo User',
    email: 'demo@foodlink.app',
  };
  next();
};

module.exports = authenticate;
