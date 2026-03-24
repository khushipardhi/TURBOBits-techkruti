const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * JWT authentication middleware
 * Extracts token from Authorization header, verifies it, and attaches user to req
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid token.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { user_id, role, name, email, pin_code }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token has expired. Please login again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

module.exports = authenticate;
